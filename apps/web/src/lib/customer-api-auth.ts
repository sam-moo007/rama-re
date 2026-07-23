export class CustomerSessionMissingError extends Error {
  constructor() {
    super("An authenticated customer session is required.");
    this.name = "CustomerSessionMissingError";
  }
}

export async function getCustomerApiHeaders(): Promise<Record<string, string>> {
  const oidcMode = process.env.NODE_ENV === "production" || process.env.IDENTITY_MODE === "oidc";
  if (!oidcMode) {
    return { "x-rama-user": "dev-customer-01", "x-rama-role": "customer" };
  }
  
  let token = "";
  if (typeof window !== "undefined") {
    const match = document.cookie.match(new RegExp('(^| )__Host-rama-customer-token=([^;]+)'));
    if (match && match[2]) token = match[2];
  } else {
    try {
      const nextHeaders = require("next/headers");
      const cookieStore = await nextHeaders.cookies();
      token = cookieStore.get("__Host-rama-customer-token")?.value || "";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Ignore
    }
  }

  if (!token) throw new CustomerSessionMissingError();
  return { authorization: `Bearer ${token}` };
}
