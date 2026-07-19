# E2E Test Infra: RAMA Real-Estate Platform Phase 1 Completion

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Playwright axe accessibility checks | ORIGINAL_REQUEST §R1 | 5      | 5      | ✓      |
| 2 | Commute routing estimation | ORIGINAL_REQUEST §R3 | 5      | 5      | ✓      |
| 3 | DLD comparable transactions | ORIGINAL_REQUEST §R3 | 5      | 5      | ✓      |
| 4 | Panorama viewers and sync | ORIGINAL_REQUEST §R4 | 5      | 5      | ✓      |

## Test Architecture
- Test runner: `npx playwright test` (using Playwright for E2E testing).
- Test case format: Playwright TS test files in `apps/web/e2e/`.
- Expected output format: Standard Playwright report, exit code 0.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | User navigates to a property, checks accessibility, views DLD data, evaluates commute, and views panorama | F1, F2, F3, F4 | High       |
| 2 | Mobile user interacts with panorama and commute estimation | F2, F4 | Medium     |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (where boundaries exist)
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
