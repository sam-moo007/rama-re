# Nordic Pivot: Pre-Mortem Analysis

**Date**: Week 2 (Phase 0)
**Context**: We asked the team: *"It's 6 months from now. The Nordic pivot failed. What went wrong?"*

## Top 3 Failure Scenarios & Mitigations

### 1. "The Backend API wasn't ready when frontend needed it"
- **Scenario**: Frontend built the components, but the API couldn't support `verifiedCount` or `totalCount` effectively because the database migration was more complex than anticipated.
- **Mitigation**: We moved the API Contract definition to Week 1 (Track A) and decoupled the frontend from backend delivery using mocked endpoints until the API is ready.

### 2. "Arabic translation was rushed and sounded robotic"
- **Scenario**: The plain-language English copy was beautiful, but the Arabic translations were literal and missed the cultural tone of "calm assurance."
- **Mitigation**: We have allocated a dedicated UX Writer (Week 3) and extended the timeline to 24 weeks specifically to give localization the time it requires. We will not use automated translation for the verification states.

### 3. "We didn't test guest state merge with real data"
- **Scenario**: Deferred auth caused a nightmare where users lost their saved properties after signing up, leading to a massive spike in support tickets and churn.
- **Mitigation**: We introduced a dedicated "Spike Week" in Phase 4. We will build a localStorage-only prototype first and run extensive unit tests on the merge logic before touching the UI.
