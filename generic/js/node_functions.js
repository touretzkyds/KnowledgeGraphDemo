// FUNCTIONS FOR CONCEPT NODE NAVIGATION


/**
 * 
 * navigate the node with label=label
 * if the node is already in graph, expand it, update it to be current node, and update nav his & hav tool
 * otherwise navigate it through a link to the root. the default is "locatedInAdministrativeRegion"
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} label: the label of the node to be navigated to
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function navigateTo(cy, label, toolKit) {    
    // Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function body    
    var node = searchConceptByLabel(cy, label);
    
    if (node !== undefined) {	
	expandHelper(cy, node, toolKit);
        return;
    }

    navigateThrough(cy, label, toolKit);
}




/**
 * 
 * navigate through link and add link as edges and target nodes, default link is "locatedInAdministrativeRegion"
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} label: the label of the start node in the navigation
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function navigateThrough(cy, label, toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function    
    let currentNode = searchConceptByLabel(cy, displayResources.navHistoryList[0]);
    // follow the link, e.g. "locatedInAdministrativeRegion" to the last node
    // while (true) {
        //outgoers include both edges and nodes
        let outgoers = currentNode.outgoers();
        for (let i = 0; i < outgoers.length; i++) {
            let outgoer = outgoers[i];
            if (outgoer.json().group === "edges" &&
		outgoer.json().data.label === displayResources.link) {
                currentNode = outgoer.target();
                continue;
            }
        }
    //     break;
    // }
    let start = 0;
    let end = 0;
    for (let i = 0; i < displayResources.navHistoryList.length; i++) {
        if (displayResources.navHistoryList[i] === currentNode.json().data.label) {
            start = i + 1;
            continue;
        } 
        if (displayResources.navHistoryList[i] === label) {
            end = i + 1;
            break;
        }
    }

    // follow the link "locatedInAdministrativeRegion" from the curr node 
    // add new link and nodes until the node with label = name is added
    for (let i = start; i < end; i++) {
        var label = displayResources.navHistoryList[i];
        currentNode = addNodeHelper(cy, label, currentNode, displayResources.link,
				 toolKit);
    }
    // expandHelper(cy, currentNode);
    expandHelper(cy, currentNode, toolKit);
}



/* Both functions above use addNodeHelper and expandHelper*/

/**
 * 
 * add a link with label = link coming out from prevNoode links
 * to target node with label = label 
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} label: the label of newly added node
 * @param {node} prevNode: the node to which the new edge and node will be added
 * @param {string} link: the label of edge to be added
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/



/** THIS FUNCTION IS USED WHEN THE CODE LOOPS FOREVER WHEN TRAVELLING THROUGH VARIOUS NODES TO GET TO AN END NODE **/
function addNodeHelper(cy, label, prevNode, link,
		       toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function body    
    let addedData = [];
    let key = link;
    let value = label;
    // node info
    let tempNode = {"data":{}};
    // tempNode.data.type = "County"; ?  cannot determine type

    // Fix to avoid NaN bug:
    // Non-generic version
    // if (link === "locatedInAdministrativeRegion") {
    //   switch (prevNode.json().data.type) {
    //     case "City":
    //       tempNode.data.type = "County";
    //       break;
    //     case "County":
    //       tempNode.data.type = "State";
    //       break;
    //     case "State":
    //       tempNode.data.type = "Region";
    //       break;
    //     case "Region":
    //       tempNode.data.type = "Country";
    //       break;
    //     case "Country":
    //       tempNode.data.type = "Continent";
    //       break;
    //     default:
    //       tempNode.data.type = "SHOULD NOT REACH THIS";
    //   }
    // }
    // Generic version
    if (link === "locatedInAdministrativeRegion") {
	for (let i = 0; i < displayResources.orderedKeys.length; i++){
	    // safety
	    if (i+1 === displayResources.orderedKeys.length){
		console.log('SHOULD NOT REACH THIS');
		tempNode.data.type = "SHOULD NOT REACH THIS";
		break;
	    }
	    // body
	    if (prevNode.json().data.type === displayResources.orderedKeys[i]){
		tempNode.data.type = displayResources.orderedKeys[i+1];
		break;
	    }
	}
    }
    
    tempNode.group = "nodes";
    tempNode.data.label = value;
    tempNode.data.class = classifyclass(key, value);
    tempNode.data.id = convertToNodeID(prevNode.id(), key, value);
    tempNode.data.sourceID = prevNode.id();
    if (tempNode.data.class == "concept") {
        if (!displayResources.conceptNodeLabelToID.hasOwnProperty(value)) {
	    // conceptNodeLabelToID[value] = tempNode.data.id;
            displayResources.update('conceptNodeLabelToID', tempNode.data.id, value) 

        } else {
            tempNode.data.class = "dummyConcept";
        }
    }
    const radius = 400; 
    const sourceX = cy.$("#" + prevNode.id()).position('x');
    const sourceY = cy.$("#" + prevNode.id()).position('y');
    tempNode.position = {x:sourceX + radius, y:sourceY - radius};
    addedData.push(tempNode);
    // edge info
    let tempEdge = {"data":{}}
    tempEdge.group = "edges";
    tempEdge.data.id = convertToEdgeID(prevNode.id(), key, value)
    tempEdge.data.label = key;
    tempEdge.data.source = prevNode.id();
    tempEdge.data.target = tempNode.data.id;
    addedData.push(tempEdge);

    cy.add(addedData);

    graphVisualizerTool.reLayoutCola(cy, toolKit);
    return cy.$("#"+tempNode.data.id);
}


/**
 * 
 * if the current node is not ready to collapse, expand the node and set it to be current node, which is done within function addConceptNode
 * otherwise just set it to be current if it's already expanded
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {node} node: current node
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function expandHelper(cy, node, toolKit) {    
    // Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function body
    //e.g. nodeName 'Pittsburgh'
    const nodeName = node.json().data.label.split("\nboltz")[0];
    
    if (!node.hasClass('readyToCollapse')) {
	// If node you want to open has already been opened previously
        if (displayResources.conceptExpansionDataCache.hasOwnProperty(node.id())) {
            expandConceptNode(cy, node.id(),
			      displayResources.conceptExpansionDataCache[node.id()],
			      toolKit);

        } else {
	    // If node you want to open hasn't already been opened previously
            const url = propertyQuery(nodeName, true);
	    d3.json(url).then(function(data) {
		let jsonData = getDataJSON(data);
		if (jsonData == undefined) return;
		expandConceptNode(cy, node.id(), jsonData[0],
				  toolKit);});
        }
        cy.$("#" + node.id()).addClass('readyToCollapse');
    } else {
	// If the node you want to expand is already open
	displayResources.setAsCurrentNode(cy, node.id(), true,
					  toolKit, "");
    }
}



// KEY MAIN FUNCTION: expandConceptNode: had to be generalized
/**
 * 
 * expand the node by adding property nodes using nodeData
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} id: the id for the node to which properties be added
 * @param {JSON} nodeData
 * @param {dictionary} toolKit: our dictionary with all our graph tools 
 *
 **/
function expandConceptNode(cy, id, nodeData,
			   toolKit) {

    // Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    
    // Function body    
    // check to see if we are on startup with just the Pittsburgh node open, push that into the list of open city nodes
    if (Object.keys(displayResources.conceptExpansionDataCache).length == 1
	&& displayResources.horizAlignments.length == 0) {

	let pghID = (Object.keys(displayResources.conceptExpansionDataCache))[0];

	// ele.json().data syntax refers to a node
	// loops through all nodes until finds Pittsburgh's node	
        cy.nodes().forEach(function ( ele ) {
            if (ele.json().data.id === pghID) {
                alignmentX = 
                    {
                        node: ele,
                        offset: 0,
                    };

                // cityLevel.push(alignmentX);
		displayResources.levelListByPriority[displayResources.orderedKeys[0]].push(alignmentX);

                displayResources.horizAlignments.push(displayResources.levelListByPriority [ displayResources.orderedKeys[0] ]);

		// displayResources.update('horizAlignments', displayResources.levelListByPriority [displayResources.orderedKeys[0]], 'push')
            }
        });
    }

    
    /* We add node we want to expand (id) to the dataCache
    of expanded nodes */
    // displayResources.conceptExpansionDataCache[id] = nodeData;
    displayResources.update('conceptExpansionDataCache', nodeData, id);
    
    let addedData = []; /** ultimately a node object and an edge object will constitute addedData, which will be added to our cy object**/
    // x position of node we want to expand
    const sourceX = cy.$("#" + id).position('x');
    // y position of node we want to expand
    const sourceY = cy.$("#" + id).position('y');
    const radius = 400;
    let numOfKeys = 0;

    // looping through each key in nodeData and counting them, to know how many things are going to pop out of node when we expand it
    Object.keys(nodeData).forEach(function(key) {
        numOfKeys++;
    })
    
    let count = 1;
    //We update the type field of node we want to expand to be nodeData.type
    cy.$("#"+id).data("type", nodeData.type);


    /* Here we set leftNode -> the node in cy object that is the source of the one we want to expand
     and  we set rightNode -> the node in cy object that we want to expand */    
    let leftNode = null;
    let rightNode = null;
    // looping over all the nodes to find the source and currently expanding node
    cy.nodes().forEach(function( ele ){
        if (ele.json().data.id === id) {//here we stop at node we are currently expanding
            var sourceID = ele.json().data.sourceID;
            rightNode = ele;

	    //once we find current node, we look for source node
            cy.nodes().forEach(function( innerEle ){
                if (innerEle.json().data.id === sourceID) {//here we stop if we find source node
                    leftNode = innerEle;
                }
            });
        }
    });
    // console.log("already in graph?", checkExistence(id, displayResources.horizAlignments));

    /** SECTION 1: this section deals with the positioning of the expanded node **/
    /* If node NOT in graph, we have to take this step */
    if (!checkExistence(id, displayResources.horizAlignments)) {
        // get the difference in priority between the destination (current) and source node
        let priorityCurr = displayResources.adminAreaPriority[rightNode.json().data.type];
        let prioritySource = displayResources.adminAreaPriority[leftNode.json().data.type];
        var priority = prioritySource - priorityCurr;
	// Note, above, priority must be 'var', used later

	console.log('Priority; ', priority);
	
        // once we expand, we add the source/dest pairing as a vertical relationship
        var relation = { // this encodes the "edge" connecting both nodes
            axis:"y",
            left: leftNode,
            right: rightNode,
            gap: (priority * 1500), /** up-down distance expanded node from source node**/
	    /** gap is negative, because y axis inverted **/
            equality:true
        };

        displayResources.vertRelationships.push(relation);

        var offset_amt = 0;
        var alignmentX;

	/*  GENERIC CODE UPDATE 
	orderedKeys = ["City", "County", ..., "Continent"]	
	Casing on the type of our currently expanding node,
	placing it in the correct horizontal alignment level

	Loops through 'city', 'county', 'state' etc until we reach
	the one the node we want to expand belongs to
	*/

	for (let i = 0; i < Object.keys(displayResources.levelListByPriority).length; i++) {
	    if (rightNode.json().data.type === displayResources.orderedKeys[i]) {
		alignmentX = /**this is an object**/
                    {
			node: rightNode,
			offset: 0, /** vertical difference among nodes of same level**/
                    };

		/*
		  Note!! priorityLevel is now aliased to:
		   displayResources.levelListByPriority[orderedKeys[i]]
		*/		
		let priorityLevel = displayResources.levelListByPriority[ orderedKeys[i] ];
		
		priorityLevel.push(alignmentX); //cityLevel.push(alignmentX);
		
		offset_amt = priorityLevel.length - 1; // it's the number of nodes already in the level of the node you want to expand a new node on


		if (!displayResources.addedBoolListByPriority[ orderedKeys[i] ]) { // if there are no nodes in that level yet
                    displayResources.horizAlignments.push(priorityLevel);		    
                    displayResources.addedBoolListByPriority[ orderedKeys[i] ] = true; //addedCity = true
		}
            }   
	}
	
        
        // adds the relative relationship - with the quantified gap between them - to our vertical alignments
        const alignmentY = [
            {
                node: leftNode,
                offset: 0
            },
            {
                node: rightNode,
                offset: offset_amt * 1500 /** expanded node left-right distance from vertical axis of source node **/
            }
        ];
	
        displayResources.vertAlignments.push(alignmentY);

        // set our horizontal relationships based on each level

    }
    setHorizRelations(toolKit);


    /** SECTION 2: NO NEED TO CHANGE IT.
	This section handles creating every node and edge coming out of the expanded node **/
    Object.keys(nodeData).forEach(function(key) { // for each link that will come out of the node: nodeData is an argument given to the function, a dictionary with: {prefLabel:'Allegheney County', type: ..., coordinates: ..., ...}

        if (key != "prefLabel") { // we don't want prefLabel to be one of the keys coming out of the node

            var value = nodeData[key];	    

            // NODE INFORMATION
	    // This section creates every node that the expanded node links to	    
            var tempNode = {"data":{}}
            tempNode.data.type = nodeData.type;
            tempNode.group = "nodes";
            tempNode.data.label = value;
            tempNode.data.class = classifyclass(key, value);
            tempNode.data.id = convertToNodeID(id, key, value);
            tempNode.data.sourceID = id;

	    // If it's a concept	    
            if (tempNode.data.class == "concept") {
                // concept doesn't have a full form
                if (!displayResources.conceptNodeLabelToID.hasOwnProperty(value)) {
                    displayResources.conceptNodeLabelToID[value] = tempNode.id;
                } else {
                    // if one of the branches of our current node has the value of a direct parent
                    if (key != displayResources.link &&
			value == nodeData[displayResources.link]) {
			
                        tempNode.data.class = "concept";
                        // convert the prev node to dummyConcept, find any existing concept node and turns it into a dummyConcept
                        cy.nodes().forEach(function( ele ){

                            if (ele.json().data.label === value &&
				(ele.json().data.class === 'concept')) {
				
                                ele.json({data:{class:'dummyConcept'}});
                                cy.nodes(`[id = "${ele.id()}"]`).style({
                                    "background-color": '#FFFFFF',
                                    "border-color": '#ADD8E6',
                                });
                                //also we must collapse it
                                // if(cy.$("#" + ele.id()).hasClass('readyToCollapse')) {
                                //     closeConceptNode(cy, ele.id());
                                //     cy.$("#" + ele.id()).removeClass('readyToCollapse');
                                // }
                            }
                        });
                        // follows similar logic to right clicking our newly expanded node
                        //console.log("in our expand function ", tempNode.data.id);
                        cy.nodes(`[id = "${tempNode.id}"]`).style({
                            "background-color": '#ADD8E6',
                            "border-color": '#00008B',
                        });
			
                        displayResources.conceptNodeLabelToID[tempNode.data.label] = tempNode.id;
			
                        if (tempNode.id !== undefined) {
                            if (cy.$("#" + tempNode.id).hasClass('readyToCollapse')) {
                                closeConceptNode(
				    cy,
				    tempNode.id,
				    toolKit
				);
                                cy.$("#" + tempNode.id).removeClass('readyToCollapse');
                            }
                        }
                    } else {
                    tempNode.data.class = "dummyConcept";
                    }
		}
            }
            // sourceX and sourceY is based on x,y when you click on it, it adjusts with the gap
            const radian = (Math.PI * 2 / numOfKeys) * count;  
            var x = sourceX + radius * Math.sin(radian);
            var y = sourceY - radius * Math.cos(radian);
            y = y + (priority * 1500);

            // for these branches of this node, want the offset to be multiple of expanded node's index
            for (let j = 0; j < displayResources.horizAlignments.length; j++) {
                if (displayResources.horizAlignments[j].indexOf(rightNode) != -1) {
                    var index = displayResources.horizAlignments[j].indexOf(rightNode);
                    x = (1500*index) + x;
                }
            }
            tempNode.position = {x:x, y:y};
            addedData.push(tempNode);

	    
            // EDGE INFORMATION
	    // This section creates every edge that comes out of the expanded node
            var tempEdge = {"data":{}};
            tempEdge.group = "edges";
            tempEdge.data.id = convertToEdgeID(id, key, value);
            tempEdge.data.label = key;
            tempEdge.data.source = id;
            // console.log("source edge id/opened node", tempEdge.data.source);
            tempEdge.data.target = tempNode.data.id;
            // console.log("target edge id", tempEdge.data.target);
            if (tempEdge.data.label == displayResources.link
		|| (tempEdge.data.label != displayResources.link
		    && value != nodeData[displayResources.link])) {
                addedData.push(tempEdge);
            }
            cy.add(addedData);
            addedData = [];
            count++;
        }
    })

    // console.log('vertRelationships: ', displayResources.vertRelationships);
    // console.log('vertAlignments: ', displayResources.vertAlignments);
    // console.log('horizRelationships: ', displayResources.horizRelationships);
    // console.log('----------------------------------------');

    
    // Make all according updates to graph display
    graphVisualizerTool.reLayoutCola(cy, toolKit);
    displayResources.horizRelationships = [];
    graphVisualizerTool.adjustImageSize(cy);
    displayResources.setAsCurrentNode(cy, id, true,
				      toolKit, "");
}


// ---- HELPER FUNCTIONS -----
/**
 * 
 * creates and delineates horizontal relationships between the nodes on the different levels of our hierarchy
 * 
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/
function setHorizRelations(toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];

    // Function body     
    // loop over the entire map of levels and the nodes within each level, continuing to pair elements up 
    // and establish a relationship between them
    for (let j = 0; j < displayResources.horizAlignments.length; j++) {
        if (displayResources.horizAlignments[j].length > 1) {
            for (let i = 0; i < displayResources.horizAlignments[j].length - 1; i++) {
                var entity1 = displayResources.horizAlignments[j][i];
                var entity2 = displayResources.horizAlignments[j][i+1];
                var relationH = {
                    axis:"x",
                    left:entity1.node,
                    right: entity2.node,
                    gap: 1500,
                    equality:true
                };
                displayResources.horizRelationships.push(relationH);
            }
        }
    }
    displayResources.nodeRelationships = [].concat(displayResources.vertRelationships, displayResources.horizRelationships);
}



/**
 * 
 * close the node by removing property nodes who has zero outgoer
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} id: the id for the node to which properties be removed
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function closeConceptNode(cy, id, toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    

    // Function
    let currentNode = cy.$("#"+id);
    //outgoers include both edges and nodes
    let currentIsDeleted = false;
    let outgoers = currentNode.outgoers();
    let labelsToBeRemoved = [];
    for (let i = 0; i < outgoers.length; i++) {
        let outgoer = outgoers[i];
        if (outgoer.json().group === "edges" &&
	    outgoer.target().outgoers().length == 0) {
            if (outgoer.target().id() === displayResources.currentNode.id()) {
                currentIsDeleted = true;
            }
            labelsToBeRemoved.push(outgoer.target().json().data.label);
            cy.remove(outgoer);
            cy.remove(outgoer.target());
            
            const label = outgoer.target().json().data.label;
            if (displayResources.conceptNodeLabelToID[label] == outgoer.target().id()) {
                delete displayResources.conceptNodeLabelToID[label];
            }
        }
    } 
    reSetType(cy, id);
    let style = cy.$('#'+id).style();
    if (style['background-color'] === "rgb(255,0,0)" || currentIsDeleted) {
        displayResources.setSourceAsCurrentNode(
	    cy,
	    id,
	    labelsToBeRemoved,
	    toolKit);
    }
}


/**
 * 
 * reset the type to be the same as type of source node if the source node id is defined
 * 
 * @param {cytoscape object} cy the cytoscape object
 * @param {string} id id for the node to be reseted type
 *
 **/
function reSetType(cy, id) {
    const idForSourceNode = cy.$("#"+id).json().data.sourceID;
    if (idForSourceNode !== undefined) {
        cy.$("#"+id).json({data:{type: cy.$("#"+idForSourceNode).json().data.type}});
    }
}





/*---------------------------------------------------------------------
                           BNODE FUNCTIONS
  ---------------------------------------------------------------------
 */


/**
 * 
 * expand the bnode by adding property nodes using bnodeData
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} id: the id for the bnode to which properties be added
 * @param {JSON} bnodeData
 * @param {dictionary} toolKit: our dictionary with all our graph tools 
 *
 **/

function expandbNode(cy, id, bnodeData,
		     toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function body
    displayResources.bnodeExpansionDataCache[id] = bnodeData;
    
    if (cy.$('#' + id).json().data.label == 'b0') {
        bnodeData = bnodeData.b0;
    } else {
        bnodeData = bnodeData.b1;
    }
    let addedData = [];
    const sourceX = cy.$("#" + id).position('x');
    const sourceY = cy.$("#" + id).position('y');
    const radius = 300;
    let numOfKeys = 1;
    Object.keys(bnodeData).forEach(function(key) {
        numOfKeys++;
    }) 
    let count = 1;
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
    graphVisualizerTool.reLayoutCola(cy, toolKit);
}



/**
 * 
 * close the bnode by removing property nodes
 * 
 * @param {cytoscape object} cy: the cytoscape object
 * @param {string} id: the id for the bnode to which properties be removed
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function closebNode(cy, id, toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];

    // Function    
    let bnodeData = displayResources.bnodeExpansionDataCache[id];
    if (cy.$('#' + id).json().data.label == 'b0') {
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
