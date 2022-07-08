# Retrieve the label of a WikiData property for use
# in get_triples.py.

import sys
from SPARQLWrapper import SPARQLWrapper, JSON

endpoint_url = "https://query.wikidata.org/sparql"

query_template = """
SELECT * WHERE {
  BIND (wd:P## as ?prop).
  ?prop rdfs:label ?label filter (lang(?label) = "en") .
}"""

if len(sys.argv) > 1:
    item = sys.argv[1]
else:
    item = '105'

query = query_template.replace('##', item)

def get_results(endpoint_url, query):
    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    # TODO adjust user agent; see https://w.wiki/CX6
    sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()

results = get_results(endpoint_url, query)

if len(results['results']['bindings']) == 0:
       print(f"Nothing found for '{item}'. Try a number like 105.")

for result in results["results"]["bindings"]:
    answer = result['label']['value']
    print(f"'P{item}' : \"{answer}\",")
