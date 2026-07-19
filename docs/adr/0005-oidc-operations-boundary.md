# ADR 0005: OIDC operations identity boundary

- Status: Accepted
- Date: 18 July 2026

## Context

The Phase 0 staff API used caller-supplied identity and role headers. That seam was useful for local vertical slices but cannot establish identity, MFA or organization membership and must never be trusted in production. Direct browser-to-API calls would also expose bearer-token handling to application JavaScript and make CORS part of the privileged operations boundary.

## Decision

Authentication is implemented behind an `IdentityVerifier` port. Non-production defaults to a development verifier that requires explicit headers. Production defaults to OIDC and refuses to construct the development verifier.

The OIDC verifier accepts only bearer JWTs using RS256. It obtains RSA signing keys from one configured JWKS URL, rejects redirects, bounds and caches the key set, and refreshes once for key rotation. It verifies the signature before trusting claims and validates exact issuer, configured audience, subject, expiry, not-before, issued-at and maximum token age with bounded clock tolerance. It accepts exactly one known RAMA role. Staff roles require `amr=mfa` or an approved `acr`; partner identity requires an organization claim. Endpoint roles remain enforced by the global Nest guard after authentication.

Operator browsers use a same-origin Next.js BFF. The BFF exposes only an allowlist of evidence and resolution routes, validates origin on mutations, limits request bodies, and injects identity server-side. Production tokens are read from the HTTP-only, Secure, host-only `__Host-rama-operations-token` cookie and are never returned to client JavaScript. Development identity headers are added only by the server-side BFF/data loaders.

## Consequences

- Spoofed RAMA identity headers have no effect in OIDC mode.
- Wrong issuer/audience, expired/future/over-age tokens, algorithm substitution, signature tampering, missing MFA, ambiguous roles and unbound partner tokens fail closed.
- A fixed JWKS URL avoids selecting trust material from unverified token claims.
- Operations clients no longer need direct cross-origin API credentials.
- The selected identity provider or gateway must complete Authorization Code + PKCE, token refresh/revocation and issuance of the protected cookie.
- Central authentication success/failure audit events and partner-to-source relationship policies remain subsequent controls; application logs must never contain bearer tokens.
