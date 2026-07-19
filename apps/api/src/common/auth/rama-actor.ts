export const ramaRoles = ["customer", "evidence_analyst", "evidence_lead", "advisor", "partner"] as const;
export type RamaRole = (typeof ramaRoles)[number];

export type RamaActor = {
  id: string;
  role: RamaRole;
  authenticationMethod?: "development_header" | "oidc";
  mfaAuthenticated?: boolean;
  organizationId?: string | null;
  sessionId?: string | null;
};
