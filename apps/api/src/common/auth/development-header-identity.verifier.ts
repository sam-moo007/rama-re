import { ForbiddenException, UnauthorizedException } from "@nestjs/common";

import { ramaRoles, type RamaActor, type RamaRole } from "./rama-actor";
import type { IdentityRequest, IdentityVerifier } from "./identity-verifier";

export class DevelopmentHeaderIdentityVerifier implements IdentityVerifier {
  async authenticate(request: IdentityRequest): Promise<RamaActor> {
    const id = this.single(request.headers["x-rama-user"]);
    const roleValue = this.single(request.headers["x-rama-role"]);
    if (!id || !roleValue) {
      throw new UnauthorizedException({
        code: "DEVELOPMENT_IDENTITY_REQUIRED",
        message: "Protected development routes require explicit x-rama-user and x-rama-role headers.",
      });
    }
    if (id.trim().length < 2 || id.length > 120) {
      throw new UnauthorizedException("The development identity is invalid.");
    }
    if (!ramaRoles.includes(roleValue as RamaRole)) {
      throw new ForbiddenException(`Unknown RAMA role '${roleValue}'.`);
    }
    return {
      id,
      role: roleValue as RamaRole,
      authenticationMethod: "development_header",
      mfaAuthenticated: false,
      organizationId: null,
    };
  }

  private single(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      if (value.length !== 1) throw new UnauthorizedException("Duplicate identity headers are forbidden.");
      return value[0];
    }
    return value;
  }
}
