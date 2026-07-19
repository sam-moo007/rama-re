import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { RamaActor } from "./rama-actor";

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RamaActor => {
    const request = context.switchToHttp().getRequest<{ ramaActor: RamaActor }>();
    return request.ramaActor;
  },
);
