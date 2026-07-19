import { Logger } from "@nestjs/common";
import { randomBytes } from "node:crypto";

import { createPostgresPool } from "../../common/database/postgres-pool";
import type { CommunicationsRepository } from "./communications.repository";
import { ContactCipher } from "./contact-cipher";
import { DevelopmentContactDelivery, type ContactDeliveryPort, WebhookContactDelivery } from "./contact-delivery.port";
import { InMemoryCommunicationsRepository } from "./in-memory-communications.repository";
import { PostgresCommunicationsRepository } from "./postgres-communications.repository";

export const resolveCommunicationsRepositoryDriver = (environment: NodeJS.ProcessEnv = process.env): "memory" | "postgres" => {
  const configured = environment.COMMUNICATIONS_REPOSITORY?.trim().toLowerCase();
  if (configured === "memory" || configured === "postgres") return configured;
  if (configured) throw new Error("COMMUNICATIONS_REPOSITORY must be 'memory' or 'postgres'.");
  return "postgres";
};

export async function createCommunicationsRepository(environment: NodeJS.ProcessEnv = process.env): Promise<CommunicationsRepository> {
  if (resolveCommunicationsRepositoryDriver(environment) === "memory") {
    if (environment.NODE_ENV === "production") throw new Error("Volatile communications persistence is forbidden in production.");
    Logger.warn("Protected contacts and notifications are using volatile in-memory persistence.", "CommunicationsRepository");
    return new InMemoryCommunicationsRepository();
  }
  const repository = new PostgresCommunicationsRepository(createPostgresPool(environment, "rama-api-communications"));
  try { await repository.checkConnection(); Logger.log("Protected contacts and notifications are using PostgreSQL persistence.", "CommunicationsRepository"); return repository; }
  catch (error) { await repository.onModuleDestroy(); throw error; }
}

export function createContactCipher(environment: NodeJS.ProcessEnv = process.env): ContactCipher {
  const configured = environment.CONTACT_ENCRYPTION_KEY_BASE64?.trim();
  if (!configured) {
    if (environment.NODE_ENV === "production" || resolveCommunicationsRepositoryDriver(environment) === "postgres") throw new Error("CONTACT_ENCRYPTION_KEY_BASE64 is required for production or durable contact persistence.");
    Logger.warn("Protected contacts use an ephemeral development encryption key; values will not survive restart.", "ContactCipher");
    return new ContactCipher(randomBytes(32));
  }
  const key = Buffer.from(configured, "base64");
  if (key.length !== 32 || key.toString("base64") !== configured) throw new Error("CONTACT_ENCRYPTION_KEY_BASE64 must be canonical base64 for exactly 32 bytes.");
  return new ContactCipher(key);
}

export function createContactDelivery(environment: NodeJS.ProcessEnv = process.env): ContactDeliveryPort {
  const configured = environment.CONTACT_DELIVERY_ADAPTER?.trim().toLowerCase() ?? (environment.NODE_ENV === "production" ? "webhook" : "development");
  if (configured === "development") {
    if (environment.NODE_ENV === "production") throw new Error("Development contact delivery is forbidden in production.");
    return new DevelopmentContactDelivery();
  }
  if (configured !== "webhook") throw new Error("CONTACT_DELIVERY_ADAPTER must be 'development' or 'webhook'.");
  const url = environment.CONTACT_DELIVERY_WEBHOOK_URL?.trim();
  const secret = environment.CONTACT_DELIVERY_WEBHOOK_SECRET?.trim();
  if (!url || new URL(url).protocol !== "https:") throw new Error("CONTACT_DELIVERY_WEBHOOK_URL must be HTTPS.");
  if (!secret || secret.length < 32) throw new Error("CONTACT_DELIVERY_WEBHOOK_SECRET must contain at least 32 characters.");
  return new WebhookContactDelivery(url, secret);
}
