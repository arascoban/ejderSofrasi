// Isolated SQL smoke tests; never connects to a remote database.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
if (!process.argv[2]) throw new Error('Usage: node scripts/verify_editorial_pglite.mjs /absolute/path/to/pglite/dist/index.js');
const {PGlite} = await import(pathToFileURL(process.argv[2]).href);
import fs from 'node:fs';
const root=process.cwd();
const migrationFiles=fs.readdirSync(root+'/supabase/migrations').filter(f=>/^\d+_.+\.sql$/.test(f)).sort();
let assertions=0;
const check=(value,label)=>{assert.ok(value,label); assertions++; console.log('PASS',label);};
async function rejectsCode(sql,args,code,label){
  await assert.rejects(db.query(sql,args),error=>error.code===code);
  assertions++;console.log('PASS',label);
}
process.on('uncaughtException',error=>{console.error('FAIL',error.code??'',error.message,error.detail??'');process.exit(1);});
const db=new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$; grant usage on schema auth to anon,authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,owner_id text); alter table storage.objects enable row level security; create function storage.foldername(text) returns text[] language sql as $$select (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1]$$;`);
if (process.env.EJDER_TEST_BOOTSTRAP === '1') {
  await db.exec(fs.readFileSync(root+'/supabase/generated/bootstrap_editorial.sql','utf8').replace('create extension if not exists pgcrypto;',''));
  check((await db.query('select * from private.bootstrap_receipts')).rows.length===migrationFiles.length,'atomic bootstrap receipt');
} else {
for(const f of migrationFiles) {
 let sql=fs.readFileSync(root+'/supabase/migrations/'+f,'utf8').replace('create extension if not exists pgcrypto;','');
 try {await db.exec(sql); console.log('PASS migration',f)} catch(e) {console.error('FAIL',f,e.message); process.exit(1)}
}
await db.exec(fs.readFileSync(root+'/supabase/generated/entity_identities.sql','utf8'));
}
const conflictFunctions=await db.query(`select pg_get_functiondef(p.oid) as definition, p.proacl::text as grants from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('save_wiki_draft','publish_wiki_draft','rollback_wiki_article','attach_media_to_wiki_draft','remove_media_from_wiki_draft','reorder_wiki_draft_media') order by p.proname`);
check(conflictFunctions.rows.length===6 && conflictFunctions.rows.every(r=>r.definition.includes("errcode = 'PT409'")&&!r.definition.includes("errcode = '40001'")),'six RPCs return non-retryable application conflicts');
await db.exec(fs.readFileSync(root+'/supabase/migrations/202609210001_editorial_conflict_sqlstate.sql','utf8'));
const repeatedFunctions=await db.query(`select pg_get_functiondef(p.oid) as definition, p.proacl::text as grants from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('save_wiki_draft','publish_wiki_draft','rollback_wiki_article','attach_media_to_wiki_draft','remove_media_from_wiki_draft','reorder_wiki_draft_media') order by p.proname`);
check(JSON.stringify(conflictFunctions.rows)===JSON.stringify(repeatedFunctions.rows),'forward migration repeat preserves definitions and grants');
await db.exec(`insert into auth.users values ('11111111-1111-4111-8111-111111111111'); insert into public.editor_profiles(user_id,role,display_name) values ('11111111-1111-4111-8111-111111111111','owner','Test'); set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; set role authenticated;`);
const identity=(await db.query('select entity_id,core_release_id from public.world_entity_identities where active limit 1')).rows[0];
const saveSql=`select * from public.save_wiki_draft($1,$2,$3,$4,$5,$6,$7,$8)`;
const doc={type:'doc',content:[{type:'paragraph'}]};
const args=(token=null,published=null)=>[identity.entity_id,doc,identity.core_release_id,'1300 civarı','test',token?.lock_version??null,token?.draft_id??null,published];
let token=(await db.query(saveSql,args())).rows[0];
check(token.lock_version===1,'first draft saved');
await rejectsCode(saveSql,args(),'PT409','null token cannot overwrite draft');
const oldToken=token;
token=(await db.query(saveSql,args(token))).rows[0];
check(token.lock_version===2,'save increments version');
await rejectsCode(saveSql,args(oldToken),'PT409','stale version rejected');
await rejectsCode(saveSql,args({...token,draft_id:'22222222-2222-4222-8222-222222222222'}),'PT409','wrong draft lifetime rejected');
const rev=(await db.query('select public.publish_wiki_draft($1,$2,$3,$4) id',[identity.entity_id,token.lock_version,'publish',token.draft_id])).rows[0].id;
check(Boolean(rev),'draft published');
await rejectsCode(saveSql,args(),'PT409','new draft from stale published page rejected');
token=(await db.query(saveSql,args(null,rev))).rows[0];
check(token.based_on_revision_id===rev&&token.draft_id!==oldToken.draft_id,'new draft keeps published base and fresh identity');
await rejectsCode(saveSql,args({...oldToken,lock_version:1}),'PT409','ABA old draft rejected');
await db.exec('reset role');
const mediaIds=['33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444'];
for(const id of mediaIds){
 await db.query(`insert into public.media_assets(media_id,state,content_hash_sha256,mime_type,width,height,byte_size,alternative_text_tr,source_label,creator_credit,rights_note,created_by) values ($1,'ready',repeat('a',64),'image/webp',10,10,20,'test','test','test','test','11111111-1111-4111-8111-111111111111')`,[id]);
 await db.query(`insert into public.media_files(media_id,kind,bucket_id,object_path,byte_size,mime_type) values ($1::uuid,'medium','wiki-published',($1::uuid)::text||'/medium.webp',20,'image/webp')`,[id]);
}
await db.exec('set role authenticated');
for(const id of mediaIds) token=(await db.query(`select * from public.attach_media_to_wiki_draft($1,$2,'gallery','1300 civarı',$3,$4)`,[identity.entity_id,id,token.draft_id,token.lock_version])).rows[0];
check(token.lock_version===3,'media writes increment version');
await rejectsCode('select * from public.attach_media_to_wiki_draft($1,$2,\'gallery\',null,$3,$4)',[identity.entity_id,mediaIds[0],token.draft_id,token.lock_version-1],'PT409','stale media attach returns application conflict');
await rejectsCode('select * from public.remove_media_from_wiki_draft($1,$2,$3,$4)',[identity.entity_id,mediaIds[0],token.draft_id,token.lock_version-1],'PT409','stale media removal returns application conflict');
await rejectsCode('select * from public.reorder_wiki_draft_media($1,$2,$3,$4)',[identity.entity_id,mediaIds,token.draft_id,token.lock_version-1],'PT409','stale media reorder returns application conflict');
await rejectsCode('select * from public.reorder_wiki_draft_media($1,$2,$3,$4)',[identity.entity_id,[mediaIds[0],mediaIds[0]],token.draft_id,token.lock_version],'22023','duplicate gallery IDs rejected by database');
const rev2=(await db.query('select public.publish_wiki_draft($1,$2,$3,$4) id',[identity.entity_id,token.lock_version,'gallery',token.draft_id])).rows[0].id;
token=(await db.query(saveSql,args(null,rev2))).rows[0];
check((await db.query('select * from public.wiki_draft_media')).rows.length===2,'published gallery copied into next draft');
await db.exec("set role anon; set request.jwt.claim.sub=''");
await rejectsCode('select * from public.wiki_drafts',[],'42501','anonymous cannot read draft');
check((await db.query('select * from public.media_files')).rows.length===2,'anonymous reads currently published derivatives');
await rejectsCode(saveSql,args(), '42501','anonymous cannot call save RPC');
await db.exec("reset role; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; set role authenticated");
await rejectsCode('select public.rollback_wiki_article($1,$2,$3,$4)',[identity.entity_id,rev,rev,'stale rollback'],'PT409','stale rollback returns application conflict');
await db.query('select public.rollback_wiki_article($1,$2,$3,$4)',[identity.entity_id,rev,rev2,'rollback']);
await db.exec("set role anon; set request.jwt.claim.sub=''");
check((await db.query('select * from public.media_files')).rows.length===0,'rollback removes old gallery from anonymous RLS view');
await db.exec("reset role; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; set role authenticated");
await rejectsCode('select public.publish_wiki_draft($1,$2,$3,$4)',[identity.entity_id,token.lock_version,'stale',token.draft_id],'PT409','draft based on rolled back revision cannot publish');
// D2: replay the actual core identity importer while articles/history/media exist.
// Everything below lives only in this isolated database, never in remote canon.
await db.exec('reset role');
const editorialTables = ['wiki_articles','wiki_revisions','wiki_drafts','media_assets','media_files','wiki_draft_media','wiki_revision_media'];
async function editorialSnapshot() {
  const snapshot = {};
  for (const table of editorialTables) snapshot[table] = (await db.query(`select row_to_json(t) as row from public.${table} t order by row_to_json(t)::text`)).rows;
  return snapshot;
}
const beforeImport = await editorialSnapshot();
await db.exec(fs.readFileSync(root+'/supabase/generated/entity_identities.sql','utf8'));
check(JSON.stringify(beforeImport) === JSON.stringify(await editorialSnapshot()), 'real core identity reimport preserves all editorial rows byte-for-byte');
await db.query(`update public.world_entity_identities set canonical_name=canonical_name||' fixture', core_release_id='core-fixture-next' where entity_id=$1`, [identity.entity_id]);
check(JSON.stringify(beforeImport) === JSON.stringify(await editorialSnapshot()), 'new core release and display name preserve article history and media links');
// Exercise the same publishing and gallery SQL for NPC/item/location identities.
await db.exec("set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; set role authenticated");
for (const entityId of ['NPC-0006','ITM-0012','CIT-0006']) {
  const row=(await db.query('select entity_id,core_release_id from public.world_entity_identities where entity_id=$1',[entityId])).rows[0];
  const linkedDoc={type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Kalender',marks:[{type:'link',attrs:{entityId:'NPC-0051',href:'/entity/NPC-0051'}}]}]}]};
  let t=(await db.query(saveSql,[entityId,linkedDoc,row.core_release_id,null,'D2 isolated fixture',null,null,null])).rows[0];
  for(const id of mediaIds) t=(await db.query("select * from public.attach_media_to_wiki_draft($1,$2,'gallery',null,$3,$4)",[entityId,id,t.draft_id,t.lock_version])).rows[0];
  t=(await db.query('select * from public.reorder_wiki_draft_media($1,$2,$3,$4)',[entityId,[...mediaIds].reverse(),t.draft_id,t.lock_version])).rows[0];
  const published=(await db.query('select public.publish_wiki_draft($1,$2,$3,$4) id',[entityId,t.lock_version,'D2 isolated fixture',t.draft_id])).rows[0].id;
  const reopened=(await db.query(saveSql,[entityId,linkedDoc,row.core_release_id,null,'D2 private changes',null,null,published])).rows[0];
  const persisted=(await db.query('select document from public.wiki_drafts where draft_id=$1',[reopened.draft_id])).rows[0].document;
  assert.deepEqual(persisted, linkedDoc);
  check(true,'ID-backed link survives save/publish/reopen '+entityId);
  await db.exec("set role anon; set request.jwt.claim.sub=''");
  const projection=(await db.query('select public.get_published_wiki_article($1) content',[entityId])).rows[0].content;
  check(projection.media.length===2 && projection.media[0].media_id===mediaIds[1] && projection.media[1].media_id===mediaIds[0] && projection.revision.change_note==='D2 isolated fixture', 'ordered public gallery excludes private draft '+entityId);
  await db.exec("reset role; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; set role authenticated");
}
await rejectsCode('update public.wiki_articles set language=language',[],'42501','even editor cannot bypass write RPCs');
await db.exec("reset role; insert into auth.users values ('99999999-9999-4999-8999-999999999999'); set request.jwt.claim.sub='99999999-9999-4999-8999-999999999999'; set role authenticated");
check((await db.query('select * from public.wiki_drafts')).rows.length===0,'authenticated non-editor cannot read private drafts');
await rejectsCode(saveSql,args(),'42501','authenticated non-editor cannot save');
await rejectsCode("update public.editor_profiles set role='owner'",[],'42501','authenticated non-editor cannot elevate own role');
console.log(JSON.stringify({status:'passed',assertions,migrations:migrationFiles.length,engine:'PGlite 0.5.8',limitations:['Auth/Storage are fixtures','pgcrypto extension skipped; built-in gen_random_uuid used','No HTTP Storage or concurrent database sessions tested']}));
await db.close();
