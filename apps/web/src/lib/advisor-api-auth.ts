import { cookies } from "next/headers";

export class AdvisorSessionMissingError extends Error {
  constructor() { super("An authenticated advisor session is required."); this.name = "AdvisorSessionMissingError"; }
}

export async function getAdvisorApiHeaders(): Promise<Record<string, string>> {
  const oidcMode = process.env.NODE_ENV === "production" || process.env.IDENTITY_MODE === "oidc";
  if (!oidcMode) return { "x-rama-user": "dev-advisor-01", "x-rama-role": "advisor" };
  const token = (await cookies()).get("__Host-rama-advisor-token")?.value;
  if (!token) throw new AdvisorSessionMissingError();
  return { authorization: `Bearer ${token}` };
}

