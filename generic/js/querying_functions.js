// endpoint of boltz server to be queried
// const endpoint = "https://solid.boltz.cs.cmu.edu:3031/Devel/sparql";
const endpoint = "http://solid.boltz.cs.cmu.edu:3030/Devel/sparql";
// const endpoint = "http://solid.boltz.cs.cmu.edu:3030/dataset.html?tab=query&ds=/Devel";

/**
 * Gets info on the current node that will be displayed if you
 * click on it and expand it. Returns the url for querying data the region
 *
 * 
 * @param {string} value the name for region to be queries. e.g. Pittsburgh
 * @returns the url for query
 *
 **/
function propertyQuery(value) {
    const query = 
	  `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX kgo: <http://solid.boltz.cs.cmu.edu:3030/ontology/>
        PREFIX boltz: <http://solid.boltz.cs.cmu.edu:3030/data/> 
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        PREFIX qudt:  <http://qudt.org/schema/qudt/>
        PREFIX unit:  <http://qudt.org/vocab/unit/> 
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
        PREFIX list: <http://jena.hpl.hp.com/ARQ/list#> 
        PREFIX qu: <http://purl.oclc.org/NET/ssnx/qu/qu#> 
        PREFIX qud: <http://qudt.org/1.1/schema/qudt#> 
        PREFIX la: <https://linked.art/ns/terms/>
        PREFIX un: <http://www.w3.org/2007/ont/unit#> 
        PREFIX uni: <http://purl.org/weso/uni/uni.html#> 
        SELECT *
        Where {
        BIND ( '${value}'@en AS ?prefLabel).
        ?Q skos:prefLabel ?prefLabel .
        ?Q ?r ?y.
        OPTIONAL {?Q ?r [?s ?z] FILTER isBlank(?y)}.
        OPTIONAL {?y rdfs:label|skos:prefLabel ?yLabel}.
        ?Q rdf:type ?nodeType .
        }`;
    
    const url = endpoint + "?query=" + encodeURIComponent(query);
    return url;
}


/**
 * Purpose: get the url to navigation list query. The url
 * generates the nav history list pairs
 * 
 * @param {string} value: the name for region to be queries. e.g. Pittsburgh
 * @param {string} link: e.g. 'locatedInAdministrativeRegion'
 * @returns the url for query
 *
 **/
function navHistoryListQuery(value, link) {
    const query = 
	  `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX kgo: <http://solid.boltz.cs.cmu.edu:3030/ontology/>
        PREFIX boltz: <http://solid.boltz.cs.cmu.edu:3030/data/> 
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        PREFIX qudt:  <http://qudt.org/schema/qudt/>
        PREFIX unit:  <http://qudt.org/vocab/unit/> 
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> 
        PREFIX list: <http://jena.hpl.hp.com/ARQ/list#> 
        PREFIX qu: <http://purl.oclc.org/NET/ssnx/qu/qu#> 
        PREFIX qud: <http://qudt.org/1.1/schema/qudt#> 
        PREFIX la: <https://linked.art/ns/terms/>
        PREFIX un: <http://www.w3.org/2007/ont/unit#> 
        PREFIX uni: <http://purl.org/weso/uni/uni.html#> 
        SELECT ?x ?y ?xLabel ?yLabel
        WHERE {
          BIND ( '${value}'@en AS ?prefLabel).
          ?Q skos:prefLabel ?prefLabel .
          ?Q kgo:${link}* ?x.
          ?x kgo:${link} ?y.
          ?x rdfs:label|skos:prefLabel ?xLabel.
          ?y rdfs:label|skos:prefLabel ?yLabel.
        }`; 

    const url = endpoint + "?query=" + encodeURIComponent(query);
    return url;
}
