import type { IdentityVerifier } from "./identity-verifier";
import { DevelopmentHeaderIdentityVerifier } from "./development-header-identity.verifier";
import {
  OidcJwtIdentityVerifier,
  RemoteJwksProvider,
  type OidcIdentityConfiguration,
} from "./oidc-jwt-identity.verifier";

export type IdentityMode = "development_headers" | "oidc";

export const resolveIdentityMode = (
  environment: NodeJS.ProcessEnv = process.env,
): IdentityMode => {
  const configured = environment.IDENTITY_MODE?.trim().toLowerCase();
  if (configured === "development_headers" || configured === "oidc") return configured;
  if (configured) throw new Error("IDENTITY_MODE must be 'development_headers' or 'oidc'.");
  return environment.NODE_ENV === "production" ? "oidc" : "development_headers";
};

const required = (environment: NodeJS.ProcessEnv, key: string): string => {
  const value = environment[key]?.trim();
  if (!value) throw new Error(`${key} is required in OIDC identity mode.`);
  return value;
};

const positiveInteger = (
  environment: NodeJS.ProcessEnv,
  key: string,
  fallback: number,
): number => {
  const value = Number(environment[key] ?? fallback);
  if (!Number.isInteger(value) || value < 1) throw new Error(`${key} must be a positive integer.`);
  return value;
};

export const createIdentityVerifier = (
  environment: NodeJS.ProcessEnv = process.env,
): IdentityVerifier => {
  const mode = resolveIdentityMode(environment);
  if (mode === "development_headers") {
    if (environment.NODE_ENV === "production") {
      throw new Error("Development identity headers are forbidden in production.");
    }
    return new DevelopmentHeaderIdentityVerifier();
  }

  const issuer = required(environment, "OIDC_ISSUER");
  const audience = required(environment, "OIDC_AUDIENCE");
  const jwksUri = new URL(required(environment, "OIDC_JWKS_URI"));
  if (environment.NODE_ENV === "production" && (new URL(issuer).protocol !== "https:" || jwksUri.protocol !== "https:")) {
    throw new Error("Production OIDC issuer and JWKS URLs must use HTTPS.");
  }
  const configuration: OidcIdentityConfiguration = {
    issuer,
    audience,
    roleClaim: environment.OIDC_ROLE_CLAIM?.trim() || "rama_roles",
    organizationClaim: environment.OIDC_ORGANIZATION_CLAIM?.trim() || "rama_org_id",
    acceptedMfaAcrValues: (environment.OIDC_MFA_ACR_VALUES ?? "urn:rama:loa:2")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    requireStaffMfa: environment.OIDC_REQUIRE_STAFF_MFA !== "false",
    clockToleranceSeconds: positiveInteger(environment, "OIDC_CLOCK_TOLERANCE_SECONDS", 30),
    maximumTokenAgeSeconds: positiveInteger(environment, "OIDC_MAX_TOKEN_AGE_SECONDS", 3_600),
  };
  return new OidcJwtIdentityVerifier(
    configuration,
    new RemoteJwksProvider(
      jwksUri,
      positiveInteger(environment, "OIDC_JWKS_TIMEOUT_MS", 5_000),
      positiveInteger(environment, "OIDC_JWKS_CACHE_MS", 300_000),
    ),
  );
};
