import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CONTACT_CIPHER = Symbol("CONTACT_CIPHER");

export class ContactCipher {
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new Error("Contact encryption requires a 32-byte key.");
  }

  encrypt(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
  }

  decrypt(value: string): string {
    const [version, ivValue, tagValue, ciphertextValue] = value.split(".");
    if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) throw new Error("Unsupported protected-contact ciphertext.");
    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivValue, "base64url"));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8");
  }

  verificationHash(profileId: string, channel: string, code: string): string {
    return createHmac("sha256", this.key).update(`${profileId}:${channel}:${code}`, "utf8").digest("base64url");
  }

  matchesVerificationHash(expected: string, profileId: string, channel: string, code: string): boolean {
    const actual = Buffer.from(this.verificationHash(profileId, channel, code), "utf8");
    const stored = Buffer.from(expected, "utf8");
    return actual.length === stored.length && timingSafeEqual(actual, stored);
  }
}
