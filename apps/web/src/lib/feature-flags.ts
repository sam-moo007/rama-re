/**
 * Feature Flags for Nordic Companion Pivot
 * 
 * This is a lightweight implementation for Phase 0. 
 * Can be swapped with a provider like LaunchDarkly or Unleash later.
 */
export const FEATURE_FLAGS = {
  // Phase 2: Replaces TrustPassport with VerificationSummary
  NORDIC_VERIFICATION_UI: process.env.NEXT_PUBLIC_FLAG_NORDIC_VERIFICATION === 'true',
  
  // Phase 3: Simplifies discovery with 4 filters and clean cards
  NORDIC_SIMPLIFIED_DISCOVERY: process.env.NEXT_PUBLIC_FLAG_NORDIC_DISCOVERY === 'true',
  
  // Phase 4: Guest state and deferred auth modal
  NORDIC_DEFERRED_AUTH: process.env.NEXT_PUBLIC_FLAG_NORDIC_AUTH === 'true',
  
  // Phase 5: Cost assumption layer and Estimated vs Fixed indicators
  NORDIC_ASSUMPTIONS_LAYER: process.env.NEXT_PUBLIC_FLAG_NORDIC_ASSUMPTIONS === 'true',
} as const;

/**
 * Helper to conditionally render components based on feature flags.
 * 
 * @example
 * if (isFeatureEnabled('NORDIC_VERIFICATION_UI')) {
 *   return <VerificationSummary />
 * }
 * return <TrustPassport />
 */
export function isFeatureEnabled(flagName: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flagName] ?? false;
}
