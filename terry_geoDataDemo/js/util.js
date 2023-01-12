/**
 * 
 * search for a node by label
 * 
 * @param {cytoscape object} cy     the cytoscape object
 * @param {string} name             the label to be searched
 * @returns the node with label = {name}; or undefined if not found
 */
function searchConceptByLabel(cy, name) {
    var node = undefined;
    cy.nodes().forEach(function(ele){
        if(ele.json().data.label === name && ele.json().data.class === "concept") {
        node = ele;
        }
    });
    return node;
}

/**
 * 
 * set the node as current node:
 * 1. restore color for every node 
 * 2. update its color be red 
 * 3. update global variable currentNode
 * 4. update nav history and nav tool
 * 
 * @param {cytoscape object} cy     the cytoscape object
 * @param {string} id       id of the node to be set as current
 * @param {string} parentLabel      label of parent of the node to be set
 */
function setAsCurrentNode(cy, id, parentLabel="") {
    cy.nodes().forEach(function( ele ){
        if(ele.json().data.class === 'concept') {
        cy.nodes(`[id = "${ele.id()}"]`).style({
            "background-color": '#ADD8E6',
            "border-color": '#00008B'
        });
        } else if(ele.json().data.class === 'dummyConcept') {
        cy.nodes(`[id = "${ele.id()}"]`).style({
            "background-color": '#FFFFFF',
            "border-color": '#ADD8E6',
        });
        }
    });
    cy.nodes(`[id = "${id}"]`).style({
        "background-color": 'red'
    });
    currentNode = cy.$("#"+id);
    updateNav(cy, parentLabel);
}


/**
 * 
 * set the source node as current node:
 * 1. restore color for every node 
 * 2. if has source node, update source node color be red 
 * 3. if has source node, update global variable currentNode
 * 4. if has source node, update nav history and nav tool
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the node whose source node to be set
 * @param {string[]} labelsToBeRemoved labels of removed nodes, used to remove labels in childrenTable
 * @returns 
 */
function setSourceAsCurrentNode(cy, id, labelsToBeRemoved) {
    var node = cy.$("#"+id);
    cy.nodes().forEach(function( ele ){
        if(ele.json().data.class === 'concept') {
        cy.nodes(`[id = "${ele.id()}"]`).style({
            "background-color": '#ADD8E6',
            "border-color": '#00008B'
        });
        }
    });
    const sourceID = node.json().data.sourceID;
    if(sourceID !== undefined) {
        cy.nodes(`[id = "${sourceID}"]`).style({
            "background-color": 'red'
        });
        currentNode = cy.$("#"+sourceID);
        updateNav(cy, "", labelsToBeRemoved);
    }
}

/**
 * 
 * set the source node as current node but node update nav
 * this is called as initialization set
 * 1. restore color for every node 
 * 2. update its color be red 
 * 3. update global variable currentNode
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the node to be set
 */
function setAsCurrentNodeWithoutUpdateNav(cy, id) {
    cy.nodes().forEach(function( ele ){
        if(ele.json().data.class === 'concept') {
        cy.nodes(`[id = "${ele.id()}"]`).style({
            "background-color": '#ADD8E6',
            "border-color": '#00008B'
        });
        } else if(ele.json().data.class === 'dummyConcept') {
        cy.nodes(`[id = "${ele.id()}"]`).style({
            "background-color": '#FFFFFF',
            "border-color": '#ADD8E6',
        });
        }
    });
    cy.nodes(`[id = "${id}"]`).style({
        "background-color": 'red'
    });
    currentNode = cy.$("#"+id);
}

/**
 * 
 * expand the node by adding property nodes using nodeData
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the node to which properties be added
 * @param {JSON} nodeData 
 */
function addConceptNode(cy, id, nodeData) {
    // const nodeData = getDataJSON(data);
    conceptExpansionDataCache[id] = nodeData;
    var addedData = [];
    const sourceX = cy.$("#" + id).position('x');
    const sourceY = cy.$("#" + id).position('y');
    const radius = 400;
    var numOfKeys = 0;

    Object.keys(nodeData).forEach(function(key) {
        numOfKeys++;
    }) 
    var count = 1;
    cy.$("#"+id).data("type", nodeData.type);
    Object.keys(nodeData).forEach(function(key) {
        if(key != "prefLabel") {
        var value = nodeData[key];

        var tempNode = {"data":{}}
        tempNode.data.type = nodeData.type;
        tempNode.group = "nodes";
        tempNode.data.label = value;
        tempNode.data.class = classifyclass(key, value);
        tempNode.data.id = convertToNodeID(id, key, value);
        tempNode.data.sourceID = id;
        if(tempNode.data.class == "concept") {
            if(!conceptNodeLabelToID.hasOwnProperty(value)) {
            conceptNodeLabelToID[value] = tempNode.data.id;
            } else {
            tempNode.data.class = "dummyConcept";
            }
        }
        
        const radian = (Math.PI * 2 / numOfKeys) * count;  
        const x = sourceX + radius * Math.sin(radian);
        const y = sourceY - radius * Math.cos(radian);
        tempNode.position = {x:x, y:y};

        addedData.push(tempNode);
        
        

        var tempEdge = {"data":{}}
        tempEdge.group = "edges";
        tempEdge.data.id = convertToEdgeID(id, key, value)
        tempEdge.data.label = key;
        tempEdge.data.source = id;
        tempEdge.data.target = tempNode.data.id;
        addedData.push(tempEdge);

        cy.add(addedData);
        addedData = [];
        count++;
        }
    })
    reLayoutCola(cy);
    adjustImageSize(cy);
    setAsCurrentNode(cy, id);
}

/**
 * 
 * close the node by removing property nodes who has zero outgoer
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the node to which properties be removed
 */
function removeConceptNode(cy, id) {
    var currNode = cy.$("#"+id);
    //outgoers include both edges and nodes
    var currIsDelelted = false;
    var outgoers = currNode.outgoers();
    var labelsToBeRemoved = [];
    for(let i = 0; i < outgoers.length; i++) {
        var outgoer = outgoers[i];
        if(outgoer.json().group === "edges" && outgoer.target().outgoers().length == 0) {
            if(outgoer.target().id() === currentNode.id()) {
                currIsDelelted = true;
            }
            labelsToBeRemoved.push(outgoer.target().json().data.label)
            cy.remove(outgoer);
            cy.remove(outgoer.target())
            
            const label = outgoer.target().json().data.label;
            if(conceptNodeLabelToID[label] == outgoer.target().id()) {
                delete conceptNodeLabelToID[label];
            }
        }
    } 
    reSetType(cy, id);
    var style = cy.$('#'+id).style();
    if (style['background-color'] === "rgb(255,0,0)" || currIsDelelted) {
        setSourceAsCurrentNode(cy, id, labelsToBeRemoved);
    }
}

/**
 * 
 * expand the bnode by adding property nodes using bnodeData
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the bnode to which properties be added
 * @param {JSON} bnodeData 
 */
function addbNode(cy, id, bnodeData) {
    bnodeExpansionDataCache[id] = bnodeData;
    if(cy.$('#' + id).json().data.label == 'b0') {
        bnodeData = bnodeData.b0;
    } else {
        bnodeData = bnodeData.b1;
    }
    var addedData = [];
    const sourceX = cy.$("#" + id).position('x');
    const sourceY = cy.$("#" + id).position('y');
    const radius = 300;
    var numOfKeys = 1;
    Object.keys(bnodeData).forEach(function(key) {
        numOfKeys++;
    }) 
    var count = 1;
    Object.keys(bnodeData).forEach(function(key) {
        const value = bnodeData[key];
        
        var tempNode = {}
        tempNode.group = "nodes";
        
        const dataID = convertToNodeID(id, key, value);
        tempNode.data = {id: dataID, label: value, class: 'bnode', type: cy.$("#"+id).json().data.type};
        tempNode.data.sourceID = id;
        const radian = (Math.PI * 2 / numOfKeys) * count;  
        const x = sourceX + radius * Math.sin(radian);
        const y = sourceY - radius * Math.cos(radian);
        tempNode.position = {x:x, y:y};

        var tempEdge = {}
        tempEdge.group = "edges";
        tempEdge.data = {id: convertToEdgeID(id, key, value), label: key, source: id, target: dataID};
        addedData.push(tempNode);
        addedData.push(tempEdge);
        cy.add(addedData);
        addedData = [];
        count++;
    })
    reLayoutCola(cy);
}

/**
 * 
 * close the bnode by removing property nodes
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the bnode to which properties be removed
 */
function removebNode(cy, id) {
    var bnodeData = bnodeExpansionDataCache[id];
    if(cy.$('#' + id).json().data.label == 'b0') {
        bnodeData = bnodeData.b0;
    } else {
        bnodeData = bnodeData.b1;
    }
    Object.keys(bnodeData).forEach(function(key) {
        const value = bnodeData[key];
        const nodeID = convertToNodeID(id, key, value);
        const edgeID = convertToEdgeID(id, key, value);
        cy.remove(cy.$('#' + edgeID));
        cy.remove(cy.$('#' + nodeID));
    })
}

/**
 * 
 * get the id for edge. NOTE: id cannot contain special characters
 * 
 * @param {string} id id for the source node
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
 * @param {string} id id for the source node
 * @param {string} key
 * @param {string} value 
 * @returns id for the node
 */
function convertToNodeID(id, key, value) {
    return (id + "_rel_" + value).replace(/[^\w]/g,"_");
}

/**
 * 
 * reset the type to be the same as type of source node if the source node id is defined
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the node to be reseted type
 */
function reSetType(cy, id) {
    const idForSourceNode = cy.$("#"+id).json().data.sourceID;
    if(idForSourceNode !== undefined) {
        cy.$("#"+id).json({data:{type: cy.$("#"+idForSourceNode).json().data.type}});
    }
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
    if(key === "image") {
        return "image";
    }
    if(key === "hasCounties") {
        return "countyImage";
    }
    if(value.startsWith('b')) {
        return "qudt";
    }
    if(value.includes('boltz:Q')) {
        return "concept";
    }
    return "literal";
}