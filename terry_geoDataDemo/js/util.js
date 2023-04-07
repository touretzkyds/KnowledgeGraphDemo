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
function expandConceptNode(cy, id, nodeData) {
    var up = false;
    console.log("type", nodeData.type);
    //double loop to see if we expand up or down, first looping over expanded nodes
    Object.values(conceptExpansionDataCache).forEach(function(node) {
        // looping over the its characteristics
        Object.keys(node).forEach(function(trait) {
            // if we are the parent of any currently expanded node
            if (trait == "locatedInAdministrativeRegion" && node[trait] == nodeData["prefLabel"]) {
                up = true;
            }
        })
    }) 
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

    var leftNode = null;
    var rightNode = null;
    cy.nodes().forEach(function( ele ){
        if (ele.json().data.id === id) {
            // console.log(ele.json().data.sourceID);
            console.log("found destination node");
            var sourceID = ele.json().data.sourceID;
            rightNode = ele;
            cy.nodes().forEach(function( innerEle ){
                if (innerEle.json().data.id === sourceID) {
                    console.log("found source node");
                    leftNode = innerEle;
                }
            });
        }
    });

    Object.keys(nodeData).forEach(function(key) {
        if(key != "prefLabel") {
            var value = nodeData[key];
            // node info
            var tempNode = {"data":{}}
            tempNode.data.type = nodeData.type;
            tempNode.group = "nodes";
            tempNode.data.label = value;
            tempNode.data.class = classifyclass(key, value);
            tempNode.data.id = convertToNodeID(id, key, value);
            tempNode.data.sourceID = id;
            if(tempNode.data.class == "concept") {
                // concept doesn't have a full form
                if(!conceptNodeLabelToID.hasOwnProperty(value)) {
                    conceptNodeLabelToID[value] = tempNode.data.id;
                } else {
                    if(key != "locatedInAdministrativeRegion" && value == nodeData["locatedInAdministrativeRegion"]) {
                        tempNode.data.class = "concept";
                        // conceptNodeLabelToID[tempNode.data.label] = tempNode.data.id;
                        // convert the prev node to dummyConcept
                        cy.nodes().forEach(function( ele ){
                            //console.log("json label", ele.json().data.label, "mine", value, "id", id);
                            if(ele.json().data.label === value && (ele.json().data.class === 'concept')) {
                                ele.json({data:{class:'dummyConcept'}});
                                cy.nodes(`[id = "${ele.id()}"]`).style({
                                    "background-color": '#FFFFFF',
                                    "border-color": '#ADD8E6',
                                });
                            }
                        });
                        cy.nodes(`[id = "${tempNode.id}"]`).style({
                            "background-color": '#ADD8E6',
                            "border-color": '#00008B',
                        });
                        conceptNodeLabelToID[tempNode.data.label] = tempNode.id;
                        if(tempNode.id !== undefined) {
                            if(cy.$("#" + tempNode.id).hasClass('readyToCollapse')) {
                                closeConceptNode(cy, tempNode.id);
                                cy.$("#" + tempNode.id).removeClass('readyToCollapse');
                            }
                        }
                    } else {
                    tempNode.data.class = "dummyConcept";
                }
            }
            }
            const radian = (Math.PI * 2 / numOfKeys) * count;  
            var x = sourceX + radius * Math.sin(radian);
            var y = sourceY - radius * Math.cos(radian);
            console.log(tempNode.data.label, x, y);
            if (up) {
                y = y - 1000;
            } else {
                y = y + 1000;
            }
            if (rightNode.json().data.type === "County") {
                var index = countyLevel.indexOf(rightNode);
                x = (1500 * index) + x;
            }
            tempNode.position = {x:x, y:y};
            
            addedData.push(tempNode);
            // edge info
            var tempEdge = {"data":{}};
            tempEdge.group = "edges";
            tempEdge.data.id = convertToEdgeID(id, key, value);
            tempEdge.data.label = key;
            tempEdge.data.source = id;
            tempEdge.data.target = tempNode.data.id;
            if (tempEdge.data.label == "locatedInAdministrativeRegion" || (tempEdge.data.label != "locatedInAdministrativeRegion" && value != nodeData["locatedInAdministrativeRegion"])) {
                addedData.push(tempEdge);
            }
            cy.add(addedData);
            addedData = [];
            count++;
        }
    })

    // once we expand, we add to the gap list with the source and target
    var relation = {
        axis:"y",
        left: leftNode,
        right: rightNode,
        gap:up ? -1500 : 1500,
        equality:true
    };
    nodeRelationships.push(relation);

    const alignmentY = [
        {
            node: leftNode,
            offset: 0,
        },
        {
            node: rightNode,
            offset: 0,
        }
    ];
    
    vertAlignments.push(alignmentY);

    if (rightNode.json().data.type === "County") {
        horizAlignments = [];
        const alignmentX = 
            {
                node: rightNode,
                offset: 0,
            };
        countyLevel.push(alignmentX);
        horizAlignments.push(countyLevel);

        for (let i = 0; i < countyLevel.length-1; i++) {
            var county1 = countyLevel[i];
            var county2 = countyLevel[i+1];
            var relationH = {
                axis:"x",
                left: county1.node,
                right: county2.node,
                gap: 1500,
                equality:true
            };
            nodeRelationships.push(relationH);
        }
    }

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
function closeConceptNode(cy, id) {
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
function expandbNode(cy, id, bnodeData) {
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
        // node info
        var tempNode = {}
        tempNode.group = "nodes";
        const dataID = convertToNodeID(id, key, value);
        tempNode.data = {id: dataID, label: value, class: 'bnode', type: cy.$("#"+id).json().data.type};
        tempNode.data.sourceID = id;
        const radian = (Math.PI * 2 / numOfKeys) * count;  
        const x = sourceX + radius * Math.sin(radian);
        const y = sourceY - radius * Math.cos(radian);
        tempNode.position = {x:x, y:y};
        // edge info
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
function closebNode(cy, id) {
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
    if(key === "flagImage") {
        return "flagImage";
    }
    if(key === "hasCounties") {
        return "imageMap";
    }
    if(value.startsWith('b')) {
        return "qudt";
    }
    if(value.includes('boltz:Q')) {
        return "concept";
    }
    return "literal";
}