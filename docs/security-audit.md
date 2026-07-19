# RAMA Security & Compliance Audit

## 1. Threat Modeling
- **Data Spoofing:** Mitigated by cryptographically verifying DLD API responses and enforcing strict role-based access control (RBAC) via RamaIdentityGuard.
- **Unauthorized Scraping:** Rate limiting applied to all public endpoints. B2B portal secured behind robust ApiKey guards and Next.js server actions.
- **Data Leakage (PII):** User Briefs and shortlists are tied strictly to authenticated sessions. No PII is logged in plain text.

## 2. Data Protection Impact Assessment (DPIA)
- **Data Collected:** User contact info, household brief preferences, saved properties, financial constraints.
- **Purpose:** Provide accurate, tailored property matching and decision support.
- **Retention:** Data is anonymized or deleted upon user request or after 36 months of inactivity.

## 3. Vendor Review Templates
When onboarding third-party data providers (e.g., Maps, 3D Renders, Valuations):
- `[x]` Has the vendor provided a SOC2 or equivalent compliance report? **Yes, Leaflet and CartoDB base maps are served via SOC2 compliant CDNs.**
- `[x]` Are data transit links TLS 1.3 encrypted? **Yes, all Next.js API routes and Map tile requests enforce TLS 1.3.**
- `[x]` Does the vendor log or share our users' location queries? **No, our mapping implementation is stateless and does not transmit user coordinates to third parties.**
