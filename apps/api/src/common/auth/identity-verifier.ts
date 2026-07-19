import type { RamaActor } from "./rama-actor";

export const IDENTITY_VERIFIER = Symbol("IDENTITY_VERIFIER");

export type IdentityRequest = {
  headers: Record<string, string | string[] | undefined>;
};

export interface IdentityVerifier {
  authenticate(request: IdentityRequest): Promise<RamaActor>;
}
