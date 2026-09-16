#!/usr/bin/env python3
"""Independent, dependency-free integrity and source-coverage audit.

Fails on structural errors. Editorial uncertainties are reported, not suppressed.
"""
import collections
import hashlib
import json
import pathlib
import re
import sys
import unicodedata

ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'data'
errors=[]
warnings=[]
checks=collections.Counter()


def check(condition, code, details=None):
    checks[code]+=1
    if not condition:
        errors.append({'code':code,'details':details})


def warn(code, details):
    warnings.append({'code':code,'details':details})


def load(name):
    return json.loads((DATA/(name+'.json')).read_text())


def normalized(s):
    return ' '.join(unicodedata.normalize('NFC',s).replace('İ','i').replace('I','ı').lower().split())


def pointer(value, path):
    for token in path.split('/')[1:]:
        token=token.replace('~1','/').replace('~0','~')
        value=value[int(token)] if isinstance(value,list) else value[token]
    return value


parsed={}
for p in sorted(DATA.glob('*.json')):
    if p.name=='qa_report.json':
        continue
    try:
        parsed[p.stem]=json.loads(p.read_text())
        check(True,'valid_json',p.name)
    except (ValueError,UnicodeError) as exc:
        check(False,'valid_json',{'file':p.name,'error':str(exc)})
required={'world_metadata','entities','npcs','locations','factions','relationships','travel','timeline','map_canon','unresolved_conflicts','source_inventory','source_coverage','episodes','vocabulary','lore','world_states'}
check(required<=set(parsed),'required_files',sorted(required-set(parsed)))
if errors:
    print(json.dumps(errors,indent=2));sys.exit(1)

entities=parsed['entities'];relationships=parsed['relationships'];travel=parsed['travel'];timeline=parsed['timeline'];conflicts=parsed['unresolved_conflicts']
by_id={e['id']:e for e in entities}
ids=set(by_id);ep_ids={e['id'] for e in parsed['episodes']}
rel_ids={r['id'] for r in relationships};trv_ids={t['id'] for t in travel};cnf_ids={c['id'] for c in conflicts}
all_ids=[]
for records,field in [(entities,'id'),(relationships,'id'),(travel,'id'),(conflicts,'id'),(parsed['lore'],'id'),(parsed['world_states'],'id')]:
    all_ids.extend(r[field] for r in records)
check(len(all_ids)==len(set(all_ids)),'globally_unique_ids',[i for i,n in collections.Counter(all_ids).items() if n>1])
check(len(ep_ids)==25 and ep_ids=={f'EP{i:02d}' for i in range(25)},'episode_sequence',sorted(ep_ids))
check(len(entities)==len(ids),'unique_entity_ids')
check(len({e['slug'] for e in entities})==len(entities),'unique_slugs')
name_types=collections.defaultdict(list)
facts={}
source_fact_refs=set()
types=set(parsed['vocabulary']['entity_types'])
location_types=set(parsed['locations']['types'])
group_types={'FAMILY','DYNASTY','FACTION','ORGANIZATION','MILITARY_UNIT'}
actor_types={'PERSON','CREATURE','DEITY','DRAGON'}|group_types|{'KINGDOM','STATE'}
periods={'1300 civarı','1600 civarı'}
source_documents={}
source_lines={}
inventory=parsed['source_inventory']['files']
for f in inventory:
    content=(ROOT/f['path']).read_bytes()
    check(hashlib.sha256(content).hexdigest()==f['sha256'],'original_source_unchanged',f['path'])
    check(len(content)==f['bytes'],'source_byte_count',f['path'])
    if f['content_type']=='application/json':
        d=json.loads(content)
        source_documents[f['source_id']]=d
        check(d['episode']==f['episode'],'episode_content_matches_inventory',f['path'])
        check(d['episode'] in pathlib.Path(f['path']).name,'episode_filename_matches_content',f['path'])
        check(not d['output_incomplete'] and d['continue_from'] is None,'source_extraction_complete',f['path'])
    else:
        source_lines[f['source_id']]=content.decode().splitlines()


def valid_ref(sr,owner):
    if not isinstance(sr,dict):
        check(False,'source_reference_shape',owner);return
    source_id=sr.get('source_id')
    if source_id in source_documents:
        try:
            pointer(source_documents[source_id],sr['pointer'])
            check(True,'resolvable_source_pointer')
        except (KeyError,ValueError,IndexError,TypeError):
            check(False,'resolvable_source_pointer',{'owner':owner,'ref':sr})
    elif source_id in source_lines:
        check(isinstance(sr.get('line'),int) and 1<=sr['line']<=len(source_lines[source_id]),'resolvable_canon_line',{'owner':owner,'ref':sr})
    else:
        check(False,'known_source',{'owner':owner,'ref':sr})


def traverse_refs(value,path):
    if isinstance(value,dict):
        if 'source_id' in value and ('pointer' in value or 'line' in value):
            valid_ref(value,path)
        for k,v in value.items():
            traverse_refs(v,path+'/'+k)
    elif isinstance(value,list):
        for i,v in enumerate(value):
            traverse_refs(v,path+'/'+str(i))


for name,value in parsed.items():
    if name not in {'source_inventory','schema'}:
        traverse_refs(value,name)

# Evaluate every constraint used by our published JSON Schema without dependencies.
# This intentionally supports the schema's small keyword set, not arbitrary schemas.
schema=parsed.get('schema')
def schema_errors(value, rule, path):
    problems=[]
    if '$ref' in rule:
        problems+=schema_errors(value,pointer(schema,rule['$ref'][1:]),path)
    def matches_type(kind):
        return {'object':isinstance(value,dict),'array':isinstance(value,list),
                'string':isinstance(value,str),'null':value is None,
                'integer':isinstance(value,int) and not isinstance(value,bool),
                'number':isinstance(value,(int,float)) and not isinstance(value,bool),
                'boolean':isinstance(value,bool)}[kind]
    typ=rule.get('type')
    if typ and not any(matches_type(t) for t in (typ if isinstance(typ,list) else [typ])):
        return problems+[{'path':path,'constraint':'type','expected':typ}]
    for k in ['oneOf','anyOf']:
        if k in rule:
            matches=sum(not schema_errors(value,r,path) for r in rule[k])
            if (k=='oneOf' and matches!=1) or (k=='anyOf' and matches==0):
                problems.append({'path':path,'constraint':k})
    if 'const' in rule and value!=rule['const']:
        problems.append({'path':path,'constraint':'const'})
    if 'enum' in rule and value not in rule['enum']:
        problems.append({'path':path,'constraint':'enum'})
    if isinstance(value,dict):
        for key in rule.get('required',[]):
            if key not in value:problems.append({'path':path,'constraint':'required','key':key})
        props=rule.get('properties',{})
        for key,item in value.items():
            if key in props:
                problems+=schema_errors(item,props[key],path+'/'+key)
            elif rule.get('additionalProperties') is False:
                problems.append({'path':path+'/'+key,'constraint':'additionalProperties'})
    if isinstance(value,list):
        if len(value)<rule.get('minItems',0):problems.append({'path':path,'constraint':'minItems'})
        if rule.get('uniqueItems') and len({json.dumps(x,sort_keys=True) for x in value})!=len(value):
            problems.append({'path':path,'constraint':'uniqueItems'})
        for i,item in enumerate(value):
            if 'items' in rule:problems+=schema_errors(item,rule['items'],path+'/'+str(i))
    if isinstance(value,str):
        if len(value)<rule.get('minLength',0):problems.append({'path':path,'constraint':'minLength'})
        if 'pattern' in rule and not re.search(rule['pattern'],value):problems.append({'path':path,'constraint':'pattern'})
    if 'minimum' in rule and isinstance(value,(int,float)) and value<rule['minimum']:
        problems.append({'path':path,'constraint':'minimum'})
    return problems
if schema:
    for filename,definition in schema['fileSchemas'].items():
        problems=schema_errors(parsed[pathlib.Path(filename).stem],pointer(schema,definition[1:]),filename)
        check(not problems,'published_schema_conformance',problems)

for e in entities:
    check(set(['id','slug','name','type','aliases','periods','episodes','first_appearance','continuity_scope','confidence','source_refs'])<=e.keys(),'entity_required_fields',e['id'])
    check(e['type'] in types,'entity_type',e['id'])
    check(bool(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',e['slug'])),'url_safe_slug',e['id'])
    check(e['continuity_scope']=='MAIN_TIMELINE','single_continuity',e['id'])
    check(set(e['periods'])<=periods,'entity_periods',e['id'])
    check(e['episodes']==sorted(set(e['episodes'])) and set(e['episodes'])<=ep_ids,'entity_episodes',e['id'])
    check(e['first_appearance']==(min(e['episodes']) if e['episodes'] else None),'first_appearance',e['id'])
    check({x['episode'] for x in e['episode_connections']}==set(e['episodes']),'episode_connection_completeness',e['id'])
    check(bool(e['source_refs']),'entity_evidence',e['id'])
    check(set(e.get('conflict_ids',[]))<=cnf_ids,'entity_conflict_refs',e['id'])
    name_types[(normalized(e['name']),e['type'])].append(e['id'])
    if e['record_status']=='canon_only':
        check(not e['episodes'] and not e['periods'] and not e.get('facts'),'canon_only_no_invented_lore',e['id'])
    text_keys=[]
    for f in e.get('facts',[]):
        check(f['id'] not in facts,'unique_fact_id',f['id'])
        facts[f['id']]=f
        text_keys.append(normalized(f['text']))
        check(bool(f['text']) and bool(f['assertions']),'fact_content',f['id'])
        check(set(f.get('conflict_ids',[]))<=cnf_ids,'fact_conflict_refs',f['id'])
        for a in f['assertions']:
            check(a['period'] is None or a['period'] in periods,'fact_period',f['id'])
            check(bool(a['source_refs']),'fact_evidence',f['id'])
            if a['period']:
                check(a['temporal_basis']!='not_established','dated_fact_has_basis',f['id'])
            for sr in a['source_refs']:
                p=sr.get('pointer','')
                if re.fullmatch(r'/entities/\d+/facts/\d+',p):
                    source_fact_refs.add((sr['source_id'],p))
    check(len(text_keys)==len(set(text_keys)),'no_exact_duplicate_entity_facts',e['id'])
for e in entities:
    check(set(e.get('fact_ids',[]))<=set(facts),'shared_fact_refs',e['id'])
    check(set(e.get('member_ids',[]))<=ids,'collective_members',e['id'])
    if 'institution_id' in e:
        check(e['institution_id'] in ids and by_id[e['institution_id']]['type']=='ORGANIZATION','campus_institution_reference',e['id'])
for key,v in name_types.items():
    check(len(v)==1,'no_exact_duplicate_entities',{'name_and_type':key,'ids':v})

for filename,v in parsed.items():
    if isinstance(v,dict) and v.get('view_of')=='entities.json':
        expected={e['id'] for e in entities if e['type'] in v['types']}
        check(set(v['entity_ids'])==expected and len(v['entity_ids'])==len(expected),'derived_view_integrity',filename)

expected_fact_refs={(sid,f'/entities/{i}/facts/{j}') for sid,d in source_documents.items() for i,e in enumerate(d['entities']) for j,_ in enumerate(e['facts'])}
check(expected_fact_refs<=source_fact_refs,'all_source_facts_preserved',sorted(expected_fact_refs-source_fact_refs))
coverage=parsed['source_coverage']
check(len(coverage['source_entity_records'])==sum(len(d['entities']) for d in source_documents.values()),'source_entity_coverage')
for r in coverage['source_entity_records']:
    check(r['entity_id'] in ids,'source_entity_resolves',r)
for r in coverage['source_new_entity_indexes']:
    check(r['entity_id'] in ids,'new_entity_index_resolves',r)
check(len(coverage['source_relationship_records'])==sum(len(d['links']) for d in source_documents.values()),'source_relationship_coverage')
for r in coverage['source_relationship_records']:
    if r['status']=='normalized':
        check(r['relationship_id'] in rel_ids,'source_link_resolves',r)
    elif r['status']=='quarantined':
        check(r['conflict_id'] in cnf_ids,'quarantined_link_retained',r)
    elif r['status']=='owner_corrected':
        check(True,'owner_corrected_source_link',r)
    else:
        check(False,'unhandled_source_link',r)
for r in coverage['source_travel_records']:
    check(bool(r['travel_ids']) and set(r['travel_ids'])<=trv_ids,'source_travel_coverage',r)
check(len(parsed['lore'])==sum(len(d['lore']) for d in source_documents.values()),'source_lore_coverage')
resolved_uncertainty_count=sum(c.get('kind')=='owner_confirmed_uncertainty_resolution' for c in parsed['normalization_decisions'])
check(sum(c['kind']=='source_uncertainty' for c in conflicts)+resolved_uncertainty_count==sum(len(d['uncertainties']) for d in source_documents.values()),'source_uncertainties_preserved')

seen_relationships=set()
parents=collections.defaultdict(lambda:collections.defaultdict(set))
kinship=[]
for r in relationships:
    check(r['subject_id'] in ids and r['object_id'] in ids,'relationship_endpoints',r['id'])
    if r['subject_id'] not in ids or r['object_id'] not in ids:
        continue
    s,o=by_id[r['subject_id']],by_id[r['object_id']]
    rel=r['relation'];period=r['period']
    check(rel in parsed['vocabulary']['relationship_predicates'],'documented_predicate',r['id'])
    key=(s['id'],rel,o['id'],period)
    check(key not in seen_relationships,'no_duplicate_relationship',r['id']);seen_relationships.add(key)
    check(s['id']!=o['id'],'no_self_relationship',r['id'])
    check(period is None or period in periods,'relationship_period',r['id'])
    check(bool(r['assertions']) and all(a['source_refs'] for a in r['assertions']),'relationship_evidence',r['id'])
    actual_eps={sr['source_id'].removeprefix('SRC-') for a in r['assertions'] for sr in a['source_refs'] if sr['source_id'].removeprefix('SRC-') in ep_ids}
    check(set(r['episodes'])==actual_eps,'relationship_episode_provenance',r['id'])
    if rel in {'OWNS','FORMERLY_OWNED','USES','POSSESSES','RENTS'}:
        check(s['type'] in actor_types,'ownership_direction',r['id'])
        check(o['type'] not in {'PERSON','DEITY','DRAGON','FAMILY'},'ownership_object_type',r['id'])
    if rel=='CAPTAIN_OF':
        check(s['type']=='PERSON' and o['type']=='SHIP','captain_direction',r['id'])
    if rel=='TEMPLE_OF':
        check(s['type']=='TEMPLE' and o['type'] in {'DEITY','DRAGON'},'temple_direction',r['id'])
    if rel=='WORSHIPS':
        check(o['type'] in {'DEITY','DRAGON'} and s['type'] in actor_types,'worship_direction',r['id'])
    if rel in {'COMMANDS','LEADS'}:
        check(s['type'] in actor_types and o['type'] in group_types|{'SHIP'},'leadership_direction',r['id'])
    if rel=='MEMBER_OF':
        check(o['type'] in group_types and s['type'] in actor_types,'membership_direction',r['id'])
    if rel in {'PARENT_OF','CHILD_OF','SIBLING_OF','MARRIED_TO'}:
        check(s['type'] in {'PERSON','CREATURE','DEITY','DRAGON'} and o['type'] in {'PERSON','CREATURE','DEITY','DRAGON'},'kinship_type_safety',r['id'])
        kinship.append(r['id'])
    if rel in {'PRESENT_IN','VISITED','WORKS_IN','LIVES_IN','DIED_IN'}:
        check(o['type'] in location_types|{'SHIP'},'presence_destination_is_place',r['id'])
    if rel=='CAPITAL_OF':
        check(s['type'] in {'CITY','TOWN'} and o['type'] in {'KINGDOM','STATE'},'capital_direction',r['id'])
    if rel=='DESTROYED_IN':
        check(s['type']!='PERSON','death_not_destruction',r['id'])
    if rel in {'LOCATED_IN','INSIDE','PART_OF','CAPITAL_OF'} and s['type'] in location_types and o['type'] in location_types:
        parents[period][s['id']].add(o['id'])

def cycles(graph):
    done=set();active=[];found=[]
    def visit(n):
        if n in active:
            found.append(active[active.index(n):]+[n]);return
        if n in done:return
        active.append(n)
        for p in graph.get(n,[]):visit(p)
        active.pop();done.add(n)
    for n in list(graph):visit(n)
    return found
for period,graph in parents.items():
    check(not cycles(graph),'geography_acyclic',{'period':period,'cycles':cycles(graph)})

for m in parsed['map_canon']:
    check(m['location_id'] in ids and by_id[m['location_id']]['type'] in location_types,'map_location_type',m['location_id'])
    check(m['placement_basis'] in {'CANONICAL','CANON_CONSTRAINED','UNKNOWN'},'map_placement_classification',m['location_id'])
    check(not {'x','y','z','coordinates','position'}&m.keys(),'no_invented_map_coordinates',m['location_id'])
    for state in m['states']:
        check(state['parent_id'] is None or state['parent_id'] in ids,'map_parent_reference',m['location_id'])
        check(set(state['parent_candidate_ids'])<=ids,'map_parent_candidates',m['location_id'])
        check(set(state['containment_relationship_ids'])<=rel_ids,'map_containment_evidence',m['location_id'])
        if len(state['parent_candidate_ids'])>1:
            check(state['parent_id'] is None,'ambiguous_parent_not_selected',m['location_id'])
        for sr in state['spatial_relations']:
            check(sr['target_id'] in ids and sr['relationship_id'] in rel_ids,'spatial_reference',m['location_id'])
check({m['location_id'] for m in parsed['map_canon']}=={e['id'] for e in entities if e['type'] in location_types},'complete_map_index')

for t in travel:
    check(t['episode'] in ep_ids and (t['period'] is None or t['period'] in periods),'travel_episode_period',t['id'])
    check(set(t['traveler_ids'])<=ids,'travelers_resolve',t['id'])
    check(t['from_id']==t['origin']['entity_id'] and t['to_id']==t['destination']['entity_id'],'travel_endpoint_consistency',t['id'])
    check(t['via_ids']==[w['entity_id'] for w in t['waypoints'] if w['entity_id']],'travel_waypoint_order',t['id'])
    for place in [t['origin'],t['destination']]+t['waypoints']:
        for field in ['entity_id','context_id','reviewed_context_id']:
            ident=place.get(field)
            check(ident is None or ident in ids,'travel_place_reference',{'travel':t['id'],'field':field})
            if ident in ids:
                check(by_id[ident]['type'] in location_types|{'SHIP','ITEM'},'travel_not_organization',{'travel':t['id'],'place':ident})
    if t['episode']=='EP01':
        check(t['status']=='in_progress','sailing_not_arrival',t['id'])
    if t['episode']=='EP07':
        check(t['period'] is None and t.get('to_period')=='1300 civarı','temporal_transition_not_contaminated',t['id'])
ep22=[t for t in travel if t['episode']=='EP22' and t['sequence']==1]
check(len(ep22)==4 and all(len(t['traveler_ids'])==1 for t in ep22),'split_party_preserved')
ep14=next(t for t in travel if t['episode']=='EP14' and t['sequence']==2)
check(all(by_id[i]['name']!='İbrahim (Kompi)' for i in ep14['traveler_ids']),'unproven_route_participant_removed')

for t in timeline:
    check(t['event_id'] in ids and by_id[t['event_id']]['type']=='HISTORICAL_EVENT','timeline_event_identity',t['event_id'])
    check(t['summary_fact_id'] in facts,'timeline_summary_reference',t['event_id'])
    check(t['episode'] in ep_ids and (t['period'] is None or t['period'] in periods),'timeline_episode_period',t['event_id'])
    check(t['event_status'] in {'occurred','historical','planned','revealed'},'event_modality',t['event_id'])
    for field in ['participant_ids','location_ids','related_entity_ids']:
        check(set(t[field])<=ids,'timeline_entity_references',{'event':t['event_id'],'field':field})
    check(all(by_id[i]['type'] in location_types|{'SHIP'} for i in t['location_ids']),'timeline_location_types',t['event_id'])
for e in parsed['episodes']:
    check(set(e['entity_ids'])<=ids and set(e['travel_ids'])<=trv_ids,'episode_indexes',e['id'])
    check(set(e['timeline_event_ids'])<={t['event_id'] for t in timeline},'episode_event_index',e['id'])
for c in conflicts:
    check(c['status']=='open' and bool(c['summary']),'conflict_shape',c['id'])
    check(set(c['entity_ids'])<=ids,'conflict_entity_references',c['id'])

# Regression checks protect high-risk distinctions established by owner and source.
by_name={e['name']:e for e in entities}
for names in [('Metal Ejderha','Bronz Ejderha'),('Kızıl Komutan Sancar','Devran'),('İbrahim (Kompi)','Kompisaurus'),('Zümrüt Ejderha','Zümrüt Ejderha Tapınağı')]:
    check(all(n in by_name for n in names) and len({by_name[n]['id'] for n in names if n in by_name})==len(names),'protected_identity_distinction',names)
check('Dingi Sandalı' in by_name and 'Dingi' in by_name['Dingi Sandalı'].get('aliases', []),
      'owner_confirmed_identity_merge', ['Dingi','Dingi Sandalı'])
check('Bronz Ejderha' in by_name and 'Kahverengi Ejderha' in by_name['Bronz Ejderha'].get('aliases', []),
      'owner_confirmed_dragon_merge', ['Bronz Ejderha','Kahverengi Ejderha'])
helvanar=by_name.get('Helvanar Kıtası')
check(helvanar is not None and 'Helva Adası' in helvanar.get('aliases',[]),'owner_confirmed_helvanar_identity')
adnan=by_name.get('Adnan Körkapak')
kara=by_name.get('Kara Kapak')
check(adnan is not None and "O'Rusbu Adnan" in adnan.get('aliases',[]) and 'Körkapak' in adnan.get('aliases',[]),'owner_confirmed_adnan_identity')
check(adnan is not None and kara is not None and adnan['id'] != kara['id'],'kara_kapak_separate_companion')
father=by_name['Kızıl Komutan Sancar']['id'];son=by_name['Devran']['id']
check(not any(r['subject_id']==son and r['object_id']==father and r['relation']=='PARENT_OF' for r in relationships),'father_son_direction')
for e in entities:
    if e['type']=='FAMILY':
        for r in relationships:
            if r['object_id']==e['id'] and r['relation']=='MEMBER_OF':
                check(all(a['source_refs'] for a in r['assertions']),'family_membership_has_explicit_evidence',r['id'])
check(by_name['Sütçüoğlu Ataları']['type']=='OTHER','ancestor_collective_not_person')
check(by_name['İsrafsoy ve Kıtlıkan']['type']=='OTHER' and by_name['İsrafsoy']['type']=='DEITY' and by_name['Kıtlıkan']['type']=='DEITY','deity_pair_split')
kitchen=by_name['Sütçüoğlu Deney Mutfağı']['id'];ruins=by_name['Ejderhalar Sofrası Harabeleri']['id']
check(not any(r['subject_id']==kitchen and r['object_id']==ruins and r['relation'] in {'LOCATED_IN','INSIDE','PART_OF'} for r in relationships),'conjured_kitchen_not_physical_geography')
check(not any(r['subject_id']==ruins and r['relation'] in {'LOCATED_IN','INSIDE','PART_OF'} and by_id[r['object_id']]['type']=='CONTINENT' for r in relationships),'uncertain_trial_not_fixed_geography')

alias_lookup=collections.defaultdict(set)
for e in entities:
    for a in [e['name']]+e['aliases']:alias_lookup[normalized(a)].add(e['id'])
ambiguous={a:sorted(v) for a,v in alias_lookup.items() if len(v)>1}
for alias,entity_ids in ambiguous.items():
    check(any(c['kind']=='alias_collision' and set(entity_ids)<=set(c['entity_ids']) for c in conflicts),'alias_collision_reported',alias)
ledger=json.loads((ROOT/'scripts/id_registry.json').read_text())
check(ids<=set(ledger['entity_keys'].values()),'ids_in_persistent_registry')
for d in parsed['id_redirects']:
    check(d['from_id'] not in ids and d['to_id'] in ids,'id_redirect_integrity',d)

warn('editorial_review_open',{'count':len(conflicts),'meaning':'Open source uncertainties, disputed claims, ambiguous identities and unresolved descriptive map anchors are retained, not silently resolved.'})
warn('source_supported_not_transcript_verified','Episode JSON extraction was consolidated and reviewed; original audio/transcripts were not supplied or independently rechecked.')
warn('unknown_dates_preserved',{'facts_with_only_unknown_date':sum(all(a['period'] is None for a in f['assertions']) for f in facts.values()),'relationships_with_unknown_date':sum(r['period'] is None for r in relationships)})
warn('canon_only_entities',{'count':sum(e['record_status']=='canon_only' for e in entities),'meaning':'Name/category only; no episode appearances, kinship or geography invented.'})
warn('alias_search_ambiguity',ambiguous)
warn('in_world_calendar_not_converted','EP08 mentions the Silver Dragon year 1673; no numerical conversion to circa-1300 is invented. The era is a separate project label.')
warn('absence_not_inferred','No episode mention is not proof of nonexistence. Era visibility must consult dated attestations and explicit world_states.')
warn('historical_relations_not_current_state','Relationships describe evidence at episode/era level. Ownership, leadership and destroyed locations may change within an era; consumers must retain episode order and events.')

report={'schema_version':'1.0.0','status':'passed_with_editorial_warnings' if not errors else 'failed',
        'source_file_count':len(inventory),'episode_count':len(ep_ids),'entity_count':len(entities),
        'entity_counts_by_type':dict(sorted(collections.Counter(e['type'] for e in entities).items())),
        'relationship_count':len(relationships),'relationship_assertion_count':sum(len(r['assertions']) for r in relationships),
        'timeline_event_count':len(timeline),'travel_record_count':len(travel),'source_travel_record_count':coverage['source_travel_count'],
        'unresolved_conflict_count':len(conflicts),'conflict_counts_by_kind':dict(sorted(collections.Counter(c['kind'] for c in conflicts).items())),
        'source_fact_count':len(expected_fact_refs),'source_facts_covered':len(expected_fact_refs&source_fact_refs),'normalized_fact_count':len(facts),
        'lore_record_count':len(parsed['lore']),'automatic_corrections_made':parsed['normalization_decisions'],
        'validation':{'error_count':len(errors),'errors':errors,'checks_executed':dict(sorted(checks.items())),'all_original_sources_unchanged':not any(e['code']=='original_source_unchanged' for e in errors)},
        'warnings':warnings,'suspicious_records_requiring_review':[{'conflict_id':c['id'],'kind':c['kind'],'entity_ids':c['entity_ids'],'summary':c['summary']} for c in conflicts],
        'readiness':{'frontend_development':not errors,'canon_publication':'Requires owner review of flagged claims before presenting them as settled canon.',
                     'era_map':'Unknown positions, dates and supernatural geography must remain visibly uncertain; creative coordinates are intentionally absent.'}}
receipt_path=ROOT/'scripts/rebuild_verification.json'
if receipt_path.exists():
    receipt=json.loads(receipt_path.read_text())
    matching=all((ROOT/path).exists() and hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==value for path,value in receipt['output_sha256'].items())
    report['validation']['reproducible_rebuild']={
        'verified':receipt['passed'] and matching,
        'scope':'Byte-identical rebuild of generated JSON and ID registry, excluding the QA report that records the verification itself.',
        'receipt_matches_current_outputs':matching,
        'receipt':'scripts/rebuild_verification.json'
    }
(DATA/'qa_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'entities':len(entities),'relationships':len(relationships),'events':len(timeline),'travel':len(travel),'conflicts':len(conflicts),'source_fact_coverage':f'{len(expected_fact_refs&source_fact_refs)}/{len(expected_fact_refs)}','error_count':len(errors),'errors':errors[:30]},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
