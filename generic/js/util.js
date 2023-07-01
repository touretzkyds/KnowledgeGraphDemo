// Data handling functions

/**
 * 
 * convert data fetched from server to key value JSON pairs ready
 * for converting to cytoscape data. e.g. {"cityName": "Pittsburgh", "type": "City"}
 * 
 * @param {JSON} data: data fetched from server
 * @returns the key value pairs JSON
 *
 **/

function getDataJSON(data) {
    const binding = data.results.bindings;
    let resultData = {};
    let bnodeData = {};
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
    return [resultData,  bnodeData];
}



/**
 * convert data fetched from server to cytoscape data
 *
 * @param {object} data: data fetched from server
 * @param {dictionary} toolKit: our dictionary with all our graph tools 
 * @returns {list}: cytoscape data for nodes, edges, and the initial
 *                   Q number for region e.g. Q1342
 *
 **/

function convertToCytoscape(data, toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];

    // Function body
    if (data === undefined) {
        return undefined;
    }
    var nodes = [];
    var edges = [];
    var source = data.prefLabel.split("boltz:")[1];

    // conceptExpansionDataCache[source] = data;
    displayResources.update('conceptExpansionDataCache', data, source);
    
    Object.keys(data).forEach(function(key) {
        var value = data[key];
        var tempNode = {"data":{}};
        tempNode.data.label = value;
        tempNode.data.type = data.type;
        if(key == "prefLabel") {
	    tempNode.data.class = "concept";
	    tempNode.classes = "readyToCollapse";
	    tempNode.data.id = source;
	    
	    // conceptNodeLabelToID[value] = source;
	    displayResources.update('conceptNodeLabelToID', source, value);

	    nodes.push(tempNode);
	    
        } else {
	    tempNode.data.class = classifyclass(key, value);
	    tempNode.data.id = convertToNodeID(source, key, value);
	    tempNode.data.sourceID = source;
	    tempNode.class = "readyToCollapse";
	    if (tempNode.data.class == "concept") {
	if (!displayResources.conceptNodeLabelToID.hasOwnProperty(value)) {
	    // conceptNodeLabelToID[value] = tempNode.data.id;
	    displayResources.update('conceptNodeLabelToID', tempNode.data.id, value);
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


/**
 * 
 * get the id for edge. NOTE: id cannot contain special characters
 * 
 * @param {string} id: id for the source node
 * @param {string} key
 * @param {string} value 
 * @returns id for the edge
 */
function convertToEdgeID(id, key, value) {
    return (id + "_" + value).replace(/[^\w]/g,"_");
}

/**
 * 
 * get the id for edge. NOTE: id cannot contain special characters
 * 
 * @param {string} id: id for the source node
 * @param {string} key
 * @param {string} value 
 * @returns id for the node
 */
function convertToNodeID(id, key, value) {
    return (id + "_rel_" + value).replace(/[^\w]/g,"_");
}



/**
 * 
 * classify a node and get its class name
 * 
 * @param {string} key 
 * @param {string} value 
 * @returns class name
 */

function classifyclass(key, value) {
    if (key === "image") {
        return "image";
    }
    if (key === "flagImage") {
        return "flagImage";
    }
    if (key.endsWith('ImageMap')) { // should be if it ends with image map
        return "imageMap";
    }
    if (value.startsWith('b')) {
        return "qudt";
    }
    if (value.includes('boltz:Q')) {
        return "concept";
    }
    return "literal";
}



/**
 *
 * 1. Renders cytoscape graph with data
 * 2. styles graph (now done in getDataResponse)
 * 3. adds event listeners
 * 4. initializes nav history and nav tools (now done in getDataResponse)
 * 
 * @paramm {object} data: server data in JSON format
 * @param {string} value: the name for region to be queries. e.g. 'Pittsburgh'
 * @returns {list}
 *
**/
function getCytoscapeObjectAndSource(data, value, toolKit) {
    //Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];


    // Function body
	const jsonData = getDataJSON(data);
	if(jsonData === undefined) {
            return ;
	}
	const CytoscapeData = convertToCytoscape(jsonData[0], toolKit);
	if(CytoscapeData === undefined) {
            return;
	}
    
	const nodes = CytoscapeData[0];
	const edges = CytoscapeData[1];
	const source = CytoscapeData[2];

	// 1. rendering cytoscape graph
	var cy = cytoscape({
	    container: document.getElementById('cy'), // container to render in
	    
	    elements: {
		nodes: nodes,
		edges: edges
	    },
	    // 2. styles graph
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
		    selector: 'node[class = "flagImage"]',
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
		    selector: 'node[class = "imageMap"]',
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

	// 3. adds event listeners
	cy.on('tap', function(evt) {
            tap (evt, cy, toolKit);
	});
	cy.on('cxttap', function(evt) {
            cxttap (evt, cy, toolKit);
	});
	cy.on('mouseover', function(evt) {
            mouseover (evt, cy, toolKit);
	});
	cy.on('mouseout', function(evt) {
            mouseout (evt, cy, toolKit);
	});
	cy.on('grab', function(evt){
            grab (evt, toolKit);
	});
	cy.on('drag', function(evt){
            drag (evt, toolKit);
	});

    return [cy, source];	
}




/* -------------- SEARCHING FUNCTIONS -------------- */

/**
 * 
 * search for a node by label
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} name: the label to be searched
 * @returns the node with label = {name}; or undefined if not found
 *
 **/
function searchConceptByLabel(cy, name) {
    var node = undefined;
    cy.nodes().forEach( function(ele) {
        if (ele.json().data.label === name
	    && ele.json().data.class === "concept") {
        node = ele;
        }
    });
    return node;
}



/**
 * 
 * get the label of parent node of the node whose label=label
 * 
 * @param {string} label label for the node whose parent to be get
 * @returns label of parent node
 *
 **/
function getParentLabel(label, childrenTable) {
    let parent = undefined;
    for(var key in childrenTable){
	let siblings = childrenTable[key];

	if (siblings.includes(label)) {
            parent = key;
	}
    };
    return parent;
}

/**
 * 
 * get the list of label of chilren node of the node whose label=label
 * 
 * @param {string} label label for the node whose parent to be get
 * @returns list of labels of children nodes
 */
function getChildrenLabel(label, childrenTable) {
    if(childrenTable.hasOwnProperty(label)) {
	return childrenTable[label];
    }
    return [];
}





function checkExistence(id, horizAlignments) {
    for (let i = 0; i < horizAlignments.length; i++) {
        for (let j = 0; j < horizAlignments[i].length; j++) {
            if (id === horizAlignments[i][j].node.json().data.id) {
                return true;
            }
        }
    }
    return false;
}
