import { cookies } from "next/headers";

export class OperationsSessionMissingError extends Error {
  constructor() {
    super("An authenticated operations session is required.");
    this.name = "OperationsSessionMissingError";
  }
}

export async function getOperationsApiHeaders(): Promise<Record<string, string>> {
  const oidcMode = process.env.NODE_ENV === "production" || process.env.IDENTITY_MODE === "oidc";
  if (!oidcMode) {
    return {
      "x-rama-user": "operations-console",
      "x-rama-role": "evidence_lead",
    };
  }
  const token = (await cookies()).get("__Host-rama-operations-token")?.value;
  if (!token) throw new OperationsSessionMissingError();
  return { authorization: `Bearer ${token}` };
}
