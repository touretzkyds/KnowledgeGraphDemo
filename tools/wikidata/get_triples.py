# Display all the WikiData triples for a concept or property.

import sys
from SPARQLWrapper import SPARQLWrapper, JSON

if len(sys.argv) > 1:
    concept = sys.argv[1]
else:
    concept = 'Q34740'   # wd:Genus

endpoint_url = "https://query.wikidata.org/sparql"

def get_results(endpoint_url, query):
    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    # TODO adjust user agent; see https://w.wiki/CX6
    sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()

prop_query_template = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX wdt: <http://www.wikidata.org/prop/direct#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?r ?y ?yLabel WHERE {
  BIND (wd:## as ?x).
  ?x ?r ?y filter (?r != skos:altLabel && (lang(?y) in ("en","") || ! isLiteral(?y))).
  OPTIONAL {?y rdfs:label|skos:prefLabel ?yLabel filter (lang(?yLabel) in ("en","")).}
}
ORDER BY ?r ?y
"""

prop_query = prop_query_template.replace('##', concept)
prop_results = get_results(endpoint_url, prop_query)

statement_query_template = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX wdt: <http://www.wikidata.org/prop/direct#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX pr: <http://www.wikidata.org/prop/reference/>
SELECT ?r ?y ?s ?z ?zLabel ?uLabel WHERE {
  BIND (wd:## as ?x).
  ?x ?r ?y.
  # Make sure the statement has no non-English content:
  ?y ?s ?z filter (NOT EXISTS {?y ?t ?u filter (isLiteral(?u) && lang(?u) not in ("en",""))}).
  # Get the English label of ?z:
  OPTIONAL {?z rdfs:label|skos:prefLabel ?zLabel filter (lang(?zLabel) in ("en",""))}.
  # If ?z is a wdref, find the authority it references:
  OPTIONAL {?z (pr:P248|pr:P143)/rdfs:label ?uLabel filter (lang(?uLabel) in ("en",""))}.
}
ORDER BY ?r ?y ?s ?z
"""

statement_query = statement_query_template.replace('##', concept)
statement_results = get_results(endpoint_url, statement_query)

uri_prefixes = (
    ('http://www.wikidata.org/prop/direct/', 'wdt'),
    ('http://www.wikidata.org/prop/direct-normalized/', 'wdtn'),
    ('http://www.wikidata.org/entity/statement/', 'wds'),
    ('http://www.wikidata.org/entity/', 'wd'),
    ('http://www.wikidata.org/prop/qualifier/value/', 'pqv'),
    ('http://www.wikidata.org/prop/qualifier/', 'pq'),
    ('http://www.wikidata.org/prop/reference/value/', 'prv'),
    ('http://www.wikidata.org/prop/reference/', 'pr'),
    ('http://www.wikidata.org/prop/statement/value/', 'psv'),
    ('http://www.wikidata.org/prop/statement/value-normalized/', 'psn'),
    ('http://www.wikidata.org/prop/statement/', 'ps'),
    ('http://www.wikidata.org/prop/', 'p'),
    ('http://www.wikidata.org/reference/', 'wdref'),
    ('http://schema.org/', 'schema'),
    ('http://wikiba.se/ontology#', 'wikibase'),
    ('http://www.w3.org/2000/01/rdf-schema#', 'rdfs'),
    ('http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf'),
    ('http://www.w3.org/ns/prov#', 'prov'),
    ('http://www.w3.org/2002/07/owl#', 'owl')
)

prop_names = {
    'P18' : "image",
    'P31' : 'instance of',
    'P105' : 'taxon rank',
    'P143' : "imported from Wikimedia project",
    'P155' : "follows",
    'P156' : "followed by",
    'P171' : "parent taxon",
    'P244' : "Library of Congress authority ID",
    'P248' : "stated in",
    'P279' : 'subclass of',
    'P301' : "category's main topic",
    'P361' : 'part of',
    'P373' : "Commons category",
    'P407' : "language of work or name",
    'P461' : "opposite of",
    'P646' : 'Freebase ID',
    'P672' : "MeSH tree code",
    'P910' : "topic's main category",
    'P973' : "described at URL",
    'P989' : "spoken text audio",
    'P1269' : "facet of",
    'P1282' : 'OpenStreetMap tag or key',
    'P1343' : 'described by source',
    'P1365' : "replaces",
    'P1417' : "Encyclopædia Britannica Online ID",
    'P1424' : "topic's main template",
    'P1535' : "used by",
    'P1542' : "has effect",
    'P1545' : "series ordinal",
    'P1552' : 'has quality',
    'P1628' : "equivalent property",
    'P1629' : "Wikidata item of this property",
    'P1647' : "subproperty of",
    'P1659' : "related properties",
    'P1687' : "Wikidata property",
    'P1696' : "inverse property",
    'P1709' : "equivalent class",
    'P1813' : "short name",
    'P1843' : "taxon common name",
    'P1855' : "Wikidata property example",
    'P1889' : 'different from',
    'P1963' : "properties for this type",
    'P2241' : "reason for deprecated rank",
    'P2283' : "uses",
    'P2302' : "property constraint",
    'P2305' : "item of property constraint",
    'P2306' : "property",
    'P2308' : "class",
    'P2309' : "relation",
    'P2316' : "constraint status",
    'P2559' : "Wikidata usage instructions",
    'P2579' : "studied by",
    'P2581' : "BabelNet ID",
    'P2671' : "Google Knowledge Graph ID",
    'P2875' : "property usage tracking category",
    'P2924' : "Great Russian Encyclopedia Online ID",
    'P3254' : "property proposal discussion",
    'P3417' : "Quora topic ID",
    'P3569' : "Cultureel Woordenboek ID",
    'P3713' : "category for value not in Wikidata",
    'P3729' : "next lower rank",
    'P3730' : "next higher rank",
    'P3827' : "JSTOR topic ID",
    'P5314' : "property scope",
    'P6104' : "maintained by WikiProject",
    'P6262' : "Fandom article ID",
    'P6366' : "Microsoft Academic ID",
    'P6607' : "constraint clarification",
    'P6611' : "Semantic Scholar topic ID",
    'P7033' : "Australian Educational Vocabulary ID",
    'P7087' : "inverse label item",
    'P7497' : "Wolfram Language entity type",
    'P7818' : "French Vikidia ID",
    'P7829' : "English Vikidia ID",
    'P8061' : "AGROVOC ID",
    'P8313' : "Den Store Danske ID",
    'P8408' : "KBpedia ID",
    'P10283' : 'OpenAlex ID'
    }

def val_shortener(val):
    for p in uri_prefixes:
        if val.startswith(p[0]):
            short_val = val[len(p[0]):]
            prefixed_val = p[1] + ':' + short_val
            if short_val in prop_names:
                prefixed_val += ' ' + prop_names[short_val]
            return prefixed_val
    return val

# Display result

bindings_list = prop_results["results"]["bindings"]

if bindings_list == []:
    print(f"No result found for '{concept}'.  Try something l ike Q34740 or P105.\n")
else:
    label = '[no rdfs:label found]'
    for binding in bindings_list:
        if binding['r']['value'] == 'http://www.w3.org/2000/01/rdf-schema#label': # rdfs:label
            label = binding['y']['value']
            break
    print(f"Triples for {concept} '{label}':")

for binding in bindings_list:
    r = binding['r']
    rval = r['value']
    y = binding['y']
    yval = y['value']
    if 'yLabel' in binding:
        yLabel = '=> ' + binding['yLabel']['value']
    else:
        yLabel = ''
    if r['type'] == 'uri':
        rval = val_shortener(rval)
    if y['type'] == 'uri':
        yval = val_shortener(yval) + ' ' + yLabel
    print('%50s  =  %s' % (rval,yval))

print(f"\nStatements about {concept} '{label}' (excluding those with non-English content):\n")
current_stmt = ''
for binding in statement_results['results']['bindings']:
    rval = binding['r']['value']
    yval = binding['y']['value']
    sval = binding['s']['value']
    zval = binding['z']['value']
    if 'zLabel' in binding:
        zLabel = ' => ' + binding['zLabel']['value']
    elif 'uLabel' in binding:
        zLabel = ' refs: ' + binding['uLabel']['value']
    else:
        zLabel = ''
    if yval.find('/entity/statement/') > 0:
        if yval != current_stmt:
            current_stmt = yval
            print(val_shortener(rval), ':', val_shortener(yval))
        print('  ', val_shortener(sval), '=', val_shortener(zval) + zLabel)

