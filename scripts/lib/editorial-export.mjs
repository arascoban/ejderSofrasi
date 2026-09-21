import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Stable ordering makes pagination and the before/after comparison reproducible.
export const TABLES = {
  world_entity_identities: ['entity_id'], editor_profiles: ['user_id'],
  wiki_articles: ['article_id'], wiki_revisions: ['revision_id'],
  wiki_drafts: ['article_id'], media_assets: ['media_id'],
  media_files: ['media_id', 'kind'], wiki_draft_media: ['article_id', 'media_id', 'role'],
  wiki_revision_media: ['revision_id', 'media_id', 'role'],
};
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export async function readMetadata(client, pageSize = 500) {
  const tables = {};
  for (const [table, columns] of Object.entries(TABLES)) {
    const rows = [];
    for (let offset = 0; ; offset += pageSize) {
      let query = client.from(table).select('*');
      for (const column of columns) query = query.order(column, { ascending: true });
      const { data, error } = await query.range(offset, offset + pageSize - 1);
      if (error || !Array.isArray(data)) throw new Error(`Metadata okunamadı: ${table}`);
      rows.push(...data);
      if (data.length < pageSize) break;
    }
    tables[table] = rows;
  }
  return tables;
}

function assetFilename(file) {
  if (!/^[0-9a-f-]{36}$/i.test(file.media_id) ||
      !['original', 'thumbnail', 'small', 'medium', 'large'].includes(file.kind)) {
    throw new Error('Geçersiz medya dosya kimliği.');
  }
  if (!['wiki-originals', 'wiki-published'].includes(file.bucket_id) ||
      typeof file.object_path !== 'string' || file.object_path.startsWith('/') ||
      file.object_path.split('/').some(part => !part || part === '..' || part === '.')) {
    throw new Error('Geçersiz Storage dosya yolu.');
  }
  // Never use an untrusted Storage path as a local path.
  return `${file.media_id}-${file.kind}.bin`;
}

/** Read-only export. Writers must be idle; two matching reads are a consistency
 * check, not a PostgreSQL transaction snapshot or a full Auth/project backup. */
export async function exportEditorial(client, outputDir) {
  await mkdir(outputDir, { mode: 0o700 }); // Refuse to overwrite an earlier export.
  const tables = await readMetadata(client);
  const metadata = Buffer.from(JSON.stringify({ schema: 'ejder-editorial-export-v1', tables }, null, 2));
  await writeFile(join(outputDir, 'metadata.json'), metadata, { mode: 0o600, flag: 'wx' });
  await mkdir(join(outputDir, 'assets'), { mode: 0o700 });
  const assets = [];
  for (const file of tables.media_files) {
    const filename = assetFilename(file);
    const { data, error } = await client.storage.from(file.bucket_id).download(file.object_path);
    if (error || !data) throw new Error(`Storage dosyası okunamadı: ${file.media_id}/${file.kind}`);
    const bytes = Buffer.from(await data.arrayBuffer());
    if (bytes.length !== file.byte_size) throw new Error(`Dosya boyutu uyuşmuyor: ${file.media_id}/${file.kind}`);
    const digest = sha256(bytes);
    if (file.kind === 'original') {
      const asset = tables.media_assets.find(row => row.media_id === file.media_id);
      if (!asset || asset.content_hash_sha256 !== digest) throw new Error(`Özgün dosya özeti uyuşmuyor: ${file.media_id}`);
    }
    await writeFile(join(outputDir, 'assets', filename), bytes, { mode: 0o600, flag: 'wx' });
    assets.push({ ...file, local_path: `assets/${filename}`, sha256: digest });
  }
  // An edit during export invalidates the result; no success manifest is written.
  const after = await readMetadata(client);
  if (JSON.stringify(tables) !== JSON.stringify(after)) throw new Error('Dışa aktarma sırasında içerik değişti; düzenleme yapılmayan bir aralıkta yeni klasöre yeniden alın.');
  const manifest = {
    schema: 'ejder-editorial-export-v1', completed_at: new Date().toISOString(),
    consistency: 'matching-metadata-before-and-after; requires-idle-writers',
    metadata_sha256: sha256(metadata),
    counts: Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length])),
    assets,
    scope: 'Editorial tables and every registered original/derivative, including revision history. Auth users/passwords, unregistered Storage orphans and database schema are excluded.',
  };
  // Re-read every local byte before certifying a completed export.
  for (const asset of assets) {
    if (sha256(await readFile(join(outputDir, asset.local_path))) !== asset.sha256) throw new Error('Yerel dosya doğrulaması başarısız.');
  }
  if (sha256(await readFile(join(outputDir, 'metadata.json'))) !== manifest.metadata_sha256) throw new Error('Yerel metadata doğrulaması başarısız.');
  await writeFile(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600, flag: 'wx' });
  return { counts: manifest.counts, files: assets.length, bytes: assets.reduce((sum, asset) => sum + asset.byte_size, 0) };
}
