#!/usr/bin/env python3
"""Rebuild the source-evidenced MAIN_TIMELINE database; Python standard library only.

Original source files are never written. Persistent IDs live in id_registry.json.
Human semantic decisions live in reviews/*.json. Run validate_database.py afterward.
"""
import collections
import copy
import hashlib
import json
import pathlib
import re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'data'
SCRIPTS = ROOT / 'scripts'
OUT.mkdir(exist_ok=True)


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def norm(s):
    return ' '.join(unicodedata.normalize('NFC', s).replace('İ', 'i').replace('I', 'ı').lower().split())


def slug(s):
    s = s.translate(str.maketrans('ıİşŞğĞüÜöÖçÇ', 'iissgguuoocc'))
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-') or 'entity'


def digest(s):
    return hashlib.sha256(s.encode()).hexdigest()[:16]


PREFIX = dict(PERSON='NPC', FAMILY='FAM', DYNASTY='DYN', FACTION='FAC', ORGANIZATION='ORG',
              MILITARY_UNIT='MIL', CONTINENT='CON', KINGDOM='KNG', STATE='STA', REGION='REG',
              DISTRICT='DIS', CITY='CIT', TOWN='TWN', VILLAGE='VIL', ISLAND='ISL', PORT='PRT',
              BUILDING='BLD', TAVERN='TAV', TEMPLE='TMP', NATURAL_FEATURE='NAT', SHIP='SHP',
              CREATURE='CRE', DEITY='DEI', DRAGON='DRG', PLANT='PLT', ITEM='ITM',
              HISTORICAL_EVENT='EVT', HISTORICAL_ERA='ERA', OTHER='OTH')
LOCATION_TYPES = set('CONTINENT KINGDOM STATE REGION DISTRICT CITY TOWN VILLAGE ISLAND PORT BUILDING TAVERN TEMPLE NATURAL_FEATURE'.split())
GROUP_TYPES = set('FAMILY DYNASTY FACTION ORGANIZATION MILITARY_UNIT'.split())
ACTOR_TYPES = set('PERSON CREATURE DEITY DRAGON'.split()) | GROUP_TYPES | {'KINGDOM', 'STATE'}
ALLOWED = set('MEMBER_OF COMMANDS LEADS CAPTAIN_OF SERVES RULES OWNS FORMERLY_OWNED OPERATES WORKS_IN LIVES_IN FROM BORN_IN PRESENT_IN VISITED WANTED_BY FUGITIVE_FROM ALLIED_WITH ENEMY_OF AFFILIATED_WITH RELATED_TO PARENT_OF CHILD_OF SIBLING_OF MARRIED_TO WORSHIPS TEMPLE_OF PART_OF LOCATED_IN CAPITAL_OF NORTH_OF SOUTH_OF EAST_OF WEST_OF NORTHEAST_OF NORTHWEST_OF SOUTHEAST_OF SOUTHWEST_OF NEAR INSIDE BORDERS BETWEEN ON_COAST_OF ON_RIVER CONNECTED_BY_ROAD CONNECTED_BY_RIVER CONNECTED_TO FOUGHT_IN DESTROYED_IN ASSOCIATED_WITH HISTORICALLY_ASSOCIATED_WITH MENTIONED_WITH OTHER USES POSSESSES RENTS DIED_IN'.split())
CONTAINMENT = {'LOCATED_IN', 'INSIDE', 'PART_OF', 'CAPITAL_OF'}
SPATIAL = set('NORTH_OF SOUTH_OF EAST_OF WEST_OF NORTHEAST_OF NORTHWEST_OF SOUTHEAST_OF SOUTHWEST_OF NEAR BORDERS BETWEEN ON_COAST_OF ON_RIVER CONNECTED_BY_ROAD CONNECTED_BY_RIVER CONNECTED_TO'.split())

manifest = read(OUT / 'source_inventory.json')
for f in manifest['files']:
    assert hashlib.sha256((ROOT / f['path']).read_bytes()).hexdigest() == f['sha256'], f"Source changed: {f['path']}"
    f['source_id'] = 'SRC-' + (f['episode'] if 'episode' in f else 'CANON-' + slug(pathlib.Path(f['path']).stem).upper())
write(OUT / 'source_inventory.json', manifest)
sources = {f['source_id']: f for f in manifest['files']}
docs = {f['episode']: read(ROOT / f['path']) for f in manifest['files'] if 'episode' in f}
reviews = [read(p) for p in sorted((SCRIPTS / 'reviews').glob('*.json'))]
review_fields = collections.defaultdict(list)
for review in reviews:
    for k, v in review.items():
        if isinstance(v, list):
            review_fields[k].extend(v)
owner_merges = [m for review in reviews for m in review.get('owner_merges', [])]
fact_replacements = {(item['episode'], item['pointer']): item for review in reviews for item in review.get('fact_replacements', [])}
fact_exclusions = {(item['episode'], item['pointer']): item for review in reviews for item in review.get('fact_exclusions', [])}
owner_relationships = [r for review in reviews for r in review.get('owner_relationships', [])]
owner_aliases = [a for review in reviews for a in review.get('owner_aliases', [])]
owner_alias_exclusions = {(item['episode'], item['index'], alias): item for review in reviews for item in review.get('owner_alias_exclusions', []) for alias in item['aliases']}
owner_global_alias_exclusions = {(item['entity'], item['alias']): item for review in reviews for item in review.get('owner_global_alias_exclusions', [])}
owner_entities = [e for review in reviews for e in review.get('owner_entities', [])]
owner_facts = [f for review in reviews for f in review.get('owner_facts', [])]
identity_overrides = {(item['episode'], item['index']): item for review in reviews for item in review.get('entity_identity_overrides', [])}
resolved_uncertainties = {(item['episode'], item['index']): item for review in reviews for item in review.get('resolved_uncertainties', [])}
resolved_conflict_ids = {item['id'] for review in reviews for item in review.get('resolved_conflicts', [])}

ledger_path = SCRIPTS / 'id_registry.json'
ledger = read(ledger_path) if ledger_path.exists() else {'version': 1, 'identities': {}, 'sequences': {}}
initial_ledger = copy.deepcopy(ledger)


def stable_id(kind, key):
    k = kind + ':' + key
    if k not in ledger['identities']:
        p = PREFIX.get(kind, kind)
        n = ledger['sequences'].get(p, 0) + 1
        ledger['sequences'][p] = n
        ledger['identities'][k] = f'{p}-{n:04d}'
    return ledger['identities'][k]


def ref(ep, pointer):
    return {'source_id': 'SRC-' + ep, 'pointer': pointer}


def refs_of(r):
    if r.get('source_refs'):
        return r['source_refs']
    if r.get('sources'):
        return [ref(x['episode'], x['pointer']) if 'episode' in x else x for x in r['sources']]
    return [ref(r['episode'], p) for p in r.get('source_pointers', [r.get('pointer', '')]) if p]


conflicts = []
corrections = []


def conflict(kind, summary, source_refs=None, ids=None, details=None):
    key = json.dumps([kind, summary, source_refs or []], ensure_ascii=False, sort_keys=True)
    c = {'id': stable_id('CNF', key), 'kind': kind, 'status': 'open', 'summary': summary,
         'entity_ids': sorted(set(ids or [])), 'source_refs': source_refs or []}
    if details is not None:
        c['details'] = details
    conflicts.append(c)
    return c['id']


def correction(kind, reason, source_refs, before=None, after=None):
    c = {'kind': kind, 'reason': reason, 'source_refs': source_refs}
    if before is not None:
        c['before'] = before
    if after is not None:
        c['after'] = after
    corrections.append(c)


def canon_type(filename, name, heading):
    if filename == 'DragonAndGodNames.md':
        return 'DRAGON' if heading == 'Ejderhalar:' else 'DEITY'
    if filename == 'Items.md':
        return 'ITEM'
    if filename == 'Bosses.md':
        return 'CREATURE'
    if filename == 'characters.md':
        return 'CREATURE' if any(x in name for x in ['(Papağan)', '(Kompi)', '(Ayı)', '(Karga)', '(İnek)', 'Sarı İnek', 'Yokoluş Bey']) else 'PERSON'
    if filename == 'locations.md':
        for suffix, typ in [('Kıtası', 'CONTINENT'), ('Krallığı', 'KINGDOM'), ('Şehir Devleti', 'STATE'), ('Kasabası', 'TOWN'), ('Şehri', 'CITY'), ('Adası', 'ISLAND'), ('Ülkesi', 'STATE'), ('Hanı', 'TAVERN'), ('Kahvesi', 'TAVERN'), ('Kervansaray', 'BUILDING'), ('Ormanı', 'NATURAL_FEATURE')]:
            if name.endswith(suffix):
                return typ
        return 'DISTRICT' if name == 'Revantown' else 'NATURAL_FEATURE'
    for part, typ in [('Ailesi', 'FAMILY'), ('Hanedanı', 'DYNASTY'), ('Bölüğü', 'MILITARY_UNIT'), ('Gemisi', 'SHIP'), ('Tapınağı', 'TEMPLE'), ('Savaşları', 'HISTORICAL_EVENT'), ('Dönemi', 'HISTORICAL_ERA'), (' Otu', 'PLANT'), (' Köku', 'PLANT'), ('Haydutları', 'FACTION'), ('Yumruğu', 'FACTION')]:
        if part in name:
            return typ
    return 'CREATURE' if name == 'Kompisaurus' else 'OTHER'


canon = {}
canon_groups = []
for f in manifest['files']:
    if not f['path'].startswith('Canon/'):
        continue
    filename = pathlib.Path(f['path']).name
    heading = ''
    for line, raw in enumerate((ROOT / f['path']).read_text().splitlines(), 1):
        name = raw.strip()
        if not name:
            continue
        if name.endswith(':'):
            heading = name
            continue
        names = [x.strip() for x in name.split('/')]
        names = [x for x in names if x]
        for n in names:
            canon[n] = {'type': canon_type(filename, n, heading), 'source_refs': [{'source_id': f['source_id'], 'line': line}], 'heading': heading}
        if len(names) > 1:
            canon_groups.append({'names': names, 'canonical_name': names[0], 'reason': 'Canon explicitly joins these names with a slash.', 'source_refs': canon[names[0]]['source_refs']})

raw_occurrences = collections.defaultdict(list)
identity_override_aliases = {}
for ep, d in sorted(docs.items()):
    for i, e in enumerate(d['entities']):
        override = identity_overrides.get((ep, i))
        if override:
            record = copy.deepcopy(e)
            record['n'] = override['name']
            identity_override_aliases[e['n']] = override['name']
            raw_occurrences[override['name']].append((ep, i, record))
        else:
            raw_occurrences[e['n']].append((ep, i, e))

# Explicit editorial naming rules complement the episode reviewers. No fuzzy merge.
manual_merges = [
    ('Akmer', 'Akmer Sütçüoğlu', 'Canon names the player; EP00 explicitly identifies Akmer as the family princess.', 'EP00', '/entities/0'),
    ('Sütçüoğlu Ailesi', 'Sütçuoğlu Ailesi', 'Canonical family spelling takes priority; no family membership inferred.', 'EP00', '/entities/13'),
    ('Tütüncüoğlu Ailesi', 'Tütüncüoğulu Ailesi', 'Canonical family spelling takes priority; no surname inference.', 'EP00', '/entities/14'),
    ('Astralum Tozu', 'Astralyum Tozu', 'Canonical spelling of the named magical dust.', 'EP07', '/entities/14'),
    ('Şebekem', 'Shebekem', 'Canonical Turkish transcription of this school official.', 'EP12', '/entities/6'),
    ('İşu', 'İşü', 'Canonical spelling of the named commander’s assistant.', 'EP13', '/entities/7'),
    ('Maraşel Cart Curtoğlu', 'Mareşal Cart Curtoğlu', 'Canonical spelling and title; same named commander.', 'EP18', '/entities/5'),
    ('Yok Oluş Bey', 'Yokoluş Bey', 'Canonical spacing of the explicitly named parasitic mouth.', 'EP18', '/entities/7'),
    ('Gizem Sarma', 'Gizemsarma', 'EP23 explicitly supplies Gizem Sarma as alias of this deity.', 'EP23', '/entities/23/a/0'),
]
merges = canon_groups + review_fields['merges'] + owner_merges + [dict(names=[a,b], canonical_name=b, reason=reason, sources=[{'episode':ep,'pointer':ptr}]) for a,b,reason,ep,ptr in manual_merges]
all_names = set(raw_occurrences) | set(canon)
for m in merges:
    all_names.update(m['names'])
    all_names.add(m['canonical_name'])
parent = {n:n for n in all_names}


def find(n):
    if n not in parent:
        parent[n] = n
    if parent[n] != n:
        parent[n] = find(parent[n])
    return parent[n]


merge_log = []
for m in merges:
    names = list(dict.fromkeys(m['names'] + [m['canonical_name']]))
    # Distinct canonical entries cannot be merged through episode aliases.
    known = {n for n in parent if n in canon and find(n) in {find(x) for x in names}}
    slash_sets = [set(g['names']) for g in canon_groups]
    if len(known) > 1 and not m.get('owner_confirmed') and not any(known <= x for x in slash_sets):
        conflict('canonical_identity_distinction', 'Merge rejected because Canon lists distinct names: ' + ', '.join(sorted(known)), refs_of(m), details=m)
        continue
    root = find(m['canonical_name'])
    for n in names:
        parent[find(n)] = root
    merge_log.append(m)

clusters = collections.defaultdict(list)
for n in list(parent):
    clusters[find(n)].append(n)

overrides = {(x['episode'], x['index']):x for x in review_fields['entity_overrides']}
rejected = {(x['episode'], x['index'], x['alias']):x['reason'] for x in review_fields['rejected_aliases']}
for x in review_fields['alias_exclusions']:
    for alias in x['aliases']:
        rejected[(x['episode'], x['index'], alias)] = x['reason']
blocked_alias_pairs = {
    ('Helvanar Kıtası', 'Helva Adası'): 'Canon lists the island and continent separately; alias identity is not established.',
    ('Metal Ejderha', 'Bronz Ejderha'): 'Canon lists separate dragons.',
    ('Metal Ejderha', 'Kahverengi Ejderha'): 'Canon lists separate dragons.',
    ('İbrahim (Kompi)', 'Kompi'): 'Kompi is shared with the species and is not a unique identifier.',
    ('İbrahim (Kompisaurus)', 'Kompi'): 'Kompi is shared with the species and is not a unique identifier.',
}
period_overrides = {(x['episode'], x['pointer']):x for x in review_fields['period_overrides'] if 'pointer' in x}
period_notes_used = set()


def period_for(ep, pointer, text='', scene=False):
    key = (ep, pointer)
    candidates = [key]
    if '/facts/' in pointer:
        candidates.append((ep, pointer.split('/facts/')[0]))
    for key in candidates:
        if key in period_overrides:
            p = period_overrides[key]
            period_notes_used.add(key)
            return p.get('period'), 'reviewed_source_context'
    # Merely giving a number in quoted dialogue does not date the whole assertion.
    if re.search(r'1300 civar[ıı]?(?:nda|ı döneminde|ı döneminde)? var olan', text):
        return '1300 civarı', 'explicit_statement'
    if scene:
        if ep in ('EP08', 'EP09'):
            return '1300 civarı', 'reviewed_narrative_scene'
        if ep != 'EP07' and len(docs[ep]['period']) == 1:
            return docs[ep]['period'][0], 'episode_scene'
    return None, 'not_established'


entities = []
by_id = {}
name_ids = {}
source_entity_ids = {}
used_slugs = set()
facts_by_entity = collections.defaultdict(dict)
episode_kinds = collections.defaultdict(lambda:collections.defaultdict(set))


def new_entity(name, typ, key=None, **extra):
    entity_key = key or norm(name)
    # Entity identity survives classification changes. Preserve an existing prefix.
    entity_ids = ledger.setdefault('entity_keys', {})
    if entity_key not in entity_ids:
        previous = [v for k,v in ledger['identities'].items() if k.split(':',1)[0] in PREFIX and k.split(':',1)[1] == entity_key]
        assert len(previous) <= 1, ('Ambiguous existing identity',entity_key)
        entity_ids[entity_key] = previous[0] if previous else stable_id(typ,entity_key)
    ident = entity_ids[entity_key]
    base = slug(name)
    unique = base if base not in used_slugs else base + '-' + ident.lower()
    used_slugs.add(unique)
    e = {'id':ident, 'slug':unique, 'name':name, 'type':typ, 'aliases':[], 'periods':[],
         'episodes':[], 'first_appearance':None, 'continuity_scope':'MAIN_TIMELINE',
         'confidence':'source_supported', 'source_refs':[]}
    e.update(extra)
    entities.append(e)
    by_id[ident] = e
    name_ids[name] = ident
    return e


def add_fact(e, text, source_refs, period=None, temporal_basis='not_established', confidence='source_supported', status=None):
    key = norm(text)
    # Two purely grammatical variants of the repeated continent-existence claim.
    if re.fullmatch(r'1300 civar(?:ı döneminde|ında) var olan kıta\.', key):
        key = '1300 continent existence'
    bucket = facts_by_entity[e['id']]
    if key not in bucket:
        bucket[key] = {'id':'FCT-' + digest(e['id']+'|'+key), 'text':text, 'assertions':[]}
    if status:
        bucket[key]['status'] = status
    assertion = {'period':period, 'temporal_basis':temporal_basis, 'confidence':confidence, 'source_refs':source_refs}
    if assertion not in bucket[key]['assertions']:
        bucket[key]['assertions'].append(assertion)


for root, names in sorted(clusters.items(), key=lambda pair:min(norm(x) for x in pair[1])):
    cn = [n for n in names if n in canon]
    preferred = next((m['canonical_name'] for m in reversed(merges) if m['canonical_name'] in names), root)
    owner_canonical = next((m['canonical_name'] for m in merges
                            if m.get('owner_confirmed') and set(names) <= set(m.get('names', []))), None)
    display = owner_canonical or (cn[0] if len(cn) == 1 else preferred)
    if len(cn) > 1 and not owner_canonical:
        display = next(g['canonical_name'] for g in canon_groups if set(cn) <= set(g['names']))
    occurrences = [x for n in names for x in raw_occurrences.get(n, [])]
    source_types = []
    for ep,i,r in occurrences:
        source_types.append(overrides.get((ep,i),{}).get('type',r['t']))
    typ = collections.Counter(source_types).most_common(1)[0][0] if source_types else canon[display]['type'] if display in canon else 'OTHER'
    if display in canon and canon[display]['type'] in {'TOWN','STATE','DEITY','DRAGON','FAMILY','DYNASTY'}:
        typ = canon[display]['type']
    if typ == 'SQUARE':
        typ = 'DISTRICT'
    if display in ("Pastırman'ın Demir Eldiveni", 'Demir Yumruk Anıtı'):
        typ = 'BUILDING'
    if display == 'Sütçüoğlu Ataları' or display == 'İsrafsoy ve Kıtlıkan':
        typ = 'OTHER'
    if display in ('Limonlu Hardal Sosu', 'Acı Biberli Tereyağı Sosu'):
        typ = 'ITEM'
    assert typ in PREFIX, (display,typ)
    owner_identity = next((m for m in owner_merges
                           if m.get('owner_confirmed') and m.get('canonical_name') == display), None)
    e = new_entity(display,typ,key=(owner_identity or {}).get('stable_key'))
    for owner_merge in owner_merges:
        if owner_merge.get('owner_confirmed') and owner_merge.get('canonical_name') == display:
            for legacy_slug in owner_merge.get('legacy_slugs', []):
                if legacy_slug != e['slug']:
                    assert legacy_slug not in used_slugs, ('Duplicate legacy slug', legacy_slug)
                    used_slugs.discard(e['slug'])
                    e['slug'] = legacy_slug
                    used_slugs.add(legacy_slug)
    e['name_status'] = 'canon_confirmed' if cn else 'source_attested'
    e['record_status'] = 'episode_attested' if occurrences else 'canon_only'
    for n in names:
        name_ids[n] = e['id']
    for n in cn:
        e['source_refs'].extend(canon[n]['source_refs'])
    aliases = collections.defaultdict(list)
    for n in names:
        if n != display:
            aliases[n].extend(canon[n]['source_refs'] if n in canon else [ref(ep,f'/entities/{i}/n') for ep,i,_ in raw_occurrences.get(n,[])])
    for ep,i,r in sorted(occurrences):
        source_entity_ids[(ep,i)] = e['id']
        e['source_refs'].append(ref(ep,f'/entities/{i}'))
        episode_kinds[e['id']][ep].add('entity_record')
        for j,a in enumerate(r['a']):
            owner_exclusion = owner_alias_exclusions.get((ep, i, a))
            reason = rejected.get((ep,i,a)) or blocked_alias_pairs.get((r['n'],a))
            if owner_exclusion:
                correction('owner_confirmed_alias_exclusion', owner_exclusion['reason'], [ref(ep,f'/entities/{i}/a/{j}')], a, 'excluded_from_normalized_aliases')
            elif reason:
                conflict('disputed_alias', reason, [ref(ep,f'/entities/{i}/a/{j}')], [e['id']], {'alias':a})
            elif a != display:
                aliases[a].append(ref(ep,f'/entities/{i}/a/{j}'))
        for j,fact in enumerate(r['facts']):
            ptr = f'/entities/{i}/facts/{j}'
            exclusion = fact_exclusions.get((ep, ptr))
            if exclusion:
                correction('owner_confirmed_fact_exclusion', exclusion['reason'], [ref(ep, ptr)], fact, 'retained_as_source_classification_error')
                add_fact(e, fact, [ref(ep, ptr)], status='source_classification_error')
                continue
            replacement = fact_replacements.get((ep, ptr))
            if replacement:
                correction('owner_confirmed_fact_text', replacement['reason'], [ref(ep,ptr)], fact, replacement['replacement'])
                fact = replacement['replacement']
            per,basis = period_for(ep,ptr,fact)
            add_fact(e,fact,[ref(ep,ptr)],per,basis)
        override = overrides.get((ep,i))
        if override:
            correction('entity_review',override['reason'],[ref(ep,f'/entities/{i}')],r['t'],typ)
        elif r['t'] != typ:
            correction('type_normalization','Normalize the category using explicit source description and canonical type.',[ref(ep,f'/entities/{i}/t')],r['t'],typ)
    for (excluded_entity, excluded_alias), exclusion in owner_global_alias_exclusions.items():
        if excluded_entity == display and excluded_alias in aliases:
            aliases.pop(excluded_alias, None)
            correction('owner_confirmed_alias_exclusion', exclusion['reason'], exclusion.get('source_refs', []), excluded_alias, 'excluded_from_normalized_aliases')
    e['aliases'] = sorted(aliases,key=norm)
    if aliases:
        e['alias_assertions'] = [{'name':n,'source_refs':rs} for n,rs in sorted(aliases.items(),key=lambda pair:norm(pair[0]))]
    if len(set(source_types)) > 1:
        correction('type_reconciliation','Retained the normalized type; all original category assertions remain traceable.',e['source_refs'],sorted(set(source_types)),typ)

for original_name, override_name in identity_override_aliases.items():
    if override_name in name_ids:
        name_ids[original_name] = name_ids[override_name]

# Separate the institution from its explicitly described campus. No cloned full lore.
campus = new_entity('Arifler Okulu Yerleşkesi','BUILDING',record_status='editorial_entity_split',name_status='editorial_descriptor')
campus['source_refs'] = [ref('EP08','/entities/13/facts/0'),ref('EP11','/entities/11/facts/0')]
campus['institution_id'] = name_ids['Arifler Okulu']
campus['fact_ids'] = [f['id'] for f in facts_by_entity[name_ids['Arifler Okulu']].values()]
correction('institution_site_split','The school institution and its physical campus need distinct identities for membership and map placement.',campus['source_refs'], 'Arifler Okulu', [name_ids['Arifler Okulu'],campus['id']])

# These locations are explicitly named in movement evidence, although omitted from
# the episode entity arrays. Descriptive labels are preserved as such, not canon names.
route_places = [
    ('Pastırmancı Radikal Birlikler Askeri Kampı','REGION','EP19','/travel/3/to'),
    ('Revania Denizleri','NATURAL_FEATURE','EP01','/travel/0/via/0'),
    ('Helvanar Çölü','NATURAL_FEATURE','EP22','/travel/1/to'),
    ('Çöl Şehri Çıkmaz Sokağı','DISTRICT','EP10','/travel/0/from'),
    ('Çöl Şehri İnşaat Yakını Gizli Ev / Sığınak','BUILDING','EP10','/travel/1/to'),
    ('Çöl Şehri Gölet Alanı','NATURAL_FEATURE','EP14','/travel/1/to'),
]
for n,t,ep,ptr in route_places:
    e = new_entity(n,t,record_status='travel_attested',name_status='source_descriptor')
    e['source_refs'] = [ref(ep,ptr)]
    episode_kinds[e['id']][ep].add('travel')

for spec in owner_entities:
    e = new_entity(spec['name'], spec['type'], key=spec.get('stable_key'),
                   record_status='editorial_entity_split', name_status='editorial_descriptor')
    e['source_refs'] = spec['source_refs']
    e['periods'] = list(spec.get('periods', []))
    for sr in spec['source_refs']:
        source_id = sr.get('source_id', '')
        if re.fullmatch(r'SRC-EP\d{2}', source_id):
            episode_kinds[e['id']][source_id.removeprefix('SRC-')].add('entity_record')
    e['aliases'] = sorted(set(spec.get('aliases', [])), key=norm)
    if e['aliases']:
        e['alias_assertions'] = [{'name': a, 'source_refs': spec['source_refs']} for a in e['aliases']]
    for item in spec.get('facts', []):
        add_fact(e, item['text'], item.get('source_refs', spec['source_refs']), item.get('period'), 'owner_confirmation', 'source_supported')
    correction('owner_confirmed_entity_split', spec['reason'], spec['source_refs'], spec.get('split_from'), e['id'])

for item in owner_facts:
    ident = name_ids.get(item['entity'])
    if ident:
        add_fact(by_id[ident], item['text'], item['source_refs'], item.get('period'), 'owner_confirmation', 'source_supported')
        correction('owner_confirmed_fact', item['reason'], item['source_refs'], None, item['text'])

# The source explicitly names a pair of gods. Joint-domain claims stay on the pair.
pair_id = name_ids.get('İsrafsoy ve Kıtlıkan')
if pair_id:
    by_id[pair_id]['subtype'] = 'DEITY_PAIR'
    for n in ['İsrafsoy','Kıtlıkan']:
        e = new_entity(n,'DEITY',record_status='source_entity_split',name_status='source_attested')
        e['source_refs'] = [ref('EP23','/entities/28')]
        episode_kinds[e['id']]['EP23'].add('entity_record')
    by_id[pair_id]['member_ids'] = [name_ids['İsrafsoy'],name_ids['Kıtlıkan']]

alias_ids = collections.defaultdict(set)
for e in entities:
    for n in [e['name']] + e['aliases']:
        alias_ids[norm(n)].add(e['id'])


def resolve(name, site=False):
    if not name:
        return None
    if site and (name == 'Arifler Okulu' or name == campus['name']):
        return campus['id']
    if name in name_ids:
        return name_ids[name]
    ids = alias_ids.get(norm(name),set())
    return next(iter(ids)) if len(ids) == 1 else None

for owner_alias in owner_aliases:
    ident = resolve(owner_alias['entity'])
    if ident and owner_alias['alias'] not in by_id[ident]['aliases']:
        by_id[ident]['aliases'].append(owner_alias['alias'])
        by_id[ident].setdefault('alias_assertions', []).append({'name': owner_alias['alias'], 'source_refs': owner_alias['source_refs']})
        by_id[ident]['aliases'] = sorted(set(by_id[ident]['aliases']), key=norm)
        alias_ids[norm(owner_alias['alias'])].add(ident)


for m in merge_log:
    correction('evidence_backed_identity_merge',m['reason'],refs_of(m),m['names'],resolve(m['canonical_name']))

for r in review_fields['conflicts']:
    conflict(r.get('kind','semantic_review'),r.get('summary',r.get('issue','Review required')),refs_of(r),[x for n in r.get('names',[]) if (x:=resolve(n))],r.get('options') or r.get('details'))

for ep,d in docs.items():
    for i,u in enumerate(d['uncertainties']):
        resolved = resolved_uncertainties.get((ep, i))
        if resolved:
            correction('owner_confirmed_uncertainty_resolution', resolved['reason'], [ref(ep, f'/uncertainties/{i}')], u['issue'], resolved['resolution'])
            continue
        conflict('source_uncertainty',u['issue'],[ref(ep,f'/uncertainties/{i}')],details=u)

# Shared aliases are search ambiguities, never automatic identity merges.
for n, ids in sorted(alias_ids.items()):
    if len(ids)>1:
        conflict('alias_collision','Name or alias resolves to several distinct entities: '+n,[],list(ids),{'lookup':n})

relationships = []
rel_index = {}
source_link_dispositions = []


def add_relationship(subject, relation, obj, evidence, source_refs, period=None, basis='not_established', confidence='source_supported'):
    if not subject or not obj:
        conflict('unresolved_relationship_endpoint','Relationship endpoint cannot be resolved without guessing.',source_refs,details={'subject_id':subject,'relation':relation,'object_id':obj,'evidence':evidence})
        return None
    if relation not in ALLOWED:
        conflict('unrecognized_relationship','Review predicate: '+relation,source_refs,[subject,obj],{'evidence':evidence})
        return None
    key = (subject,relation,obj,period)
    if key not in rel_index:
        r = {'id':stable_id('REL',json.dumps(key,ensure_ascii=False)), 'subject_id':subject,'relation':relation,'object_id':obj,
             'period':period,'episodes':[],'confidence':confidence,'assertions':[],'continuity_scope':'MAIN_TIMELINE'}
        rel_index[key]=r
        relationships.append(r)
    r=rel_index[key]
    a={'evidence':evidence,'temporal_basis':basis,'source_refs':source_refs,'confidence':confidence}
    if a not in r['assertions']:
        r['assertions'].append(a)
    for sr in source_refs:
        ep=sr['source_id'].removeprefix('SRC-')
        if ep in docs:
            if ep not in r['episodes']:
                r['episodes'].append(ep)
            episode_kinds[subject][ep].add('relationship')
            episode_kinds[obj][ep].add('relationship')
    if period and relation in {'PRESENT_IN','VISITED','WORKS_IN','LIVES_IN','DIED_IN','LOCATED_IN','INSIDE','CAPITAL_OF'}:
        for ident in [subject,obj]:
            if period not in by_id[ident]['periods']:
                by_id[ident]['periods'].append(period)
    return r['id']


link_overrides={(r['episode'],r['index']):r for r in review_fields['relationship_overrides']}
scene_relations={'PRESENT_IN','VISITED','OWNS','USES','POSSESSES','RENTS','DIED_IN','COMMANDS','LEADS','WORKS_IN','OPERATES','LIVES_IN'} | CONTAINMENT | SPATIAL
for ep,d in sorted(docs.items()):
    for i,raw in enumerate(d['links']):
        sr=[ref(ep,f'/links/{i}')]
        r=copy.deepcopy(raw)
        override=link_overrides.get((ep,i))
        disposition={'source_ref':sr[0]}
        if override:
            if override.get('exclude'):
                if override.get('owner_confirmed'):
                    disposition.update(status='owner_corrected')
                    correction('owner_confirmed_relationship_exclusion', override['reason'], sr, raw, 'excluded_from_normalized_relationships')
                    source_link_dispositions.append(disposition)
                    continue
                cid=conflict('excluded_relationship',override['reason'],sr,details={'original':raw})
                disposition.update(status='quarantined',conflict_id=cid)
                source_link_dispositions.append(disposition)
                correction('relationship_quarantine',override['reason'],sr,raw,'Preserved in unresolved_conflicts; no active edge.')
                continue
            for k,f in [('subject','s'),('object','o'),('relation','r')]:
                if k in override:
                    r[f]=override[k]
            correction('relationship_review',override['reason'],sr,raw,{k:r[k] for k in ['s','r','o']})
        relation=r['r']
        subj=resolve(r['s'],site=relation in CONTAINMENT|SPATIAL)
        obj=resolve(r['o'],site=relation in {'PRESENT_IN','VISITED','WORKS_IN','LIVES_IN','DIED_IN'}|CONTAINMENT|SPATIAL)
        ev=r.get('ev',r.get('c',''))
        if relation=='OWNS' and subj and obj and by_id[subj]['type']=='ITEM' and by_id[obj]['type'] in ACTOR_TYPES:
            subj,obj=obj,subj
            correction('reversed_ownership','An item cannot own the actor; corrected subject/object direction.',sr,raw,[subj,'OWNS',obj])
        # OWNS must not quietly turn use, activation or custody into title of ownership.
        if relation=='OWNS' and not override:
            if re.search(r'kirala',ev,re.I):
                relation='RENTS'
            elif re.search(r'kullan|aktive|içerek|tütsü|üfley|yakarak',ev,re.I) and not re.search(r'sahibi|satın|hediye|veril|almıştır|ele geçir',ev,re.I):
                relation='USES'
            elif re.search(r'taşı|kafasında|takılı|bulunmakta|emanet',ev,re.I) and not re.search(r'sahibi|satın|hediye|veril|almıştır|ele geçir',ev,re.I):
                relation='POSSESSES'
            if relation!=r['r']:
                correction('ownership_semantics','Evidence supports use, rental or custody rather than ownership.',sr,r['r'],relation)
        per,basis=period_for(ep,f'/links/{i}',ev,scene=relation in scene_relations)
        if re.search(r'bin yıl|yüzyıl|eski.*savaş|çocuklu|ataları|tarihsel|tarihi olarak|geçmişte|efsane|rivayet',ev,re.I):
            per,basis=None,'historical_date_not_established'
        if override and 'period' in override:
            per,basis=override['period'],'reviewed_source_context'
        rid=add_relationship(subj,relation,obj,ev,sr,per,basis)
        disposition.update(status='normalized' if rid else 'unresolved',relationship_id=rid)
        source_link_dispositions.append(disposition)

for r in review_fields['supplemental_relationships']:
    per,basis=period_for(r['episode'],r.get('pointer',''),r.get('evidence',''),scene=r['relation'] in scene_relations)
    if 'period' in r:
        per,basis=r['period'],'reviewed_source_context'
    add_relationship(resolve(r['subject'],site=r['relation'] in CONTAINMENT|SPATIAL),r['relation'],resolve(r['object'],site=r['relation'] in {'PRESENT_IN','VISITED','WORKS_IN'}|CONTAINMENT|SPATIAL),r['evidence'],refs_of(r),per,basis)

for r in owner_relationships:
    correction('owner_confirmed_relationship', r.get('reason', 'Project owner supplied the canonical relationship.'), r['source_refs'], None, [r['subject'], r['relation'], r['object']])
    add_relationship(resolve(r['subject'],site=r['relation'] in CONTAINMENT|SPATIAL),r['relation'],resolve(r['object'],site=r['relation'] in {'PRESENT_IN','VISITED','WORKS_IN'}|CONTAINMENT|SPATIAL),r['evidence'],r['source_refs'],r.get('period'),'owner_confirmation','source_supported')

add_relationship(campus['id'],'LOCATED_IN',resolve('Çöl Şehri 3. Bölge'),"Çöl Şehri'nin 3. katında yer alan büyü okulu yerleşkesi.",campus['source_refs'],'1300 civarı','reviewed_source_context')
add_relationship(name_ids['Arifler Okulu'],'ASSOCIATED_WITH',campus['id'],'Institution and its explicitly described physical premises.',campus['source_refs'])
if pair_id:
    for member in by_id[pair_id]['member_ids']:
        add_relationship(member,'PART_OF',pair_id,'İsrafsoy ve Kıtlıkan are explicitly described as a pair of gods.',[ref('EP23','/entities/28')])

# Preserve lore in full; links are explicit source-subject matches only.
lore=[]
for ep,d in sorted(docs.items()):
    for i,l in enumerate(d['lore']):
        per,basis=period_for(ep,f'/lore/{i}',l['fact'])
        lrec={'id':stable_id('LOR',ep+'|'+str(i)), 'subject':l['subject'],'text':l['fact'], 'episode':ep,'period':per,'temporal_basis':basis,
              'subject_id':resolve(l['subject']),'source_refs':[ref(ep,f'/lore/{i}')],'continuity_scope':'MAIN_TIMELINE'}
        lore.append(lrec)

travel=[]
travel_overrides={}
for x in review_fields['travel_overrides']:
    travel_overrides.setdefault((x['episode'],x['index']),{}).update(x)


def endpoint(label):
    if not label:
        return {'label':label,'entity_id':None,'resolution':'unknown'}
    ident=resolve(label,site=True)
    if ident and by_id[ident]['type'] in LOCATION_TYPES|{'SHIP','ITEM'}:
        return {'label':label,'entity_id':ident,'resolution':'exact'}
    # Parenthesized room descriptions preserve detail, and are not new aliases.
    base=label.split(' (')[0]
    anchor=resolve(base,site=True) if base!=label else None
    if anchor and by_id[anchor]['type'] in LOCATION_TYPES|{'SHIP'}:
        return {'label':label,'entity_id':None,'context_id':anchor,'resolution':'within_named_location'}
    # A source label that explicitly starts with a known location is an address
    # within/at that location, not evidence that both strings are identical entities.
    choices=[]
    for name,ident in name_ids.items():
        if label.startswith(name+' ') and by_id[ident]['type'] in LOCATION_TYPES:
            choices.append((len(name),campus['id'] if name=='Arifler Okulu' else ident))
    if choices:
        anchor=max(choices)[1]
        return {'label':label,'entity_id':None,'context_id':anchor,'resolution':'location_description'}
    return {'label':label,'entity_id':None,'resolution':'unresolved_description'}


for ep,d in sorted(docs.items()):
    for i,t in enumerate(d['travel']):
        sr=[ref(ep,f'/travel/{i}')]
        per,basis=period_for(ep,f'/travel/{i}',scene=True)
        ov=travel_overrides.get((ep,i),{})
        sr.extend(ref(ep,p) for p in ov.get('source_pointers',[]))
        if 'period' in ov:
            per,basis=ov['period'],'reviewed_source_context'
        travelers=[]
        unresolved=[]
        for n in t.get('party',t.get('characters_present',[])):
            if n in ov.get('remove_party',[]):
                continue
            ident=resolve(n)
            if ident:
                travelers.append(ident)
            else:
                unresolved.append({'label':n,'entity_id':None})
        a,b=endpoint(t['from']),endpoint(t['to'])
        # Preserve original detail even when a reviewer resolves the broad endpoint.
        for side,value in [('from',a),('to',b)]:
            if side in ov:
                value['reviewed_context_id']=resolve(ov[side],site=True)
        via=[dict(sequence=j+1,**endpoint(n)) for j,n in enumerate(ov.get('via',t.get('via',[])))]
        status=ov.get('status','source_reported')
        if ep=='EP01':
            status='in_progress'
        if ep=='EP22' and i==0:
            status='composite_route_requires_review'
        transport_labels=[x.strip() for x in t.get('transport','').split('&') if x.strip() and x.strip() not in ov.get('remove_transport',[])]
        transports=[resolve(x) for x in transport_labels]
        record={'id':stable_id('TRV',ep+'|'+str(i)), 'episode':ep,'sequence':t.get('order',i+1),'period':per,'temporal_basis':basis,
                'traveler_ids':sorted(set(travelers)),'from_id':a['entity_id'],'to_id':b['entity_id'],'via_ids':[w['entity_id'] for w in via if w['entity_id']],
                'origin':a,'destination':b,'waypoints':via,'status':status,'confidence':'source_supported',
                'source_refs':sr,'continuity_scope':'MAIN_TIMELINE'}
        if unresolved:
            record['unresolved_travelers']=unresolved
        if t.get('transport'):
            record['transport']={'description':t['transport'],'entity_ids':[x for x in transports if x]}
        for k in ['from_period','to_period','reason']:
            if k in ov:
                record[k]=ov[k]
        if ep=='EP07':
            record['from_period']=ov.get('from_period')
            record['to_period']='1300 civarı'
            record['status']='temporal_transition'
        travel.append(record)
        for ident in travelers+[x for w in [a,b]+via for x in [w['entity_id'],w.get('context_id'),w.get('reviewed_context_id')] if x]:
            episode_kinds[ident][ep].add('travel')
        if per:
            for ident in travelers:
                if per not in by_id[ident]['periods']:
                    by_id[ident]['periods'].append(per)
            for w in [a,b]+via:
                ident=w['entity_id'] or w.get('context_id')
                if ident and status not in {'in_progress','composite_route_requires_review'} and per not in by_id[ident]['periods']:
                    by_id[ident]['periods'].append(per)
        if ov:
            correction('travel_review',ov.get('reason','Reviewed route details.'),sr,t,record)
        unresolved_route = any(x['resolution']=='unresolved_description' for x in [a,b]+via) or bool(unresolved)
        if unresolved_route and ov.get('owner_confirmed'):
            correction('owner_confirmed_travel_resolution', ov.get('reason','Project owner confirmed the descriptive route anchors.'), sr, {'travel_id':record['id'],'unresolved_locations':[x['label'] for x in [a,b]+via if x['resolution']=='unresolved_description']}, 'retained_as_contextual_route_detail')
        elif unresolved_route:
            conflict('travel_resolution','Route retains source descriptions that cannot be safely converted to exact global locations or named travelers.',sr,travelers,{'travel_id':record['id'],'unresolved_locations':[x['label'] for x in [a,b]+via if x['resolution']=='unresolved_description'],'unresolved_travelers':[x['label'] for x in unresolved]})

# EP22's first source route collapses different origins into one party route.
# Replace it with explicitly supported branches, preserving the shared source link.
composite=next(t for t in travel if t['episode']=='EP22' and t['sequence']==1)
travel.remove(composite)
branches=[
    ('akmer',['Akmer'],'Tahin Saray Nezarethanesi','Tahin Saray Kervansarayı Avlusu',['Tahin Saray Delil Odası'],['/entities/0/facts/1','/entities/0/facts/2','/entities/0/facts/3']),
    ('kalender',['Kalender Tütüncüoğlu'],'Tahin Saray Reviri','Tahin Saray Kervansarayı Avlusu',['Tahin Saray Delil Odası'],['/entities/1/facts/1','/entities/1/facts/3']),
    ('ito',['İto İtoğlu'],"Tahin Saray Kervansarayı (Hulusi'nin Odası)",'Tahin Saray Kervansarayı Avlu Kapısı',['Tahin Saray Kervansarayı At Ahırı'],['/entities/2/facts/1','/entities/2/facts/4']),
    ('roary',['Roary'],"Tahin Saray Kervansarayı (Hulusi'nin Odası)",'Tahin Saray Kervansarayı Avlusu',['Tahin Saray Delil Odası'],['/entities/3/facts/1','/entities/3/facts/3','/entities/3/facts/4']),
]
for branch,names,start,end,through,pointers in branches:
    t=copy.deepcopy(composite)
    t['id']=stable_id('TRV','EP22|0|'+branch)
    t['branch']=branch
    t['status']='reviewed_split_route'
    t['traveler_ids']=[resolve(n) for n in names]
    t['origin'],t['destination']=endpoint(start),endpoint(end)
    t['from_id'],t['to_id']=t['origin']['entity_id'],t['destination']['entity_id']
    t['waypoints']=[dict(sequence=j+1,**endpoint(n)) for j,n in enumerate(through)]
    t['via_ids']=[w['entity_id'] for w in t['waypoints'] if w['entity_id']]
    t['source_refs']=[ref('EP22','/travel/0')]+[ref('EP22',p) for p in pointers]
    t['reason']='Original combined route split using explicit character actions. No assertion that every traveler visited every original room.'
    travel.append(t)
    for w in [t['origin'],t['destination']]+t['waypoints']:
        ident=w['entity_id'] or w.get('context_id')
        if ident:
            episode_kinds[ident]['EP22'].add('travel')
correction('split_party_route','EP22 combined distinct room origins; four separately evidenced routes replace that composite.',[ref('EP22','/travel/0')],composite['id'],[t['id'] for t in travel if t.get('branch')])
# Retire only the technical composite-resolution warning now that branches exist.
conflicts[:]=[c for c in conflicts if not(c['kind']=='travel_resolution' and c.get('details',{}).get('travel_id')==composite['id'])]
travel.sort(key=lambda t:(t['episode'],t['sequence'],t.get('branch','')))

# Editorial event summaries have reviewed, explicit source pointers.
timeline=[]
for r in review_fields['events']:
    e=new_entity(r['title'],'HISTORICAL_EVENT',key='timeline|'+r['episode']+'|'+norm(r['title']),record_status='source_event',name_status='editorial_title')
    e['source_refs']=refs_of(r)
    per=r.get('period')
    if per:
        e['periods']=[per]
    add_fact(e,r['summary'],e['source_refs'],per,'reviewed_source_context')
    episode_kinds[e['id']][r['episode']].add('event')
    event={'event_id':e['id'],'episode':r['episode'],'period':per,'title':r['title'],'summary_fact_id':next(iter(facts_by_entity[e['id']].values()))['id'],
           'event_status':r.get('event_status','occurred'),'source_refs':e['source_refs'],'continuity_scope':'MAIN_TIMELINE'}
    for field,names_field in [('participant_ids','participant_names'),('location_ids','location_names'),('related_entity_ids','related_names')]:
        ids=[]
        labels=[]
        for n in r.get(names_field,[]):
            ident=resolve(n,site=field=='location_ids')
            if not ident and field=='location_ids':
                place=endpoint(n)
                ident=place.get('context_id')
                if ident:
                    event.setdefault('location_details',[]).append({'label':n,'context_id':ident})
            if ident and (field!='location_ids' or by_id[ident]['type'] in LOCATION_TYPES|{'SHIP'}):
                ids.append(ident)
                episode_kinds[ident][r['episode']].add('event_reference')
            else:
                labels.append(n)
        event[field]=sorted(set(ids))
        if labels:
            event['unresolved_'+names_field]=labels
            conflict('event_entity_resolution','Event references retain unresolved labels.',e['source_refs'],details={'event_id':e['id'],'field':names_field,'labels':labels})
    timeline.append(event)

# Explicit world state assertions; absence is a claim, never inferred from no mention.
states=[]
helvanar=resolve('Helvanar Kıtası')
states.append({'id':stable_id('WST','helvanar-1300'),'entity_id':helvanar,'period':'1300 civarı','state':'exists','source_refs':[ref('EP09','/entities/35/facts/0')],'confidence':'source_supported'})
states.append({'id':stable_id('WST','helvanar-1600'),'entity_id':helvanar,'period':'1600 civarı','state':'reported_lost','source_refs':[ref('EP08','/entities/25/facts/0')],'confidence':'source_supported','owner_confirmation':'The project brief explicitly places Helvanar as existing circa 1300 and lost/absent circa 1600.','qualification':'Later loss is described in a mixed-period episode; exact destruction date and mechanism remain unresolved.'})
if '1300 civarı' not in by_id[helvanar]['periods']:
    by_id[helvanar]['periods'].append('1300 civarı')

georel=[r for r in relationships if by_id[r['subject_id']]['type'] in LOCATION_TYPES and by_id[r['object_id']]['type'] in LOCATION_TYPES and r['relation'] in CONTAINMENT|SPATIAL]
map_canon=[]
for e in entities:
    if e['type'] not in LOCATION_TYPES:
        continue
    constraints=[r for r in georel if r['subject_id']==e['id']]
    temporal=[]
    for per in sorted({r['period'] for r in constraints},key=lambda x:x or ''):
        containment=[r for r in constraints if r['period']==per and r['relation'] in CONTAINMENT]
        candidates=sorted({r['object_id'] for r in containment})
        # Remove broader ancestors only when other explicit containment edges prove it.
        graph=collections.defaultdict(set)
        for r in georel:
            if r['relation'] in CONTAINMENT and r['period']==per:
                graph[r['subject_id']].add(r['object_id'])
        def ancestors(n, seen=None):
            seen=set() if seen is None else set(seen)
            if n in seen:
                return set()
            seen.add(n)
            return graph[n] | {p for a in graph[n] for p in ancestors(a,seen)}
        narrow=[n for n in candidates if not any(n in ancestors(other) for other in candidates if other!=n)]
        temporal.append({'period':per,'parent_id':narrow[0] if len(narrow)==1 else None,'parent_candidate_ids':narrow,'containment_relationship_ids':[r['id'] for r in containment],
                         'spatial_relations':[{'relation':r['relation'],'target_id':r['object_id'],'relationship_id':r['id']} for r in constraints if r['period']==per and r['relation'] in SPATIAL]})
        if len(narrow)>1:
            conflict('geography_parent_ambiguity','Several non-comparable geographic parents are asserted; no parent chosen.',[s for r in containment for a in r['assertions'] for s in a['source_refs']],[e['id']]+narrow,{'period':per})
    domain='unknown'
    if e['name'] in ['Ejderhalar Sofrası Harabeleri','Sütçüoğlu Deney Mutfağı Sınav Yansıması','Pastırman Kozmik Savaş Boyutu','İdilik Yayla']:
        domain='supernatural_or_uncertain'
    map_canon.append({'location_id':e['id'],'periods':e['periods'],'placement_basis':'CANON_CONSTRAINED' if constraints else 'UNKNOWN','spatial_domain':domain,'states':temporal,'source_refs':e['source_refs']})

# Finalize entity references only after all consumers have recorded their evidence.
for e in entities:
    eps=sorted(episode_kinds[e['id']])
    e['episodes']=eps
    e['first_appearance']=eps[0] if eps else None
    e['episode_connections']=[{'episode':ep,'kinds':sorted(episode_kinds[e['id']][ep])} for ep in eps]
    e['periods']=sorted(set(e['periods']))
    facts=list(facts_by_entity[e['id']].values())
    if facts:
        e['facts']=facts
    if e['record_status']=='canon_only':
        e['confidence']='canon_name_only'
    elif e['name_status']=='canon_confirmed':
        e['confidence']='source_supported'

# Owner-confirmed conflict resolutions are explicit editorial decisions. Keep their
# evidence in normalization_decisions, but remove the now-resolved open issue from
# the generated conflict registry so it does not continue to block downstream QA.
if resolved_conflict_ids:
    kept_conflicts = []
    for c in conflicts:
        if c['id'] in resolved_conflict_ids:
            decision = next((item for review in reviews for item in review.get('resolved_conflicts', [])
                             if item.get('id') == c['id']), {})
            correction('owner_confirmed_conflict_resolution',
                       decision.get('reason', 'Project owner confirmed the identity or interpretation represented by this conflict.'),
                       c.get('source_refs', []), c['summary'], decision.get('resolution', 'resolved'))
        else:
            kept_conflicts.append(c)
    conflicts = kept_conflicts

# Link all known semantic conflicts back to source-level facts without deleting claims.
for c in conflicts:
    for sr in c['source_refs']:
        ep=sr['source_id'].removeprefix('SRC-')
        ptr=sr.get('pointer','')
        match=re.match(r'/entities/(\d+)(?:/facts/(\d+))?',ptr)
        if match and ep in docs:
            idx=int(match[1]); ident=source_entity_ids.get((ep,idx))
            if ident and ident not in c['entity_ids']:
                c['entity_ids'].append(ident)
            if ident and match[2] is not None:
                for f in by_id[ident].get('facts',[]):
                    if any(sr in a['source_refs'] for a in f['assertions']):
                        f.setdefault('conflict_ids',[]).append(c['id'])
    c['entity_ids']=sorted(set(c['entity_ids']))

for e in entities:
    cids=[c['id'] for c in conflicts if e['id'] in c['entity_ids']]
    if cids:
        e['conflict_ids']=cids

episodes=[]
for ep,d in sorted(docs.items()):
    episodes.append({'id':ep,'number':int(ep[2:]),'title':d['title'],'source_periods':d['period'],
                     'narrative_periods':['1300 civarı'] if ep in ('EP08','EP09') else (['1600 civarı','1300 civarı'] if ep=='EP07' else d['period']),
                     'continuity_scope':'MAIN_TIMELINE','source_refs':[ref(ep,'')],
                     'entity_ids':[e['id'] for e in entities if ep in e['episodes']],
                     'timeline_event_ids':[r['event_id'] for r in timeline if r['episode']==ep],
                     'travel_ids':[r['id'] for r in travel if r['episode']==ep]})

coverage={'source_entity_records':[{'source_ref':ref(ep,f'/entities/{i}'),'entity_id':ident} for (ep,i),ident in sorted(source_entity_ids.items())],
          'source_relationship_records':source_link_dispositions,
          'source_new_entity_indexes':[{'source_ref':ref(ep,f'/new_entities/{i}'),'entity_id':resolve(n)} for ep,d in sorted(docs.items()) for i,n in enumerate(d['new_entities'])],
          'source_fact_count':sum(len(e['facts']) for d in docs.values() for e in d['entities']),
          'normalized_fact_count':sum(len(e.get('facts',[])) for e in entities),
          'source_lore_count':sum(len(d['lore']) for d in docs.values()),'source_travel_count':sum(len(d['travel']) for d in docs.values()),
          'source_uncertainty_count':sum(len(d['uncertainties']) for d in docs.values())}
coverage['source_travel_records']=[{'source_ref':ref(ep,f'/travel/{i}'),'travel_ids':[t['id'] for t in travel if ref(ep,f'/travel/{i}') in t['source_refs']]} for ep,d in sorted(docs.items()) for i,_ in enumerate(d['travel'])]
coverage['reviewed_source_files']=[{'path':f['path'],'review':'Parsed in full; episode facts and relationship/travel/lore semantics reviewed across early, middle and late review files.'} for f in manifest['files']]

metadata={'schema_version':'1.0.0','database_name':'Ejder Sofrası Master World Database','continuity_scope':'MAIN_TIMELINE','language':'tr',
          'source_episode_range':['EP00','EP24'],'historical_periods':[{'id':'PER-1300','label':'1300 civarı','approximate_year':1300},{'id':'PER-1600','label':'1600 civarı','approximate_year':1600}],
          'architecture':{'authoritative_entity_file':'entities.json','specialized_files':'Derived ID indexes; join against entities.json. Never edit independently.',
                          'source_authority':'Canon confirms names and explicit slash aliases. Episode extraction supports claims but is not independently verified transcript truth.',
                          'presentation_coordinates':'None. map_canon.json contains source-evidenced constraints only.',
                          'stable_id_registry':'scripts/id_registry.json; commit and preserve this file. Existing IDs never renumber on rebuild.'},
          'semantics':{'first_appearance':'Earliest source-evidenced reference in supplied episode files, including mentions. This is not necessarily first on-screen presence or in-world birth.',
                       'episodes':'Source references, not proof of physical presence. episode_connections distinguishes reference kinds.',
                       'periods':'Positive dated attestations only, not a continuous lifespan. Unknown periods do not imply nonexistence. Consult world_states for explicit loss/absence.',
                       'null_period':'Claim date is not established; original episode source_periods remain available as narrative context. Do not broadcast unknown-date claims into both eras.',
                       'facts':'Source wording deduplicated conservatively; individual assertions carry date, evidence and confidence. Conflict-linked facts require review.',
                       'relationship_assertions':'Deduplicated by subject, predicate, object, period; every distinct evidence assertion retained.',
                       'travel':'Exact endpoint IDs are nullable. Descriptive rooms/waypoints retain source labels and optional context IDs. In-progress and composite routes are not confirmed arrivals.',
                       'timeline':'Source-evidenced significant events; occurred, historical, planned and revealed are distinct. Event summaries are facts on the event entity.',
                       'canon_only':'Confirmed name/category with no episode, period, family, presence or geographic parent inferred.',
                       'map_states':'parent_id is the narrowest proven comparable containment parent for that period. Null means unknown or unresolved. Geometry is never generated.'},
          'build':{'command':'python3 scripts/build_database.py && python3 scripts/validate_database.py','source_files_unchanged':True,'review_files':[str(p.relative_to(ROOT)) for p in sorted((SCRIPTS/'reviews').glob('*.json'))]}}
vocabulary={'entity_types':PREFIX,'relationship_predicates':sorted(ALLOWED),
            'extensions':{'USES':'Actor uses/activates an item; does not assert ownership.','POSSESSES':'Actor carries or has custody of an item; does not assert legal ownership.','FORMERLY_OWNED':'Actor was the established previous owner of an item before an evidenced transfer.','RENTS':'Actor rents an item explicitly.','DIED_IN':'Person or creature died at a location; avoids treating people as destroyed objects.'},
            'placement_basis':['CANONICAL','CANON_CONSTRAINED','UNKNOWN'],
            'confidence_levels':['canon_name_only','source_supported','disputed'],
            'temporal_rules':'Never use episode context alone for historical, remembered, planned or undated claims.',
            'symmetric_relations':['ALLIED_WITH','ENEMY_OF','SIBLING_OF','MARRIED_TO','RELATED_TO','NEAR','BORDERS','CONNECTED_TO','MENTIONED_WITH']}

timeline.sort(key=lambda t:(t['episode'],t['event_id']))
redirects=[]
for m in merge_log:
    dest=resolve(m['canonical_name'])
    for n in m['names']:
        old=ledger.get('entity_keys',{}).get(norm(n))
        if old and old!=dest and old not in by_id and {'from_id':old,'to_id':dest} not in redirects:
            redirects.append({'from_id':old,'to_id':dest})
for filename,value in [('world_metadata',metadata),('entities',entities),('relationships',relationships),('travel',travel),('timeline',timeline),('map_canon',map_canon),('unresolved_conflicts',conflicts),('episodes',episodes),('lore',lore),('world_states',states),('vocabulary',vocabulary),('source_coverage',coverage),('normalization_decisions',corrections),('id_redirects',redirects)]:
    write(OUT/(filename+'.json'),value)
for filename,types in {'npcs':{'PERSON'},'locations':LOCATION_TYPES,'factions':{'FACTION','ORGANIZATION','MILITARY_UNIT'},'families':{'FAMILY','DYNASTY'},'deities':{'DEITY'},'dragons':{'DRAGON'},'items':{'ITEM'},'creatures':{'CREATURE'},'historical_events':{'HISTORICAL_EVENT','HISTORICAL_ERA'}}.items():
    write(OUT/(filename+'.json'),{'view_of':'entities.json','types':sorted(types),'entity_ids':[e['id'] for e in entities if e['type'] in types]})
write(ledger_path,ledger)
print(json.dumps({'entities':len(entities),'types':dict(collections.Counter(e['type'] for e in entities)),'relationships':len(relationships),'events':len(timeline),'travel':len(travel),'conflicts':len(conflicts),'facts':coverage['normalized_fact_count'],'source_facts':coverage['source_fact_count']},ensure_ascii=False,indent=2))
