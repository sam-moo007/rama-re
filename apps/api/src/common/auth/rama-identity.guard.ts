import {
  ForbiddenException,
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IDENTITY_VERIFIER, type IdentityRequest, type IdentityVerifier } from "./identity-verifier";
import type { RamaActor, RamaRole } from "./rama-actor";
import { RAMA_ROLES_KEY } from "./roles.decorator";

type AuthenticatedRequest = IdentityRequest & { ramaActor?: RamaActor };

@Injectable()
export class RamaIdentityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(IDENTITY_VERIFIER) private readonly identityVerifier: IdentityVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RamaRole[]>(RAMA_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const actor = await this.identityVerifier.authenticate(request);
    if (!requiredRoles.includes(actor.role)) {
      throw new ForbiddenException({
        code: "AUTH_ROLE_FORBIDDEN",
        message: `Role '${actor.role}' cannot perform this operation.`,
      });
    }
    request.ramaActor = actor;
    return true;
  }
}
