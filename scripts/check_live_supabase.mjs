import fs from "node:fs";

const env = {};
for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL ve publishable key gerekli.");

const headers = {
  apikey: key,
  authorization: `Bearer ${key}`,
};

async function request(path, options = {}) {
  const response = await fetch(`${url}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
  return { status: response.status, body };
}

const entities = await request("/rest/v1/world_entity_identities?select=entity_id,active&limit=1000");
const reader = await request("/rest/v1/rpc/get_published_wiki_article", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ p_entity_id: "NPC-0006" }),
});
const ownerVisibility = await request("/rest/v1/editor_profiles?select=user_id&limit=1");

const rows = Array.isArray(entities.body) ? entities.body : [];
console.log(JSON.stringify({
  project: new URL(url).hostname,
  identityQuery: { status: entities.status, total: rows.length, active: rows.filter((row) => row.active).length, retired: rows.filter((row) => row.active === false).length },
  publicReader: { status: reader.status, returnsArticleOrNull: reader.status === 200 },
  ownerVisibility: { status: ownerVisibility.status, anonCanRead: ownerVisibility.status === 200 },
  expected: { total: 416, active: 403, retired: 13, readerStatus: 200, ownerVisibility: "RLS ile anon erişimi kapalı; owner doğrulaması SQL Editor/Auth oturumunda yapılır" },
}, null, 2));
