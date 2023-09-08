// FUNCTIONS FOR CONCEPT NODE NAVIGATION


/**
 * 
 * navigate through link and add link as edges and target nodes, default link is "locatedInAdministrativeRegion"
 * 
 * @param {string} label: the label of the start node in the navigation
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function navigateThrough(label, toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function    
    let currentNode = getCyNodeByLabel(displayResources.cy, displayResources.navHistoryList[0]);
    // follow the backBoneRelation, e.g. "locatedInAdministrativeRegion" to the last node
    // while (true) {
        //outgoers include both edges and nodes
        let outgoers = currentNode.outgoers();
        for (let i = 0; i < outgoers.length; i++) {
            let outgoer = outgoers[i];
            if (outgoer.json().group === "edges" &&
		outgoer.json().data.label === displayResources.backBoneRelations[0]) {
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

    // follow the backBoneRelation "locatedInAdministrativeRegion" from the curr node 
    // add new backBoneRelation and nodes until the node with label = name is added
    for (let i = start; i < end; i++) {
        var label = displayResources.navHistoryList[i];
        currentNode = addNodeHelper(label, currentNode, displayResources.backBoneRelations[0],
				 toolKit);
    }
    expandHelper(currentNode, toolKit);
}



/* Both functions above use addNodeHelper and expandHelper*/

/**
 * 
 * add a link with label = link coming out from prevNoode links
 * to target node with label = label 
 * 
 * @param {string} label: the label of newly added node
 * @param {node} prevNode: the node to which the new edge and node will be added
 * @param {string} backBoneRelation: the label of edge to be added
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function addNodeHelper(label, prevNode, backBoneRelation,
		       toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function body    
    let addedData = [];
    let key = backBoneRelation;
    let value = label;
    // node info
    let tempNode = {"data":{}};
    // tempNode.data.type = "County"; ?  cannot determine type

    // Non-generic fix to avoid NaN bug:
    // Non-generic version
    // if (backBoneRelation === "locatedInAdministrativeRegion") {
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
    if (backBoneRelation === "locatedInAdministrativeRegion") {
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
	    displayResources.conceptNodeLabelToID[value] = tempNode.data.id;

        } else {
            tempNode.data.class = "dummyConcept";
        }
    }
    const radius = 400; 
    const sourceX = displayResources.cy.$("#" + prevNode.id()).position('x');
    const sourceY = displayResources.cy.$("#" + prevNode.id()).position('y');
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

    displayResources.cy.add(addedData);

    graphVisualizerTool.reLayoutCola(toolKit);
    return displayResources.cy.$("#"+tempNode.data.id);
}


/**
 * 
 * if the current node is not ready to collapse, expand the node and set it to be current node, which is done within function addConceptNode
 * otherwise just set it to be current if it's already expanded
 * 
 * @param {node} node: current node
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 *
 **/

function expandHelper(node, toolKit) {    
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
            expandConceptNode(node.id(),
			      displayResources.conceptExpansionDataCache[node.id()],
			      toolKit);

        } else {
	    // If node you want to open hasn't already been opened previously
            const url = propertyQuery(nodeName, true);
	    d3.json(url).then(function(data) {
		let jsonData = getDataJSON(data);
		if (jsonData == undefined) return;
		expandConceptNode(node.id(), jsonData[0],
				  toolKit);});

        }
        displayResources.cy.$("#" + node.id()).addClass('readyToCollapse');
    } else {
	// If the node you want to expand is already open
	displayResources.setAsCurrentNode(node.id(), true,
					  toolKit, "");
    }
}



// /** OLD FUNCTION **/
// /**
//  * 
//  * expand the node by adding property nodes using insertedNodeData
//  * 
//  * @param {cytoscape object} cy: the cytoscape object
//  * @param {string} id: the id for the node we are expanding
//  * @param {JSON} insertedNodeData of the node we are expanding
//  * @param {dictionary} toolKit: our dictionary with all our graph tools 
//  *
//  **/
// function expandConceptNode(cy, id, insertedNodeData,
// 			   toolKit) {

//     // Tool aliases (to simplify syntax)
//     displayResources = toolKit['displayResources'];
//     hierarchyPathTool = toolKit['hierachyPathTool'];
//     subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
//     graphVipsualizerTool = toolKit['graphVisualizerTool'];    

//     // Function body    
//     // check to see if we are on startup with just the Pittsburgh node open, push that into the list of open city nodes
//     if (Object.keys(conceptExpansionDataCache).length == 1
// 	&& horizAlignments.length == 0) {
// 	// e.g. of pghID is Q1342
// 	let pghID = (Object.keys(conceptExpansionDataCache))[0];

// 	// ele.json().data syntax refers to a node
// 	// loops through all nodes in cy object until finds Pittsburgh's node	
//         cy.nodes().forEach( function(ele) {
//             if (ele.json().data.id === pghID) {
//                 horizAlign = 
//                     {
//                         node: ele,
//                         offset: 0,
//                     };
// 	    levelListByPriority[orderedKeys[0]].push(horizAlign);
//             horizAlignments.push(levelListByPriority [ orderedKeys[0] ]);	
//             }
//         });
//     }
   

    
//     /* We add node we want to expand (id) to the dataCache
//     of expanded nodes */
//     conceptExpansionDataCache[id] = insertedNodeData;
    
//     let addedData = []; /** ultimately a node object and an edge object will constitute addedData, which will be added to our cy object**/
//     // x position of node we want to expand
//     const sourceX = cy.$("#" + id).position('x');
//     // y position of node we want to expand
//     const sourceY = cy.$("#" + id).position('y');
//     const radius = 400;
//     let numOfKeys = 0;

//     // looping through each key in insertedNodeData and counting them, to know how many things are going to pop out of node when we expand it
//     Object.keys(insertedNodeData).forEach(function(key) {
//         numOfKeys++;
//     })
    
//     let count = 1;
//     //We update the type field of node we want to expand to be insertedNodeData.type
//     cy.$("#"+id).data("type", insertedNodeData.type);


//     /* Here we set sourceNode -> the node in cy object that is the source of the one we want to expand
//      and  we set insertedNode -> the node in cy object that we want to expand */    
//     let sourceNode = null;
//     let insertedNode = null;
//     // looping over all the nodes to find the source and currently expanding node
//     cy.nodes().forEach(function( ele ){
//         if (ele.json().data.id === id) {//here we stop at node we are currently expanding
//             var sourceID = ele.json().data.sourceID;
//             insertedNode = ele;

// 	    //once we find current node, we look for source node
//             cy.nodes().forEach(function( innerEle ){
//                 if (innerEle.json().data.id === sourceID) {//here we stop if we find source node
//                     sourceNode = innerEle;
//                 }
//             });
//         }
//     });

//     /** TRANSLATION **/
//     // console.log('sourceNode: ', sourceNode);
//     const sourceNodeName = sourceNode.json().data.label.split("\nboltz")[0];
//     const url = propertyQuery(sourceNodeName, true);    
//     d3.json(url).then(function(data) {	    
// 	// Getting node data to store in our tree root
// 	let jsonData = getDataJSON(data);
// 	if (jsonData == undefined) return;
// 	let sourceNodeData = jsonData[0];

// 	const sourceNodeLabel = sourceNode.json().data.label.split("\nboltz:")[0];
// 	let sourceGraphVizNode = displayResources.treeRoot.findNodeBFS(sourceNodeLabel);
    
// 	const insertedNodeHierarchyLevel = insertedNode.json().data.type;
// 	let insertedGraphVizNode = new GraphVizNode(insertedNodeData,
// 						    displayResources.hierarchyLevel[insertedNodeHierarchyLevel],
// 						    insertedNode,
// 						    false,
// 						    false);

// 	sourceGraphVizNode.addNode(insertedGraphVizNode, sourceNodeData, insertedNodeData, cy, toolKit);
//     });
		      

    
//     /** SECTION 1: this section deals with the positioning of the expanded node **/
    
//     /* If node NOT in graph, we have to take this step */
//     if (!checkExistence(id, horizAlignments)) {
	
// 	// get the difference in priority between the destination (current) and source node
//         let priorityCurr = displayResources.hierarchyLevel[insertedNode.json().data.type];
//         let prioritySource = displayResources.hierarchyLevel[sourceNode.json().data.type];
//         var priorityDifference = prioritySource - priorityCurr;
// 	// Note, above, priority must be 'var', used later

	
//         // once we expand, we add the source/dest pairing as a vertical relationship
//         var relation = { // this encodes the "edge" connecting both nodes
//             axis:"y",
//             left: sourceNode,
//             right: insertedNode,
//             gap: (priorityDifference * 1500), /** up-down distance expanded node from source node**/
// 	    /** gap is negative, because y axis inverted **/
//             equality:true
//         };

//         displayResources.vertRelationships.push(relation);


//         var offset_amt = 0;
//         var horizAlign;

// 	/*  GENERIC CODE UPDATE 
// 	orderedKeys = ["City", "County", ..., "Continent"]	
// 	Casing on the type of our currently expanding node,
// 	placing it in the correct horizontal alignment level

// 	Loops through 'city', 'county', 'state' etc until we reach
// 	the one the node we want to expand belongs to
// 	*/
// 	for (let i = 0; i < Object.keys(levelListByPriority).length; i++) {
// 	    if (insertedNode.json().data.type === orderedKeys[i]) {
// 		horizAlign = /**this is an object**/
//                     {
// 			node: insertedNode,
// 			offset: 0, /** vertical difference among nodes of same level**/
//                     };

// 		/*
// 		  Note!! priorityLevel is now aliased to:
// 		   displayResources.levelListByPriority[orderedKeys[i]]
// 		*/		
// 		let priorityLevel = levelListByPriority[ orderedKeys[i] ];
// 		priorityLevel.push(horizAlign);		
// 		offset_amt = priorityLevel.length - 1; // it's the number of nodes already in the level of the node you want to expand a new node on

// 		if (!addedBoolListByPriority[ orderedKeys[i] ]) { // if there are no nodes in that level yet
//                     horizAlignments.push(priorityLevel);
//                     addedBoolListByPriority[ orderedKeys[i] ] = true; //addedCity = true
// 		}
//             }   
// 	}

	        
//         // adds the relative relationship - with the quantified gap between them - to our vertical alignments
//         const vertAlign = [
//             {
//                 node: sourceNode,
//                 offset: 0
//             },
//             {
//                 node: insertedNode,
//                 offset: offset_amt * 1500 /** expanded node left-right distance from vertical axis of source node **/
//             }
//         ];
	
//         vertAlignments.push(vertAlign);

//         // set our horizontal relationships based on each level

//     }
//     setHorizRelations(toolKit);



//     /** SECTION 2: NO NEED TO CHANGE IT.
// 	This section handles creating every node and edge coming out of the expanded node **/
//     Object.keys(insertedNodeData).forEach(function(key) { // for each link that will come out of the node: insertedNodeData is an argument given to the function, a dictionary with: {prefLabel:'Allegheney County', type: ..., coordinates: ..., ...}

//         if (key != "prefLabel") { // we don't want prefLabel to be one of the keys coming out of the node

//             var value = insertedNodeData[key];	    

//             // NODE INFORMATION
// 	    // This section creates every node that the expanded node links to	    
//             var tempNode = {"data":{}}
//             tempNode.data.type = insertedNodeData.type;
//             tempNode.group = "nodes";
//             tempNode.data.label = value;
//             tempNode.data.class = classifyclass(key, value);
//             tempNode.data.id = convertToNodeID(id, key, value);
//             tempNode.data.sourceID = id;

// 	    // If it's a concept	    
//             if (tempNode.data.class == "concept") {
//                 // concept doesn't have a full form
//                 if (!conceptNodeLabelToID.hasOwnProperty(value)) {
//                     conceptNodeLabelToID[value] = tempNode.id;
//                 } else {
//                     // if one of the branches of our current node has the value of a direct parent
//                     if (key != displayResources.backBoneRelation &&
// 			value == insertedNodeData[displayResources.backBoneRelation]) {
			
//                         tempNode.data.class = "concept";
//                         // convert the prev node to dummyConcept, find any existing concept node and turns it into a dummyConcept
//                         cy.nodes().forEach(function( ele ){

//                             if (ele.json().data.label === value &&
// 				(ele.json().data.class === 'concept')) {
				
//                                 ele.json({data:{class:'dummyConcept'}});
//                                 cy.nodes(`[id = "${ele.id()}"]`).style({
//                                     "background-color": '#FFFFFF',
//                                     "border-color": '#ADD8E6',
//                                 });                    
//                             }
//                         });
//                         // follows similar logic to right clicking our newly expanded node
//                         //console.log("in our expand function ", tempNode.data.id);
//                         cy.nodes(`[id = "${tempNode.id}"]`).style({
//                             "background-color": '#ADD8E6',
//                             "border-color": '#00008B',
//                         });
			
//                         conceptNodeLabelToID[tempNode.data.label] = tempNode.id;
			
//                         if (tempNode.id !== undefined) {
//                             if (cy.$("#" + tempNode.id).hasClass('readyToCollapse')) {
//                                 graphVisualizerTool.closeConceptNode(
// 				    cy,
// 				    tempNode.id,
// 				    toolKit
// 				);
//                                 cy.$("#" + tempNode.id).removeClass('readyToCollapse');
//                             }
//                         }
//                     } else {
//                     tempNode.data.class = "dummyConcept";
//                     }
// 		}
//             }
//             // sourceX and sourceY is based on x,y when you click on it, it adjusts with the gap
//             const radian = (Math.PI * 2 / numOfKeys) * count;  
//             var x = sourceX + radius * Math.sin(radian);
//             var y = sourceY - radius * Math.cos(radian);
//             y = y + (priorityDifference * 1500);

//             // for these branches of this node, want the offset to be multiple of expanded node's index
//             for (let j = 0; j < horizAlignments.length; j++) {
//                 if (horizAlignments[j].indexOf(insertedNode) != -1) {
//                     var index = horizAlignments[j].indexOf(insertedNode);
//                     x = (1500*index) + x;
//                 }
//             }
//             tempNode.position = {x:x, y:y};
//             addedData.push(tempNode);

	    
//             // EDGE INFORMATION
// 	    // This section creates every edge that comes out of the expanded node
//             var tempEdge = {"data":{}};
//             tempEdge.group = "edges";
//             tempEdge.data.id = convertToEdgeID(id, key, value);
//             tempEdge.data.label = key;
//             tempEdge.data.source = id;
//             // console.log("source edge id/opened node", tempEdge.data.source);
//             tempEdge.data.target = tempNode.data.id;
//             // console.log("target edge id", tempEdge.data.target);
//             if (tempEdge.data.label == displayResources.backBoneRelation
// 		|| (tempEdge.data.label != displayResources.backBoneRelation
// 		    && value != insertedNodeData[displayResources.backBoneRelation])) {
//                 addedData.push(tempEdge);
//             }
//             cy.add(addedData);
//             addedData = [];
//             count++;
//         }
//     })
//     // console.log("levelListByPriority: ", levelListByPriority);
//     // console.log('----------------------------------------');
//     // console.log('vertRelationships: ', vertRelationships);
//     // console.log('horizRelationships: ', horizRelationships);
//     // console.log('----------------------------------------');
//     // console.log('vertAlignments: ', vertAlignments);
//     // console.log('horizALignments: ', horizAlignments);
//     // console.log('----------------------------------------');
//     // console.log('nodeRelationships: ', nodeRelationships);
//     // console.log('----------------------------------------');

    
//     // Make all according updates to graph display
//     graphVisualizerTool.reLayoutCola(cy, toolKit);
//     horizRelationships = [];
//     graphVisualizerTool.adjustImageSize(cy);
//     displayResources.setAsCurrentNode(cy, id, true,
// 				      toolKit, "");
// }


/** NEW FUNCTION **/
/**
 * 
 * expand the node by adding property nodes using insertedNodeData
 * 
 * @param {string} id: the id for the node we are expanding
 * @param {JSON} insertedNodeData of the node we are expanding
 * @param {dictionary} toolKit: our dictionary with all our graph tools 
 *
 **/
function expandConceptNode(id, insertedNodeData,
			   toolKit) {


    // Tool aliases (to simplify syntax)
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];
           
   
    // Function body
    displayResources.conceptExpansionDataCache[id] = insertedNodeData;
    
    let sourceNode = null;
    let insertedNode = null;
    // looping over all the nodes to find the source and currently expanding node
    displayResources.cy.nodes().forEach(function( ele ){
        if (ele.json().data.id === id) {//here we stop at node we are currently expanding
            var sourceID = ele.json().data.sourceID;
            insertedNode = ele;

	    //once we find current node, we look for source node
            displayResources.cy.nodes().forEach(function( innerEle ){
                if (innerEle.json().data.id === sourceID) {//here we stop if we find source node
                    sourceNode = innerEle;
                }
            });
        }
    });
    const sourceNodeName = sourceNode.json().data.label.split("\nboltz")[0];
    const url = propertyQuery(sourceNodeName, true);    
    d3.json(url).then(function(data) {
	// Getting node data to store in our tree root
	let jsonData = getDataJSON(data);
	if (jsonData == undefined) return;
	let sourceNodeData = jsonData[0];
	const sourceNodeLabel = sourceNode.json().data.label.split("\nboltz:")[0];
	let sourceGraphVizNode = displayResources.treeRoot.findNodeBFS(sourceNodeLabel);
	let insertedGraphVizNode = new GraphVizNode(
	    insertedNodeData,
	    displayResources.hierarchyLevel[insertedNodeData.type],
	    insertedNode,
	    false,
	    false);

	sourceGraphVizNode.addNode(insertedGraphVizNode, sourceNodeData, insertedNodeData, toolKit);

	// Reset tree layout
	displayResources.vertRelationships = [];
	displayResources.vertAlignments = [];
	displayResources.horizRelationships = [];
	displayResources.horizAlignments = [];
	displayResources.nodeRelationships = []; 

	// Set tree layout
	layoutTree(displayResources.treeRoot, toolKit);

	/** SECTION 1: this section deals with the positioning of the expanded node **/
	
	let addedData = []; /** ultimately a node object and an edge object will constitute addedData, which will be added to our cy object**/
	// x position of node we want to expand
	const sourceX = displayResources.cy.$("#" + id).position('x');
	// y position of node we want to expand
	const sourceY = displayResources.cy.$("#" + id).position('y');
	const radius = 400;
	let numOfKeys = 0;
	
	// looping through each key in insertedNodeData and counting them, to know how many things are going to pop out of node when we expand it
	Object.keys(insertedNodeData).forEach(function(key) {
            numOfKeys++;
	})
	
	let count = 1;
	//We update the type field of node we want to expand to be insertedNodeData.type
	displayResources.cy.$("#"+id).data("type", insertedNodeData.type);
	
	/** SECTION 2: NO NEED TO CHANGE IT.
	    This section handles creating every node and edge coming out of the expanded node **/
	Object.keys(insertedNodeData).forEach(function(key) { // for each link that will come out of the node: insertedNodeData is an argument given to the function, a dictionary with: {prefLabel:'Allegheney County', type: ..., coordinates: ..., ...}
	    
            if (key != "prefLabel") { // we don't want prefLabel to be one of the keys coming out of the node
		
		var value = insertedNodeData[key];	    
		
		// NODE INFORMATION
		// This section creates every node that the expanded node links to	    
		var tempNode = {"data":{}}
		tempNode.data.type = insertedNodeData.type;
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
			if (key != displayResources.backBoneRelations[0] &&
			    value == insertedNodeData[displayResources.backBoneRelations[0]]) {
			    
                            tempNode.data.class = "concept";
                            // convert the prev node to dummyConcept, find any existing concept node and turns it into a dummyConcept
                            displayResources.cy.nodes().forEach(function( ele ){
				
				if (ele.json().data.label === value &&
				    (ele.json().data.class === 'concept')) {
				    
                                    ele.json({data:{class:'dummyConcept'}});
                                    displayResources.cy.nodes(`[id = "${ele.id()}"]`).style({
					"background-color": '#FFFFFF',
					"border-color": '#ADD8E6',
                                    });                    
				}
                            });
                            // follows similar logic to right clicking our newly expanded node
                            //console.log("in our expand function ", tempNode.data.id);
                            displayResources.cy.nodes(`[id = "${tempNode.id}"]`).style({
				"background-color": '#ADD8E6',
				"border-color": '#00008B',
                            });
			    
                            displayResources.conceptNodeLabelToID[tempNode.data.label] = tempNode.id;
			    
                            if (tempNode.id !== undefined) {
				if (displayResources.cy.$("#" + tempNode.id).hasClass('readyToCollapse')) {
                                    graphVisualizerTool.closeConceptNode(
					tempNode.id,
					toolKit
				    );
                                    displayResources.cy.$("#" + tempNode.id).removeClass('readyToCollapse');
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
		y = y + 1500;

		// for these branches of this node, want the offset to be multiple of expanded node's index
		for (let j = 0; j < displayResources.horizAlignments.length; j++) {
                    if (displayResources.horizAlignments[j].indexOf(insertedNode) != -1) {
			var index = displayResources.horizAlignments[j].indexOf(insertedNode);
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
		if (tempEdge.data.label == displayResources.backBoneRelations[0]
		    || (tempEdge.data.label != displayResources.backBoneRelations[0]
			&& value != insertedNodeData[displayResources.backBoneRelations[0]])) {
                    addedData.push(tempEdge);
		}
		displayResources.cy.add(addedData);
		addedData = [];
		count++;
            }
	})


	// console.log('displayResources.vertRelationships: ', displayResources.vertRelationships);
	// console.log('vertAlignments: ', displayResources.vertAlignments);
	// console.log('horizAlignments: ', displayResources.horizAlignments);
	
    
	// Make all according updates to graph display
	graphVisualizerTool.reLayoutCola(toolKit);
	displayResources.horizRelationships = [];
	graphVisualizerTool.adjustImageSize(cy);
	displayResources.setAsCurrentNode(id, true,
					  toolKit, "");
    });  
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

