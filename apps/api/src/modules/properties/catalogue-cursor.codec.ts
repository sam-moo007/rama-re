import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const CATALOGUE_CURSOR_CODEC = Symbol("CATALOGUE_CURSOR_CODEC");

type CursorPayload = { version: 1; fingerprint: string; lastSlug: string };

export class CatalogueCursorError extends Error {
  constructor() { super("The catalogue cursor is invalid, expired or belongs to another query."); this.name = "CatalogueCursorError"; }
}

export class CatalogueCursorCodec {
  constructor(private readonly secret: string) {}

  fingerprint(value: unknown): string {
    return createHash("sha256").update(JSON.stringify(value)).digest("base64url");
  }

  encode(fingerprint: string, lastSlug: string): string {
    const body = Buffer.from(JSON.stringify({ version: 1, fingerprint, lastSlug } satisfies CursorPayload)).toString("base64url");
    return `${body}.${this.signature(body)}`;
  }

  decode(value: string, expectedFingerprint: string): string {
    try {
      const [body, suppliedSignature, extra] = value.split(".");
      if (!body || !suppliedSignature || extra) throw new CatalogueCursorError();
      const expectedSignature = this.signature(body);
      const supplied = Buffer.from(suppliedSignature, "base64url"); const expected = Buffer.from(expectedSignature, "base64url");
      if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new CatalogueCursorError();
      const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<CursorPayload>;
      if (payload.version !== 1 || payload.fingerprint !== expectedFingerprint || typeof payload.lastSlug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.lastSlug)) throw new CatalogueCursorError();
      return payload.lastSlug;
    } catch (error) { if (error instanceof CatalogueCursorError) throw error; throw new CatalogueCursorError(); }
  }

  private signature(body: string) { return createHmac("sha256", this.secret).update(body).digest("base64url"); }
}
