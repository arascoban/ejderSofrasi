import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(join(root, path), 'utf8'));

test('M1 kapsamı her etkin varlık için tam ve ID tabanlıdır', async () => {
  const [entities, coverage, relationships, timeline, travel, sourceInventory] = await Promise.all([
    readJson('data/entities.json'),
    readJson('editorial_work/coverage.json'),
    readJson('data/relationships.json'),
    readJson('data/timeline.json'),
    readJson('data/travel.json'),
    readJson('data/source_inventory.json'),
  ]);
  const active = entities.filter((entity) => entity.record_status !== 'retired');
  const ids = new Set(entities.map((entity) => entity.id));
  const sourceIds = new Set(sourceInventory.files.map((file) => file.source_id));
  assert.equal(coverage.entity_count, active.length);
  assert.deepEqual(coverage.entity_ids, active.map((entity) => entity.id).sort());
  assert.equal(new Set(coverage.entity_ids).size, active.length);
  const packageNames = (await readdir(join(root, 'editorial_work', 'evidence'))).filter((name) => name.endsWith('.json'));
  assert.deepEqual(packageNames.sort(), active.map((entity) => `${entity.id}.json`).sort());

  for (const record of coverage.records) {
    assert.ok(ids.has(record.entity_id));
    const packagePath = join(root, 'editorial_work', record.package_path);
    await access(packagePath);
    const evidence = JSON.parse(await readFile(packagePath, 'utf8'));
    assert.equal(evidence.entity.id, record.entity_id);
    assert.equal(evidence.entity.name, record.name);
    assert.equal(evidence.evidence.review_status, record.review_status);
    assert.deepEqual(evidence.owner_confirmations.filter((decision) =>
      JSON.stringify(decision).toLowerCase().includes('owner'),
    ), evidence.owner_confirmations);

    for (const ref of evidence.evidence.source_refs) assert.ok(sourceIds.has(ref.source_id), ref.source_id);
    for (const fact of evidence.facts) assert.equal(fact.id.startsWith('FCT-'), true);
    for (const relation of [...evidence.relationships.outgoing, ...evidence.relationships.incoming]) {
      assert.ok(ids.has(relation.subject_id));
      assert.ok(ids.has(relation.object_id));
    }
    for (const event of evidence.timeline.events) {
      for (const id of [...(event.participant_ids ?? []), ...(event.location_ids ?? []), ...(event.related_entity_ids ?? [])]) {
        assert.ok(ids.has(id), id);
      }
    }
    for (const route of evidence.travel) {
      for (const id of [route.from_id, route.to_id, ...(route.via_ids ?? []), ...(route.traveler_ids ?? [])].filter(Boolean)) {
        assert.ok(ids.has(id), id);
      }
    }
    for (const linked of evidence.linked_entities) assert.ok(ids.has(linked.id), linked.id);
  }

  assert.ok(relationships.length > 0);
  assert.ok(timeline.length > 0);
  assert.ok(travel.length > 0);
});
