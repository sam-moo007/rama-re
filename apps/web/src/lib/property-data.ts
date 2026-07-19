import {
  PropertyDecisionRoomSchema,
  residence1204,
  marinaPenthouse5401,
  downtownPenthousePH03,
  type PropertyDecisionRoom,
} from "@rama/contracts";

const allProperties = [
  residence1204,
  marinaPenthouse5401,
  downtownPenthousePH03,
];

export async function getPropertyBySlug(slug: string): Promise<PropertyDecisionRoom | null> {
  // Phase 0 keeps canonical fixtures in the shared contract package.
  // The repository adapter replaces this when Postgres persistence lands.
  const fixture = allProperties.find((p) => p.slug === slug);
  if (!fixture) return null;
  return PropertyDecisionRoomSchema.parse(fixture);
}
