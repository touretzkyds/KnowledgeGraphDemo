/**
 * Node class
 *
 **/
class GraphVizNode{
    constructor(nodeData, levelInHierarchy, cyNode,
		isRoot, isDummy) {
	this.parent = null; //GraphVizNode or null
	this.parentRelation = '';
	this.children = [];

	this.nodeData = nodeData;
	this.label = nodeData.prefLabel.split("\nboltz:")[0]; // key used to identify
	this.levelInHierarchy = levelInHierarchy;
	this.cyNode = cyNode;
	this.isRoot = isRoot;
	this.isDummy = isDummy;
    }


    /** NODE SEARCHING PACK **/
    // function called from a node, searches downwards in the tree from that node on
    // BFS source code: https://ellen-park.medium.com/implementing-breadth-first-search-in-javascript-49af8cfad763
    findNodeBFS(label){
	const result = [];
	const queue = [this];

	while (queue.length > 0){
	    const current = queue.shift(); //pop first node from queue
	    if (current === null) continue;
	    if (current.label == label)
		result.push(current);	    
	}

	if (result.length > 1){
	    console.log('ERROR: found more than one node');
	    return undefined;
	}

	else if (result.length == 0) {
	    console.log('Node not found');
	    return null;
	}

	else{
	    return result[0];
	}
    }
    

    /** --------- **/


    addNode(graphVizNode, sourceNodeData, insertedNodeData, toolKit){	
	// smaller levelInHierarchy: MUST PLACE BELOW
	if (graphVizNode.levelInHierarchy < this.levelInHierarchy) { // addChild
	    this.addChild(graphVizNode, toolKit);
	}

	// larger levelInHierarchy: MUST PLACE ABOVE
	else{ // addParent
	    this.addParent(graphVizNode, toolKit);
	}
    }

    addChild(newChildVizNode, toolKit){
	// Tool aliases
	displayResources = toolKit['displayResources'];
	// Shortening temporarily variable name
	let backBoneRelation = displayResources.backBoneRelations[0];
	let childNodeData = newChildVizNode.nodeData;
	let parentNodeData = this.nodeData;

	// Function body
	const parentNodeName = parentNodeData.prefLabel.split('\nboltz')[0];
	const childNodeName = childNodeData.prefLabel.split('\nboltz:')[0];	

	// OPTION A: Has no children OR new node has same priority as existing children
	if (this.children.length == 0 ||
	    this.children[0].levelInHierarchy == newChildVizNode.levelInHierarchy){

	    newChildVizNode.parent = this;
	    this.children.push(newChildVizNode);

	    // Setting relation between them
	    newChildVizNode.parentRelation = getBestRelation(parentNodeData,
							  childNodeName,
							  backBoneRelation);

	    
	}
	// OPTION B: has children that are a different level in hierachy from new node
	else {	    
	    // Case 1: new node is higher in hierarchy than children
	    /** HAVE TO REWRITE THIS **/
	    /** - Open Pennsylvania when US has children Pittsburgh, Harrisburg, Boston.
		Do all nodes at the same level. So loop through children find all that have connections to Pennsylvania,
		make them children of Pennsylvania. And then create Massachu. node. We add a new level. LINKS CAN'T SKIP LEVELS
		Exception: US and Boston. We open Pennsylvania frmo US. Then we put Pennsylvania, and then Add Mass.**/
	    if (this.children[0].levelInHierarchy < newChildVizNode.levelInHierarchy){ // you need to insert a new 
		// PART A: loop children of parent node to find the nodes that share link
		for (let i = 0; i < this.children.length; i++){
		    // Get current child's data
		    let currChild = this.children[i];
		    let currChildName = currChild.label;

		    // Search for a link with newChildVizNode
		    let bestRelation = getBestRelation(newChildVizNode.nodeData,
						       currChildName,
						       backBoneRelation);
		    
		    // if there exists a connection, connect graphViz with Child
		    if (bestRelation != 'inferredRelation') {
			newChildVizNode.children.push(currChild);
			currChild.parent = newChildVizNode;
			currChild.parentRelation = bestRelation;

			// remove from parent's children
			for (let j = 0; j < this.children.length; j++){
			    if (this.children[j].label == currChildName){
				this.children.splice(j, 1);
			    }				
			}
		    }
		}
		
		
		// PART B: now we deal with children that don't have a connection with newChildVizNode
		let savedChildren = this.children;
		this.children = [];
		savedChildren.forEach(function(child) {
		    // now we create path
		    child.parent = undefined;
		    child.parentRelation = undefined;
		    createUpwardsPath(this, child, toolKit);
		});



		// PART C: 
		// Now that we connected newChildVizNode with children of parentNode,
		// we connect parent node to newChildVizNode		
		
		let bestRelation = getBestRelation(parentNodeData,
						   newChildVizNode.label,
						   backBoneRelation);
		
		newChildVizNode.parent = this;
		newChildVizNode.parentRelation = bestRelation;
		this.children.push(newChildVizNode);	
	    }
	    
	    
	    // Case 2: new node is lower in hierarchy than children
	    /** For now, we assume there exists a path from parent node to
		newly inserted node by going up 'locatedinadministrativeregion' link'
		from newly inserted node to parent node **/
	    else if (this.children[0].levelInHierarchy > newChildVizNode.levelInHierarchy) {
		createUpwardsPath(this, newChildVizNode, toolKit);		
	    }
	}
    }



    addParent(newParentVizNode, toolKit){
	// Tool aliases
	displayResources = toolKit['displayResources'];
	// Shortening temporarily variable name
	let backBoneRelation = displayResources.backBoneRelations[0];
	let parentNodeData = newParentVizNode.nodeData;
	let childNodeData = this.nodeData;
	

	// Function body
	// console.log('CHILDNODEDATA: ', childNodeData);
	// console.log('PARENTNODEDATA: ', parentNodeData);
	const parentNodeName = parentNodeData.prefLabel.split("\nboltz")[0];
	const childNodeName = childNodeData.prefLabel.split('\nboltz:')[0];	

	// OPTION A: Has no parent
	if (this.parent == null){
	    this.parent = newParentVizNode;	    
	    newParentVizNode.children.push(this);
	    
	    // Gathering possible links
	    let validLinks = [];
	    // When adding a parent, you loop through links of child
	    Object.keys(childNodeData).forEach(function(key){
		// console.log(key);
		if (childNodeData[key].split("\n")[0] == parentNodeName){ //careful this might not work if there are trailing spaces!
		    validLinks.push(key);
		}
	    });
	    // console.log('validLinks: ', validLinks);

	    // Choosing link that joins them
	    if (validLinks.includes(backBoneRelation)){
		this.parentRelation = backBoneRelation;
	    }
	    else{
		this.parentRelation = validLinks[0];
	    }

	    // Checking if root
	    if (this.isRoot){
		this.isRoot = false;
		this.parent.isRoot = true;
		displayResources.treeRoot = this.parent;
	    }	    
	}

	
	// OPTION B: already has a parent
	else {
	    // Case 1: insert node in between
	    if (this.parent.levelInHierarchy > newParentVizNode.levelInHierarchy){
		// Search 
		// 1. Connect newParentVizNode to current node's parent
		newParentVizNode.parent = this.parent;
		newParentVizNode.parentRelation = link; // CAREFUL, which link is this
		
		this.parent.children = [newParentVizNode];
		
		// 2. Connect newParentVizNode to current node
	    }
	    
	    this.parent.addChildOrParent(newParentVizNode, link);
	}
	
    }    



}	
    


/**
 * updates cola's format specific variables with respect to an
 * input tree
 *
 * @param {object} root of the tree
 * @param {dictionary} toolKit: our dictionary with all our graph tools  
 **/

//CAREFUL: recursive function
function layoutTree(root, toolKit){
    // Tool aliases (to simplify syntax)
    displayResources = toolKit['displayResources'];    


        
    // Function body    
    let children = root.children;
    let numberChildren = children.length;
    let factor = Math.floor(numberChildren/2); // integer division

    
    // For the root only
    // (Pre) Check to see if we are on startup with just one node
    if (root.parent == null){
        let horizAlign = 
            {
                node: root.cyNode,
                offset: 0,
            };

	let type = root.cyNode.json().data.type.split("\nboltz:")[0];
	displayResources.levelListByPriority[type].push(horizAlign);
	displayResources.horizAlignments.push(displayResources.levelListByPriority[type]);
    }
    
    // For each child
    for (let i = 0; i < numberChildren; i++){
	// 1. vertRelationships
	let relation = { axis:"y",
			 left: root.cyNode,
			 right: children[i].cyNode,
			 gap: 1000,
			 equality: true};

	displayResources.vertRelationships.push(relation);

	
	// 2. vertAlignments: only apply once we have nodes in same level
	let vertAlign = [
	    {
		node: root.cyNode,
		offset: 0
	    },
            {
		node: children[i].cyNode,
		offset: factor * 1500
	    }
        ];
	displayResources.vertAlignments.push(vertAlign);
	factor = factor - 1;
	

	// 3. horizAlignments: only apply once we have nodes in same level
	let horizAlign = /**this is an object**/
        {
	    node: children[i].cyNode,
	    offset: 0, /** vertical difference among nodes of same level**/
        };

	let type = children[i].cyNode.json().data.type.split("\nboltz:")[0];
	displayResources.levelListByPriority[type].push(horizAlign);
	
	if (!displayResources.addedBoolListByPriority[type]) {
            displayResources.horizAlignments.push(displayResources.levelListByPriority[type]);
            displayResources.addedBoolListByPriority[type] = true;
	}

	// 4. horizRelations
	if (numberChildren > 1){
	    for (let i = 0; i < numberChildren - 1; i++){
		let relationH = {
                    axis:"x",
                    left: children[i].cyNode,
                    right: children[i+1].cyNode,
                    gap: 1500,
                    equality:true
                };
                displayResources.horizRelationships.push(relationH);
	    }
	}	

	// recursive call
	layoutTree(children[i], toolKit);		
    }
    // 5. nodeRelationships
    displayResources.nodeRelationships = [].concat(displayResources.vertRelationships, displayResources.horizRelationships);

    
}



/**
 * 
 * creates a path between two nodes as long as a given priorityLevel
 * 
 * @param {object} parentGraphVizNode
 * @param {object} startGraphVizNode
 * @param {int} priorityOfLastNode: priority of the node that will connect to parentGraphVizNode
 * @param {object} toolKit
 **/
   
/** For now, we assume there exists a path from parent node to
    newly inserted node by going up 'locatedinadministrativeregion' or any of the other
    backBone links
    from newly inserted node to parent node **/
// NOTE: function assumes that both nodes to connect are currently unrelated / unconnected
function createUpwardsPath(parentGraphVizNode, startGraphVizNode, toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    
    // go up to create path from newly inserted node to parent node, which
    // may go through its children or not
    let chainUnfinished = true;
    let currentNodeInChain = startGraphVizNode;

    // find which backBoneRelation our currentNodeInChain uses
    let currentNodeInChainBackBoneRelation = getBackBoneRelation(currentNodeInChain.nodeData,
								 displayResources.backBoneRelations);
    console.log(currentNodeInChainBackBoneRelation);
    let immediateParentName = startGraphVizNode.nodeData[currentNodeInChainBackBoneRelation].split("\nboltz:")[0];
    while (chainUnfinished){
	// FIRST: check if immediate parent is already in tree datastructure
	let immediateParentGraphVizNode = displayResources.treeRoot.findNodeBFS(immediateParentName);
	if (immediateParentGraphVizNode != null){	   
	    immediateParentGraphVizNode.children.push(currentNodeInChain);

	    currentNodeInChain.parent = immediateParentGraphVizNode;
	    currentNodeInChain.parentRelation = currentNodeInChainBackBoneRelation;
	    
	    chainUnfinished = false;
	}

	else{
	    // OTHERWISE
	    // basic info
	    let immediateParentData = getNodeData(immediateParentName);
	    // getting cy node
	    let immediateParentNode = getCyNodeByLabel(displayResources.cy, immediateParentName);

	    // creating immediate parent graphVizNode
	    immediateParentGraphVizNode = new GraphVizNode(
		immediateParentData,
		displayResources.hierarchyLevel[immediateParentData.type],
		immediateParentNode,
		false,
		false);

	    // adding immediateParent connection to currentNodeInChain
	    currentNodeInChain.parent = immediateParentGraphVizNode;
	    currentNodeInChain.parentRelation = currentNodeInChainBackBoneRelation;
	    immediateParentGraphVizNode.children.push(currentNodeInChain);
	    
	    // 1. check if we arrived to the hierarchy level of node children
	    if (immediateParentNode.levelInHierarchy ==
		parentGraphVizNode.children[0].levelInHierarchy){
		
		parentGraphVizNode.children.push(immediateParentGraphVizNode);
		
		let immediateParentBackBoneRelation = getBackBoneRelation(
		    immediateParentGraphVizNode.nodeData,
		    displayResources.backBoneRelations);
		
		immediateParentGraphVizNode.parentRelation = getBestRelation(
		    parentGraphVizNode.nodeData,
		    immediateParentName,
		    immediateParentBackBoneRelation);
		
		immediateParentGraphVizNode.parent = parentGraphVizNode;

		chainUnfinished = false;
		
	    }

	    else {
		currentNodeInChain = immediateParentGraphVizNode;
		immediateParentName = currentNodeInChain.nodeData[backBoneRelation].split("\nboltz:")[0];
		
	    }
	    
	}
    }

}
