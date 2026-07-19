import type { AdvisorMessageTemplate, ContactVerificationChannel } from "@rama/contracts";
import { createHmac } from "node:crypto";

export const CONTACT_DELIVERY = Symbol("CONTACT_DELIVERY");

export interface ContactDeliveryPort {
  readonly development: boolean;
  sendVerification(input: { channel: ContactVerificationChannel; target: string; code: string; expiresAt: string; idempotencyKey: string }): Promise<void>;
  sendCaseUpdate(input: { channel: ContactVerificationChannel; target: string; template: AdvisorMessageTemplate; idempotencyKey: string }): Promise<void>;
}

export class DevelopmentContactDelivery implements ContactDeliveryPort {
  readonly development = true;
  readonly deliveries: Array<Record<string, string>> = [];
  async sendVerification(input: { channel: ContactVerificationChannel; target: string; code: string; expiresAt: string; idempotencyKey: string }): Promise<void> {
    this.deliveries.push({ kind: "verification", ...input });
  }
  async sendCaseUpdate(input: { channel: ContactVerificationChannel; target: string; template: AdvisorMessageTemplate; idempotencyKey: string }): Promise<void> {
    this.deliveries.push({ kind: "case_update", ...input });
  }
}

export class WebhookContactDelivery implements ContactDeliveryPort {
  readonly development = false;
  constructor(private readonly url: string, private readonly secret: string) {}

  sendVerification(input: { channel: ContactVerificationChannel; target: string; code: string; expiresAt: string; idempotencyKey: string }): Promise<void> {
    return this.send("contact.verification", input, input.idempotencyKey);
  }

  sendCaseUpdate(input: { channel: ContactVerificationChannel; target: string; template: AdvisorMessageTemplate; idempotencyKey: string }): Promise<void> {
    return this.send("case.notification", input, input.idempotencyKey);
  }

  private async send(event: string, payload: object, idempotencyKey: string): Promise<void> {
    const body = JSON.stringify({ event, payload });
    const signature = createHmac("sha256", this.secret).update(body).digest("hex");
    const response = await fetch(this.url, { method: "POST", headers: { "content-type": "application/json", "x-rama-delivery-signature": `sha256=${signature}`, "x-rama-idempotency-key": idempotencyKey }, body, signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Contact delivery provider returned ${response.status}.`);
  }
}
