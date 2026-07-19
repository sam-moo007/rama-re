import { Logger } from "@nestjs/common";

import { CatalogueCursorCodec } from "./catalogue-cursor.codec";

const DEVELOPMENT_SECRET = "rama-development-catalogue-cursor-secret-v1";

export const createCatalogueCursorCodec = (environment: NodeJS.ProcessEnv = process.env): CatalogueCursorCodec => {
  const configured = environment.CATALOGUE_CURSOR_SECRET?.trim();
  if (environment.NODE_ENV === "production" && (!configured || configured.length < 32)) throw new Error("CATALOGUE_CURSOR_SECRET with at least 32 characters is required in production.");
  if (!configured) Logger.warn("Catalogue cursors use the explicit development signing secret.", "CatalogueCursorCodec");
  if (configured && configured.length < 32) throw new Error("CATALOGUE_CURSOR_SECRET must contain at least 32 characters.");
  return new CatalogueCursorCodec(configured ?? DEVELOPMENT_SECRET);
};
