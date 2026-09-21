import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportEditorial, readMetadata, TABLES, sha256 } from '../../scripts/lib/editorial-export.mjs';

const mediaId = '33333333-3333-4333-8333-333333333333';
function fixture({ missing = false, changed = false, corrupt = false, unsafe = false } = {}) {
  const bytes = Buffer.from('original fixture');
  const tables = Object.fromEntries(Object.keys(TABLES).map(name => [name, []]));
  tables.media_assets = [{ media_id: mediaId, content_hash_sha256: sha256(bytes) }];
  tables.media_files = [{ media_id: mediaId, kind: 'original', bucket_id: 'wiki-originals', object_path: unsafe ? '../escape' : 'owner/image/original.png', byte_size: bytes.length }];
  let metadataReads = 0;
  const client = {
    from(name) {
      if (name === 'world_entity_identities') metadataReads++;
      return { select() { return this; }, order() { return this; }, async range(start, end) {
        const rows = tables[name].slice(start, end + 1);
        return { data: changed && metadataReads > 1 && name === 'wiki_articles' ? [{ article_id: 'changed' }] : rows, error: null };
      } };
    },
    storage: { from() { return { async download() { return missing ? { error: {} } : { data: new Blob([corrupt ? Buffer.alloc(bytes.length) : bytes]), error: null }; } }; } },
  };
  return { client, tables, bytes };
}

test('exports original bytes and all editorial tables with verified hashes', async () => {
  const parent = await mkdtemp(join(tmpdir(), 'ejder-export-test-'));
  try {
    const f = fixture(); const output = join(parent, 'export');
    const result = await exportEditorial(f.client, output);
    assert.equal(result.files, 1);
    const manifest = JSON.parse(await readFile(join(output, 'manifest.json')));
    assert.deepEqual(await readFile(join(output, manifest.assets[0].local_path)), f.bytes);
    assert.equal(sha256(await readFile(join(output, 'metadata.json'))), manifest.metadata_sha256);
    assert.equal(Object.keys(manifest.counts).length, 9);
    await assert.rejects(exportEditorial(f.client, output), { code: 'EEXIST' });
  } finally { await rm(parent, { recursive: true, force: true }); }
});

for (const option of ['missing', 'changed', 'corrupt', 'unsafe']) {
  test(`never certifies an incomplete export: ${option}`, async () => {
    const parent = await mkdtemp(join(tmpdir(), 'ejder-export-test-'));
    try {
      const output = join(parent, 'export');
      await assert.rejects(exportEditorial(fixture({ [option]: true }).client, output));
      await assert.rejects(access(join(output, 'manifest.json')), { code: 'ENOENT' });
    } finally { await rm(parent, { recursive: true, force: true }); }
  });
}

test('paginates instead of silently truncating tables', async () => {
  const f = fixture();
  f.tables.wiki_revisions = Array.from({ length: 5 }, (_, i) => ({ revision_id: i }));
  const tables = await readMetadata(f.client, 2);
  assert.equal(tables.wiki_revisions.length, 5);
});
