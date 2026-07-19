import { UnauthorizedException } from "@nestjs/common";
import { createPublicKey, verify } from "node:crypto";

import type { IdentityRequest, IdentityVerifier } from "./identity-verifier";
import { ramaRoles, type RamaActor, type RamaRole } from "./rama-actor";

type JwtHeader = { alg?: unknown; kid?: unknown; typ?: unknown; crit?: unknown };
type JwtClaims = Record<string, unknown>;

export type OidcIdentityConfiguration = {
  issuer: string;
  audience: string;
  roleClaim: string;
  organizationClaim: string;
  acceptedMfaAcrValues: string[];
  requireStaffMfa: boolean;
  clockToleranceSeconds: number;
  maximumTokenAgeSeconds: number;
};

export type TrustedJwk = JsonWebKey & {
  kid?: string;
  use?: string;
  alg?: string;
};

export interface JwksProvider {
  getKey(kid: string): Promise<TrustedJwk>;
}

type CachedJwks = { keys: TrustedJwk[]; expiresAt: number };

export class RemoteJwksProvider implements JwksProvider {
  private cache: CachedJwks | null = null;
  private loading: Promise<CachedJwks> | null = null;

  constructor(
    private readonly uri: URL,
    private readonly timeoutMs = 5_000,
    private readonly fallbackCacheMs = 300_000,
  ) {}

  async getKey(kid: string): Promise<TrustedJwk> {
    let jwks = await this.load(false);
    let key = this.find(jwks.keys, kid);
    if (!key) {
      jwks = await this.load(true);
      key = this.find(jwks.keys, kid);
    }
    if (!key) throw new Error("The token signing key is not present in the trusted JWKS.");
    return key;
  }

  private find(keys: TrustedJwk[], kid: string): TrustedJwk | undefined {
    return keys.find(
      (key) =>
        key.kid === kid &&
        key.kty === "RSA" &&
        (!key.use || key.use === "sig") &&
        (!key.alg || key.alg === "RS256"),
    );
  }

  private async load(force: boolean): Promise<CachedJwks> {
    if (!force && this.cache && this.cache.expiresAt > Date.now()) return this.cache;
    if (!force && this.loading) return this.loading;
    const task = this.fetchJwks();
    this.loading = task;
    try {
      this.cache = await task;
      return this.cache;
    } finally {
      this.loading = null;
    }
  }

  private async fetchJwks(): Promise<CachedJwks> {
    const response = await fetch(this.uri, {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) throw new Error(`Trusted JWKS returned HTTP ${response.status}.`);
    const body = (await response.json()) as { keys?: unknown };
    if (!Array.isArray(body.keys) || body.keys.length === 0 || body.keys.length > 20) {
      throw new Error("Trusted JWKS did not contain a bounded key set.");
    }
    const keys = body.keys.filter(
      (key): key is TrustedJwk => Boolean(key && typeof key === "object"),
    );
    const maxAge = response.headers.get("cache-control")?.match(/(?:^|,)\s*max-age=(\d+)/i)?.[1];
    const cacheMs = maxAge
      ? Math.min(Math.max(Number(maxAge) * 1_000, 30_000), 3_600_000)
      : this.fallbackCacheMs;
    return { keys, expiresAt: Date.now() + cacheMs };
  }
}

export class OidcJwtIdentityVerifier implements IdentityVerifier {
  constructor(
    private readonly configuration: OidcIdentityConfiguration,
    private readonly jwks: JwksProvider,
    private readonly now: () => number = () => Math.floor(Date.now() / 1_000),
  ) {}

  async authenticate(request: IdentityRequest): Promise<RamaActor> {
    const authorization = this.single(request.headers.authorization);
    if (!authorization?.startsWith("Bearer ")) throw this.unauthorized();
    const token = authorization.slice(7);
    if (!token || token.length > 16_384) throw this.unauthorized();

    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("JWT must have three parts.");
      const [encodedHeader, encodedClaims, encodedSignature] = parts;
      if (!encodedHeader || !encodedClaims || !encodedSignature) throw new Error("JWT is incomplete.");
      const header = this.decode<JwtHeader>(encodedHeader);
      const claims = this.decode<JwtClaims>(encodedClaims);
      if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid) {
        throw new Error("JWT algorithm or key id is invalid.");
      }
      if (header.crit !== undefined) throw new Error("Critical JWT extensions are not accepted.");
      const jwk = await this.jwks.getKey(header.kid);
      const key = createPublicKey({ key: jwk, format: "jwk" });
      const validSignature = verify(
        "RSA-SHA256",
        Buffer.from(`${encodedHeader}.${encodedClaims}`, "ascii"),
        key,
        Buffer.from(encodedSignature, "base64url"),
      );
      if (!validSignature) throw new Error("JWT signature is invalid.");
      return this.actorFromClaims(claims);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw this.unauthorized();
    }
  }

  private actorFromClaims(claims: JwtClaims): RamaActor {
    const now = this.now();
    const tolerance = this.configuration.clockToleranceSeconds;
    if (claims.iss !== this.configuration.issuer) throw new Error("Issuer mismatch.");
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(this.configuration.audience)) throw new Error("Audience mismatch.");
    if (typeof claims.sub !== "string" || claims.sub.length < 2 || claims.sub.length > 200) {
      throw new Error("Subject is invalid.");
    }
    if (typeof claims.exp !== "number" || claims.exp <= now - tolerance) throw new Error("Token expired.");
    if (typeof claims.nbf === "number" && claims.nbf > now + tolerance) throw new Error("Token not active.");
    if (typeof claims.iat !== "number" || claims.iat > now + tolerance) throw new Error("Issued-at is invalid.");
    if (now - claims.iat > this.configuration.maximumTokenAgeSeconds + tolerance) {
      throw new Error("Token is too old.");
    }

    const rawRoles = claims[this.configuration.roleClaim];
    const roleValues = (Array.isArray(rawRoles) ? rawRoles : [rawRoles]).filter(
      (role): role is string => typeof role === "string",
    );
    const roles = [...new Set(roleValues.filter((role) => ramaRoles.includes(role as RamaRole)))];
    if (roles.length !== 1) throw new Error("Exactly one trusted RAMA role is required.");
    const role = roles[0] as RamaRole;

    const amr = (Array.isArray(claims.amr) ? claims.amr : [claims.amr]).filter(
      (value): value is string => typeof value === "string",
    );
    const mfaAuthenticated =
      amr.includes("mfa") ||
      (typeof claims.acr === "string" &&
        this.configuration.acceptedMfaAcrValues.includes(claims.acr));
    const staffRole = ["evidence_analyst", "evidence_lead", "advisor"].includes(role);
    if (this.configuration.requireStaffMfa && staffRole && !mfaAuthenticated) {
      throw new UnauthorizedException({
        code: "AUTH_MFA_REQUIRED",
        message: "A recent MFA-authenticated staff session is required.",
      });
    }

    const organization = claims[this.configuration.organizationClaim];
    const organizationId = typeof organization === "string" && organization.trim() ? organization : null;
    if (role === "partner" && !organizationId) throw new Error("Partner organization is required.");
    return {
      id: claims.sub,
      role,
      authenticationMethod: "oidc",
      mfaAuthenticated,
      organizationId,
      sessionId: typeof claims.sid === "string" ? claims.sid : null,
    };
  }

  private decode<T>(value: string): T {
    if (value.length > 12_000) throw new Error("JWT segment is too large.");
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  }

  private single(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? (value.length === 1 ? value[0] : undefined) : value;
  }

  private unauthorized(): UnauthorizedException {
    return new UnauthorizedException({
      code: "AUTH_TOKEN_INVALID",
      message: "A valid OIDC access token is required.",
    });
  }
}
