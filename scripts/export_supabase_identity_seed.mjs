import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";

const root = resolve(import.meta.dirname, "..");
const entitiesSource = await readFile(resolve(root, "data/entities.json"), "utf8");
const entities = JSON.parse(entitiesSource);
const redirects = JSON.parse(await readFile(resolve(root, "data/id_redirects.json"), "utf8"));

function literal(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

const releaseId = `core-${createHash("sha256").update(entitiesSource).digest("hex").slice(0, 16)}`;
const rows = entities.map((entity) => {
  return `(${[
    literal(entity.id),
    literal(entity.name),
    literal(entity.slug),
    literal(entity.type),
    "true",
    "null",
    literal(releaseId),
  ].join(", ")})`;
});

const entityById = new Map(entities.map((entity) => [entity.id, entity]));
for (const record of redirects) {
  const fromId = record.retired_id ?? record.from_id;
  const toId = record.canonical_id ?? record.to_id;
  const target = entityById.get(toId);
  if (!fromId || !target) {
    throw new Error(`Broken identity redirect: ${JSON.stringify(record)}`);
  }
  rows.push(`(${[
    literal(fromId),
    "null",
    "null",
    literal(target.type),
    "false",
    literal(toId),
    literal(releaseId),
  ].join(", ")})`);
}

const sql = `-- Generated from validated /data. Do not edit by hand.\n` +
  `begin;\n` +
  `insert into public.world_entity_identities(\n` +
  `  entity_id, canonical_name, canonical_slug, entity_type, active, redirected_to_entity_id, core_release_id\n` +
  `) values\n  ${rows.join(",\n  ")}\n` +
  `on conflict (entity_id) do update set\n` +
  `  canonical_name = excluded.canonical_name,\n` +
  `  canonical_slug = excluded.canonical_slug,\n` +
  `  entity_type = excluded.entity_type,\n` +
  `  active = excluded.active,\n` +
  `  redirected_to_entity_id = excluded.redirected_to_entity_id,\n` +
  `  core_release_id = excluded.core_release_id,\n` +
  `  synced_at = now();\n` +
  `commit;\n`;

const outputPath = resolve(root, "supabase/generated/entity_identities.sql");
await writeFile(outputPath, sql, "utf8");
console.log(`Wrote ${entities.length} active identities and ${redirects.length} redirects to ${outputPath}`);
