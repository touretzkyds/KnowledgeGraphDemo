//cache for bnode and concept node expansion
var bnodeExpansionDataCache = {};
var conceptExpansionDataCache = {};
// used to identify dummy node and real node
var conceptNodeLabelToID = {};
// current node
var currentNode = undefined;
// endpoint to be queried
const endpoint = "https://solid.boltz.cs.cmu.edu:3031/Devel/sparql";

function propertyQuery(value, perform_query) {
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
        }`; 

    
    if (perform_query) {
        const url = endpoint + "?query=" + encodeURIComponent(query);
        return url;
    } else {
        return false;
    }

}

function getDataResponse(value) {
    const url = propertyQuery(value, true);
    conceptNodeLabelToID = {};
    d3.json(url).then(function(data) {visualizeData(data, value);});
    
}

function convertToCytoscape(data) {
    if(data === undefined) {
        return undefined;
    }
    var nodes = [];
    var edges = [];
    var source = data.prefLabel.split("boltz:")[1];
    conceptExpansionDataCache[source] = data;
    Object.keys(data).forEach(function(key) {
        var value = data[key];
        var tempNode = {"data":{}};
        tempNode.data.label = value;
        tempNode.data.type = data.type;
        if(key == "prefLabel") {
            tempNode.data.class = "concept";
            tempNode.classes = "readyToCollapse";
            tempNode.data.id = source;
            conceptNodeLabelToID[value] = source;
            nodes.push(tempNode);
        } else {
            tempNode.data.class = classifyclass(key, value);
            tempNode.data.id = convertToNodeID(source, key, value);
            tempNode.data.sourceID = source;
            tempNode.class = "readyToCollapse";
            if(tempNode.data.class == "concept") {
            if(!conceptNodeLabelToID.hasOwnProperty(value)) {
                conceptNodeLabelToID[value] = tempNode.data.id;
            }
            }
            
            nodes.push(tempNode);

            var tempEdge = {"data":{}};
            tempEdge.data.label = key;
            tempEdge.data.id = convertToEdgeID(source, key, value);
            if(value !== source) {
                tempEdge.data.source = source;
                tempEdge.data.target = tempNode.data.id;
                edges.push(tempEdge);
            }
        }
    })
    return [nodes, edges, source];
}

function visualizeData(data, value) {
    const jsonData = getDataJSON(data);
    if(jsonData === undefined) {
        return ;
    }
    const CytoscapeData = convertToCytoscape(jsonData[0]);
    if(CytoscapeData === undefined) {
        return;
    }
    
    const nodes = CytoscapeData[0];
    const edges = CytoscapeData[1];
    const source = CytoscapeData[2];
    
    var cy = cytoscape({
    container: document.getElementById('cy'), // container to render in
    
    elements: {
        nodes: nodes,
        edges: edges
    },
    style: [ // the stylesheet for the graph
    {
        selector: 'node[class = "literal"]',
        style: {
            'shape': 'square',
            'width':150,
            'height': 75,
            'background-color': '#FFD580',
            'text-wrap': 'wrap',
            'text-max-width': 130,
            'border-width': 2,
            'border-color': '#FFA500',
            'border-style': 'solid',
            'font-size': 15,
            'font-family': 'Calibri',
            'line-height': 1.15,
            'label': 'data(label)',
            'text-valign': 'center',
        }
    },
    {
        selector: 'node[class = "qudt"]',
        style: {
            'shape': 'hexagon',
            'width':180,
            'height':150,
            'background-color': '	#fdfa72',
            'text-wrap': 'wrap',
            'text-max-width': 80,
            'border-width': 2,
            'border-color': '#F6BE00',
            'border-style': 'solid',
            'font-size': 25,
            'font-family': 'Garamond',
            'line-height': 1.15,
            'label': 'data(label)',
            'text-valign': 'center',
        }
    },
    {
        selector: 'node[class = "concept"]',
        style: {
            'width':150,
            'height':150,
            "background-color": '#ADD8E6',
            "border-color": '#00008B',
            'text-wrap': 'wrap',
            'text-max-width': 80,
            'label': 'data(label)',
            'font-size': 20,
            'font-family': 'Garamond',
            'line-height': 1.15,
            'text-valign': 'center',
        }
    },
    {
        selector: 'node[class = "dummyConcept"]',
        style: {
            'width':150,
            'height':150,
            "background-color": '#FFFFFF',
            "border-color": '#ADD8E6',
            "border-width": 10,
            'text-wrap': 'wrap',
            'text-max-width': 80,
            'label': 'data(label)',
            'font-size': 20,
            'font-family': 'Garamond',
            'line-height': 1.15,
            'text-valign': 'center'
        }
    },
    {
        selector: 'node[class = "greenConcept"]',
        style: {
            'width':150,
            'height':150,
            "background-color": '#00FF00',
            'text-wrap': 'wrap',
            'text-max-width': 80,
            'label': 'data(label)',
            'font-size': 20,
            'font-family': 'Garamond',
            'line-height': 1.15,
            'text-valign': 'center'
        }
    },
    {
        selector: 'node[class = "bnode"]',
        style: {
            'shape': 'ellipse',
            'border-style': 'solid',
            'width':120,
            'height':120,
            "background-color": '#CBC3E3',
            "border-color": '#301934',
            'text-wrap': 'wrap',
            'text-max-width': 80,
            'label': 'data(label)',
            'font-size': 30,
            'font-family': 'Garamond',
            'line-height': 1.15,
            'text-valign': 'center',
        }
    },
    {
        selector: 'node[class = "dummy"]',
        style: {
            'shape': 'ellipse',
            'border-style': 'solid',
            'width':100,
            'height':100,
            "background-color": 'red',
            'text-max-width': 80,
            'label': 'data(label)',
            'font-size': 30,
            'font-family': 'Garamond',
            'line-height': 1.15,
            'text-valign': 'center',
        }
    },
    {
        selector: 'node[class = "image"]',
        style: {
            'shape': 'rectangle',
            'background-image': function(node) {
            return 'url(' + node.data('label') + ')';
            },
            'background-fit': 'cover',
            'background-color': 'white',
            "border-color": 'black',
            "border-width": 1,
            'z-index': '10',
        }
    },
    {
        selector: 'node[class = "countyImage"]',
        style: {
            'shape': 'rectangle',
            'background-image': function(node) {
            return 'url(' + node.data('label') + ')';
            },
            'background-fit': 'cover',
            'background-color': 'white',
            "border-color": '#ADD8E6',
            "border-width": 10,
            'z-index': '10',
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'width': 10,
            'font-size': 20,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)'
        } 
    }
    ]
    });

    mycy = cy;
    setNav(cy, value);
    setAsCurrentNodeWithoutUpdateNav(cy, source);
    reLayoutCola(cy);
    adjustImageSize(cy);

    cy.on('tap', function(evt) {
        tap(evt, cy);
    });
    cy.on('cxttap', function(evt) {
        cxttap(evt, cy);
    });
    cy.on('mouseover', function(evt) {
        mouseover(evt, cy);
    });
    cy.on('mouseout', function(evt) {
        mouseout(evt, cy);
    });
    cy.on('grab', function(evt){
        grab(evt);
    });
    cy.on('drag', function(evt){
        drag(evt);
    });

}

function getDataJSON(data) {
    const binding = data.results.bindings;
    if(binding.length === 0) {
        alert('Please enter valid name.');
        return undefined;
    }
    var resultData = {};
    var bnodeData = {};
    const prefLabel = binding[0].prefLabel.value;
    const centerQnumber = binding[0].Q.value.split("/data/")[1];
    const prefLabelValue = prefLabel + "\nboltz:" + centerQnumber;
    

    Object.keys(binding).forEach(function(key) {
        const dataEntry = binding[key];
        var relation = dataEntry.r.value;
        if(relation.includes("skos")) {
            relation = relation.split("core#")[1];
        } else if(relation.includes("rdf")) {
            relation = relation.split("ns#")[1];
        } else {
            relation = relation.split("/ontology/")[1]; 
        }
        var finalValue = dataEntry.y.value;
        if(finalValue.startsWith("http://")) {
            var Qnumber = finalValue.split("/data/")[1];
            if(Qnumber == undefined) {
            finalValue = dataEntry.yLabel.value;
            } else {
            finalValue = dataEntry.yLabel.value + "\nboltz:" + Qnumber;
            }
        }
        //store bnode info and add number to node id
        if(dataEntry.y.type == 'bnode') {

            var bnodeID = finalValue;
            if(!bnodeData.hasOwnProperty(bnodeID)) {
            // bnodeExpansionDataCache[bnodeID] = {};
            bnodeData[bnodeID] = {};
            }
            var bnodeKeyList = dataEntry.s.value.split("/");
            bnodeKey = bnodeKeyList[bnodeKeyList.length - 1];
            var bnodeValueList = dataEntry.z.value.split("/");
            bnodeValue = bnodeValueList[bnodeValueList.length - 1];
            if(bnodeKey.includes("#")) {
            bnodeKeyList = dataEntry.s.value.split("#");
            bnodeKey = bnodeKeyList[bnodeKeyList.length - 1];
            }
            
            // bnodeExpansionDataCache[bnodeID][bnodeKey] = bnodeValue;
            bnodeData[bnodeID][bnodeKey] = bnodeValue;

        }

        if(relation !== "hasCounty") {
            resultData[relation] = finalValue;
        }
        
    })

    
    resultData["prefLabel"] = prefLabelValue;
    return [resultData, bnodeData];
}

