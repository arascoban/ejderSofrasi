import type { EntitySummary, EntityType, Period } from "./types";

export interface SearchOptions {
  query?: string;
  type?: EntityType | null;
  period?: Period | null;
  editorialTextByEntity?: ReadonlyMap<string, string>;
}

/**
 * Search is deliberately locale-independent. Turkish users can type either
 * “Çöl Şehri” or “col sehri” and reach the same stable entity.
 */
export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/[ıİ]/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function searchableValues(entity: EntitySummary, editorialText?: string): string[] {
  return [
    entity.name,
    entity.slug,
    ...entity.aliases,
    ...(entity.legacyIds ?? []),
    editorialText ?? "",
  ];
}

export function entityMatchesSearch(
  entity: EntitySummary,
  query: string,
  editorialText?: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;
  const haystack = searchableValues(entity, editorialText).map(normalizeSearchText);
  return normalizedQuery.split(" ").every((term) => haystack.some((value) => value.includes(term)));
}

export function filterEntitySummaries(
  entities: readonly EntitySummary[],
  options: SearchOptions = {},
): EntitySummary[] {
  const query = options.query?.trim() ?? "";
  return entities
    .filter((entity) => !options.type || entity.type === options.type)
    .filter((entity) => !options.period || entity.periods.includes(options.period))
    .filter((entity) => entityMatchesSearch(entity, query, options.editorialTextByEntity?.get(entity.id)))
    .sort((left, right) => left.name.localeCompare(right.name, "tr-TR"));
}
