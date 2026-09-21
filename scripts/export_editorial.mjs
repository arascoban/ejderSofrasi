import { createClient } from '@supabase/supabase-js';
import { mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { exportEditorial } from './lib/editorial-export.mjs';

// Read credentials from the local process only; never serialize them in exports.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SECRET_KEY?.trim();
if (!url || !key) throw new Error('Yerel Supabase URL ve server secret ortam değişkenleri gerekli.');
if (new URL(url).protocol !== 'https:') throw new Error('Canlı dışa aktarım HTTPS gerektirir.');
const parent = resolve('.local-backups');
await mkdir(parent, { recursive: true, mode: 0o700 });
const target = join(parent, `editorial-${new Date().toISOString().replaceAll(':', '-')}`);
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(30_000) }) },
});
try {
  const result = await exportEditorial(client, target);
  console.log(JSON.stringify({ status: 'verified', path: target, ...result }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Dışa aktarma başarısız.');
  console.error('Tamamlanmış manifest yoksa bu klasör geçerli yedek değildir.');
  process.exitCode = 1;
}
