import { ContactProfileMineResponseSchema, CustomerNotificationListResponseSchema, type ContactProfile, type CustomerNotificationListResponse } from "@rama/contracts";

import { getCustomerApiHeaders } from "./customer-api-auth";

const apiUrl = process.env.RAMA_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

async function customerGet<T>(path: string, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(`${apiUrl}/${path}`, { cache: "no-store", headers: await getCustomerApiHeaders() });
  if (!response.ok) throw new Error(`${path} returned ${response.status}.`);
  return parse(await response.json());
}

export async function getContactProfile(): Promise<ContactProfile | null> {
  return (await customerGet("contact-profile/mine", (value) => ContactProfileMineResponseSchema.parse(value))).profile;
}

export function getCustomerNotifications(): Promise<CustomerNotificationListResponse> {
  return customerGet("notifications/mine", (value) => CustomerNotificationListResponseSchema.parse(value));
}
