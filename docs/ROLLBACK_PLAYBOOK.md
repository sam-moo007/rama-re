# Nordic Pivot Rollback Playbook

**Purpose**: A rehearsed crisis response plan for reverting the Nordic UI pivot if metrics severely degrade or critical bugs are identified in production.

## Scenario 1: Feature Flag Toggle (Fastest — 5 minutes)
- **When**: Metrics degrade (e.g., bounce rate spikes >15%) but code is fundamentally sound.
- **How**: Disable the `nordic-verification-ui`, `nordic-deferred-auth`, and `nordic-simplified-discovery` flags in the feature flag dashboard (e.g., LaunchDarkly/Unleash).
- **Who can trigger**: Frontend Lead, Product Manager, On-call engineer.
- **Verification**: Check `/health` endpoint and monitor error rates for 30 minutes.

## Scenario 2: Code Revert (Medium — 30 minutes)
- **When**: Severe bug in flag logic, component crash, or build failure.
- **How**: Revert the last deploy via the Vercel/CI dashboard.
- **Who can trigger**: Frontend Lead, DevOps.
- **Verification**: Run smoke tests on all critical routes (`/homes`, `/costs`).

## Scenario 3: Database Rollback (Slowest — 2+ hours)
- **When**: Data migration corrupted the evidence ontology or verified count mappings.
- **How**: Restore from the pre-migration database backup.
- **Who can trigger**: Backend Lead only.
- **Verification**: Run data integrity checks and verify `verifiedCount` fields.

## Communication Template
If a rollback impacts user state (e.g. guest state loss), use this template for customer support:
> "We have temporarily reverted the Nordic UI update while we investigate an issue. Your saved properties and preferences are safe. We expect to restore the update within [TIMEFRAME]."
