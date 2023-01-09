// search for a node in graph by label
// return that node if found
// otherwise retun undefined
function searchConceptByLabel(cy, name) {
    var node = undefined;
    cy.nodes().forEach(function(ele){
        if(ele.json().data.label === name && ele.json().data.class === "concept") {
        node = ele;
        }
    });
    return node;
}

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

function setSourceAsCurrentNode(cy, id) {
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
    cy.nodes(`[id = "${sourceID}"]`).style({
        "background-color": 'red'
    });
    currentNode = cy.$("#"+sourceID);
    updateNav(cy, "");
}

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

function removeConceptNode(cy, id) {
    var currNode = cy.$("#"+id);
    //outgoers include both edges and nodes
    var currIsDelelted = false;
    var outgoers = currNode.outgoers();
    for(let i = 0; i < outgoers.length; i++) {
        var outgoer = outgoers[i];
        if(outgoer.json().group === "edges" && outgoer.target().outgoers().length == 0) {
        if(outgoer.target().id() === currentNode.id()) {
            currIsDelelted = true;
        }
        deleteFromChildrenTable(outgoer.target().json().data.label);
        cy.remove(outgoer);
        cy.remove(outgoer.target())
        
        const label = outgoer.target().json().data.label;
        if(conceptNodeLabelToID[label] == outgoer.target().id()) {
            delete conceptNodeLabelToID[label];
        }
        }
    } 
    reSetType(cy, id);
    var node = cy.$("#"+id);
    var style = cy.$('#'+id).style();
    if (style['background-color'] === "rgb(255,0,0)" || currIsDelelted) {
        setSourceAsCurrentNode(cy, id);
    }
}

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

// note: the case for hasCounty edge is special: the label is hasCounty but the id is hasCounty + county name
// e.g. hasCountyAllegheny, because otherwise every edge has id 'hasCounty', which leads to duplicates
// also, id cannot have special characters
function convertToEdgeID(id, key, value) {
    return (id + "_" + key).replace(/[^\w]/g,"_");
}

function convertToNodeID(id, key, value) {
    return (id + "_rel_" + value).replace(/[^\w]/g,"_");
}

function reSetType(cy, id) {
    const idForSourceNode = cy.$("#"+id).json().data.sourceID;
    if(idForSourceNode !== undefined) {
        cy.$("#"+id).json({data:{type: cy.$("#"+idForSourceNode).json().data.type}});
    }
}

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