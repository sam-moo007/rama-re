import { PartnerFileRowSchema, type PartnerFileRow } from "@rama/contracts";

export class PartnerFileValidationError extends Error {
  constructor(
    message: string,
    readonly row?: number,
    readonly column?: string,
  ) {
    super(message);
    this.name = "PartnerFileValidationError";
  }
}

const requiredHeaders = [
  "external_id",
  "property_slug",
  "claim_key",
  "evidence_class",
  "retrieved_at",
  "payload_json",
] as const;

const parseCsvCells = (content: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted) {
      if (character === '"') {
        if (content[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.endsWith("\r") ? cell.slice(0, -1) : cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (quoted) throw new PartnerFileValidationError("CSV contains an unterminated quoted field.");
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.endsWith("\r") ? cell.slice(0, -1) : cell);
    rows.push(row);
  }
  return rows.filter((candidate) => candidate.some((value) => value.trim().length > 0));
};

export const parsePartnerCsv = (bytes: Buffer, maximumRows: number): PartnerFileRow[] => {
  let content: string;
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new PartnerFileValidationError("Partner CSV must be valid UTF-8.");
  }
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  const rows = parseCsvCells(content);
  const header = rows.shift()?.map((value) => value.trim().toLowerCase());
  if (!header || header.length !== requiredHeaders.length) {
    throw new PartnerFileValidationError(`CSV must contain exactly: ${requiredHeaders.join(", ")}.`, 1);
  }
  if (!requiredHeaders.every((expected, index) => header[index] === expected)) {
    throw new PartnerFileValidationError(`CSV header order must be: ${requiredHeaders.join(", ")}.`, 1);
  }
  if (rows.length === 0) throw new PartnerFileValidationError("Partner CSV contains no data rows.");
  if (rows.length > maximumRows) {
    throw new PartnerFileValidationError(`Partner CSV exceeds the ${maximumRows}-row limit.`);
  }

  const seenExternalIds = new Set<string>();
  return rows.map((values, index) => {
    const rowNumber = index + 2;
    if (values.length !== requiredHeaders.length) {
      throw new PartnerFileValidationError(
        `CSV row has ${values.length} columns; expected ${requiredHeaders.length}.`,
        rowNumber,
      );
    }
    let payload: unknown;
    try {
      payload = JSON.parse(values[5] ?? "");
    } catch {
      throw new PartnerFileValidationError("payload_json must contain valid JSON.", rowNumber, "payload_json");
    }
    const result = PartnerFileRowSchema.safeParse({
      externalId: values[0],
      propertySlug: values[1],
      claimKey: values[2],
      evidenceClass: values[3],
      retrievedAt: values[4],
      payload,
    });
    if (!result.success) {
      const issue = result.error.issues[0];
      throw new PartnerFileValidationError(
        issue?.message ?? "Invalid partner row.",
        rowNumber,
        issue?.path.join(".") || undefined,
      );
    }
    if (seenExternalIds.has(result.data.externalId)) {
      throw new PartnerFileValidationError(
        `Duplicate external_id '${result.data.externalId}'.`,
        rowNumber,
        "external_id",
      );
    }
    seenExternalIds.add(result.data.externalId);
    return result.data;
  });
};
