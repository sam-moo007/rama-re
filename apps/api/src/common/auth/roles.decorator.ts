import { SetMetadata } from "@nestjs/common";

import type { RamaRole } from "./rama-actor";

export const RAMA_ROLES_KEY = "rama_roles";
export const Roles = (...roles: RamaRole[]) => SetMetadata(RAMA_ROLES_KEY, roles);
