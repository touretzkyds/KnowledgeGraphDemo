/**
 * 
 * starting function that performs the query from propertyQuery
 * calls visualizeData to initialize graph, HierarchyPathTool,
 * and SubGraphNavigatorTool
 * 
 * @param {string} conceptName: the name for region to be queried. e.g. Pittsburgh
 * @param {dictionary} toolKit: our dictionary with all our graph tools
 */

function initializeToConcept(conceptName, toolKit) {
    // Tool aliases
    displayResources = toolKit['displayResources'];
    hierarchyPathTool = toolKit['hierachyPathTool'];
    subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
    graphVipsualizerTool = toolKit['graphVisualizerTool'];

    // Function body    


    // Initializing the graph
    const url = propertyQuery(conceptName, true);    
    d3.json(url).then(function(data) {
	console.log('Bindings: ', data.results.bindings);
	// Setting to true the existence of currentNode type in addedBoolListByPriority
	let value = data.results.bindings[0]['nodeType']['value'];
	let type = value.split('/ontology/')[1];
	displayResources.addedBoolListByPriority[type] = true;
	console.log(displayResources.addedBoolListByPriority);

	
	/** Check if data is undefined **/
	const binding = data.results.bindings;
	if (binding === undefined || binding.length === 0) {
            alert('Please enter valid name.');
            return undefined;
	}
	
	/** Continue **/
	[cy, source] = getCytoscapeObjectAndSource(data, conceptName, toolKit);
	
	// INITIALIZE navHistory and navTools (initNav)
	const navListPairsUrl = navHistoryListQuery(conceptName, displayResources.link);
	d3.json(navListPairsUrl).then(function(data) {
	    // Give initial values to some essential main variables
	    displayResources.update('childrenTable', {});
	    let path = hierarchyPathTool.getRankedNavHistoryList(data, toolKit);

	    
	    displayResources.update('navHistoryList', path);	    
	    displayResources.updateChildrenTable();
	    
	    // Initialize the nav history
	    hierarchyPathTool.initNavHistory(cy, toolKit);

	    // Initialize the nav tools
	    subGraphNavigatorTool.initNavTools(cy, toolKit);
	});

	// Determining the current node
	displayResources.setAsCurrentNode(cy, source, false,
					  toolKit, parentLabel="");

	// Drawing the actual graph with cola
	graphVisualizerTool.reLayoutCola(cy, toolKit);
	graphVisualizerTool.adjustImageSize(cy);
    });
}





/**
 * 
 * DisplayResources class creates an instance of a database-like
 * object that manages
 * calls visualizeData to initialize graph, HierarchyPathTool,
 * and SubGraphNavigatorTool
 *
 * Constructor arguments:
 * @param {string} link: e.g. 'locatedInAdministrativeRegion'
 * @param {list} orderedKeys: e.g. ['City', 'Region', ...]
 */
class DisplayResources {
    /* The arguments handed to the constructor will narrow down the genericity */
    constructor(link, orderedKeys){
	this.navHistoryList = [];

	this.bnodeExpansionDataCache = {};
	this.conceptExpansionDataCache = {};
	this.conceptNodeLabelToID = {};
	
	this.currentNode = undefined;
	this.currentLabel = '';

	// Relative placement of the nodes on graph
	this.nodeRelationships = [];
	this.horizRelationships = [];
	this.vertRelationships = [];
	
	this.vertAlignments = [];
	this.horizAlignments = [];

	//Initial positions of grabbed nodes
	//Used to achieve dragging nodes in group
	this.initialPositions = {};

	// Initial positions for images
	// Used to restore image to the previous position after zooming in and dragging
	this.prevImagePositions = {};
	

	/* New variables added for genericity */
	this.link = link;


	/* levelListByPriority example:
	   { 'City': ['Pittsburgh'],
	   'County': [];
	   'State': ['Pennsylvania', 'New Mexico'],
	   ...
	   }
	*/
	this.levelListByPriority = {};
	for (let i = 0; i < orderedKeys.length; i++){
	    this.levelListByPriority[ orderedKeys[i] ] = [];
	}
	/* This dictionary encapsulates generically the previous code:
	this.cityLevel = [];
	this.countyLevel = [];
	this.stateLevel = [];
	this.regionLevel = [];
	this.countryLevel = [];
	this.continentLevel = [];
	*/
	
	/* addedBoolListByPriority example:
	   { 'City': false,
	   'County': false;
	   'State': false,
	   ...
	   }
	*/
	this.addedBoolListByPriority = {};
	for (let i = 0; i < orderedKeys.length; i++){
	    this.addedBoolListByPriority [ orderedKeys[i] ] = false;
	}
	/* This dictionary encapsulates generically the previous code:
	this.addedCity = false;
	this.addedCounty = false;
	this.addedState = false;
	this.addedRegion = false;
	this.addedCountry = false;
	this.addedContinent = false;
	*/

	
	// Converting orderedKeys list to dictionary to make access easy
	this.orderedKeys = orderedKeys;
	this.adminAreaPriority = {};
	
	for (let i = 0; i < orderedKeys.length; i++){
	    this.adminAreaPriority[ orderedKeys[i] ] = i+1;
	}	
	/* Transforms user input list (orderedKeys) into dictionary
	Encapsulates generically:
	this.adminAreaPriority = {
	    "City": 1,
	    "County": 2,
	    "State": 3,
	    "Region": 4,
	    "Country": 5,
	    "Continent": 6
	};*/
    }


    reset(link, orderedKeys){
	this.navHistoryList = [];

	this.bnodeExpansionDataCache = {};
	this.conceptExpansionDataCache = {};
	this.conceptNodeLabelToID = {};
	
	this.currentNode = undefined;
	this.currentLabel = '';

	// Relative placement of the nodes on graph
	this.nodeRelationships = [];
	this.horizRelationships = [];
	this.vertRelationships = [];
	
	this.vertAlignments = [];
	this.horizAlignments = [];

	//Initial positions of grabbed nodes
	//Used to achieve dragging nodes in group
	this.initialPositions = {};

	// Initial positions for images
	// Used to restore image to the previous position after zooming in and dragging
	this.prevImagePositions = {};
	

	/* New variables added for genericity */
	this.link = link;

	this.levelListByPriority = {};
	for (let i = 0; i < orderedKeys.length; i++){
	    this.levelListByPriority[ orderedKeys[i] ] = [];
	}

	this.addedBoolListByPriority = {};
	for (let i = 0; i < orderedKeys.length; i++){
	    this.addedBoolListByPriority [ orderedKeys[i] ] = false;
	}
	
	// Converting orderedKeys list to dictionary to make access easy
	this.orderedKeys = orderedKeys;
	this.adminAreaPriority = {};
	
	for (let i = 0; i < orderedKeys.length; i++){
	    this.adminAreaPriority[ orderedKeys[i] ] = i+1;
	}		
    }

    /* ----------------------------------------------------------------- */

    /* This section handles variable-update requests from the tools
       (HierarchyPathTool, SubGraphNavigatorTool, GraphVisualizerTool) */
    /**
     * 
     * Handles all variable update requests (which will be stored in
     * the database displayResources)
     * 
     *
     * @param {string} variable: indicates variable we want to edit in
     *                           the 'database'
     * @param {any type} value: the new value we want to give the
     *                          variable
     * @pararm {int} index: the index we want to edit in case of
     *                      changing a list its default value is -1
     **/
    update(variable, value, index = -1){
	if (variable === 'conceptExpansionDataCache'){
	    this.conceptExpansionDataCache[index] = value;
	}
	else if (variable === 'conceptNodeLabelToID'){
	    this.conceptNodeLabelToID[index] = value;
	}
	else if (variable === 'childrenTable'){
	    this.childrenTable = value;
	}
	else if (variable === 'navHistoryList' && index === -1){
	    this.navHistoryList = value;
	}
	else if (variable === 'horizAlignments' && index === 'push'){
	    this.horizAlignments.push(value);
	}
	
	
    }
    
    /**
     * 
     * Updates the variable 'childrenTable' according to a new
     * navHistoryList. It reads this.navHistoryList,
     * then edits this.childrenTable
     *
     * No arguments
     **/
    updateChildrenTable() {
	// Function
	for (let i = 0; i < this.navHistoryList.length; i++) {
	    var current = this.navHistoryList[i];
	    if (i === 0) {
		if (this.childrenTable.hasOwnProperty(current)) {
		    continue;
		}
		this.childrenTable[current] = [];
	    } else {
		var child = this.navHistoryList[i - 1];
		if (this.childrenTable.hasOwnProperty(current)) {
		    let siblings = this.childrenTable[current];
		    if(!siblings.includes(child)) {
			siblings.push(child);
			siblings.sort();
		    } 
		    continue;
		}
		this.childrenTable[current] = [child];
	    }
	}
    }


    
    /**
     * 
     * Deletes any occurance of label=label in childrenTable if its not
     * in the updated navHistoryList
     * 
     * @param {string} label: label for the node to be deleted in
     *                        childrenTable
     */
    deleteFromChildrenTable(label) {
	if (this.navHistoryList.includes(label)) {
	    return;
	}

	if (this.childrenTable.hasOwnProperty(label)) {
	    delete this.childrenTable[label];
	}

	for (var key in this.childrenTable){
	    let siblings = this.childrenTable[key];
	    if (siblings.includes(label)) {
		let id = siblings.indexOf(label);
		siblings.splice(id, 1);
	    }
	};
    }
    
    /* ----------------------------------------------------------------- */
    /* This section handles syncronized updates to the HierachyPathTool
     and the SubGraphNavigatorTool*/

    /**
     * 
     * Updates both the HierarchyPathTool buttons and the
     * SubGraphNavigatorTool buttons
     * 
     * @param {cytoscape object} cy: the cytoscape object
     * @param {string} parentLabel: label of the current node's parent
     * @param {list} labelsToBeRemoved: list of labels removed in cytoscape
     *              graph, need to be removed in childrenTable as well. Empty as default
     **/

    updateNav(cy, parentLabel,
	      toolKit,
	      labelsToBeRemoved = []) {	
	// Tool aliases
	displayResources = toolKit['displayResources'];
	hierarchyPathTool = toolKit['hierachyPathTool'];
	subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
	graphVipsualizerTool = toolKit['graphVisualizerTool'];

	// Function body
	// this.currentLabel = this.currentNode.json().data.label;
	// this.update('currentLabel', this.currentNode.json().data.label);

	// currentConceptName example: 'Pittsburgh'
	let currentConceptName = this.currentLabel.split("\nboltz:")[0];
	
	if (this.navHistoryList.includes(this.currentLabel))
	{
	    hierarchyPathTool.updateNavHistory(toolKit);
	    subGraphNavigatorTool.updateNavTools(parentLabel, toolKit, []);
	}	
	else {
	    const navListPairsUrl = navHistoryListQuery(currentConceptName, true);
	    

	    /* Here we have to capture our object 'this' in a constant,
	       because the scope of 'this' won't work inside the
	       function d3.json(...).then(function(...){ ... })*/
	    let vizTool = this;
	    
	    d3.json(navListPairsUrl).then(function(data){

		let path = hierarchyPathTool.getRankedNavHistoryList(data, toolKit);
		vizTool.update('navHistoryList', path, -1);

		vizTool.updateChildrenTable();
		
		
		hierarchyPathTool.initNavHistory(cy, toolKit);

		subGraphNavigatorTool.updateNavTools(parentLabel,
						     toolKit,
						     labelsToBeRemoved)});
	}
    }


    /* ---------------- NODE HANDLING FUNCTIONS ---------------------*/
    /**
     * 
     * Set the node as current node:
     * 1. restore color for every node 
     * 2. update its color be red 
     * 3. update displayResources variable currentNode
     * 4. (OPTIONAL: depends on third parameter):
     *    update nav history and nav tool
     * 
     * @param {cytoscape object} cy: the cytoscape object
     * @param {string} id: id of the node to be set as current
     * @param {string} parentLabel: label of parent of the node to be set
     **/
    setAsCurrentNode(cy, id, navUpdateRequired,
		     toolKit,
		     parentLabel="") {

	// Tool aliases
	displayResources = toolKit['displayResources'];
	hierarchyPathTool = toolKit['hierachyPathTool'];
	subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
	graphVipsualizerTool = toolKit['graphVisualizerTool'];


	
	// Function body	
	cy.nodes().forEach(function( ele ){
            if (ele.json().data.class === 'concept') {
		cy.nodes(`[id = "${ele.id()}"]`).style({
		    "background-color": '#ADD8E6',
		    "border-color": '#00008B'
		});
            } else if (ele.json().data.class === 'dummyConcept') {
		cy.nodes(`[id = "${ele.id()}"]`).style({
		    "background-color": '#FFFFFF',
		    "border-color": '#ADD8E6',
		});
            }
	});
	cy.nodes(`[id = "${id}"]`).style({
            "background-color": 'red'
	});
	// Update current node
	this.currentNode = cy.$("#"+id);

	// Update current label
	this.currentLabel = this.currentNode.json().data.label;

	// Update nav if required
	if ( navUpdateRequired ) {
	    this.updateNav(cy, parentLabel,
			   toolKit,
			   []);
	}
		
    }

    /**
     * 
     * Set the source node as current node:
     * 1. restore color for every node 
     * 2. if has source node, update source node color be red 
     * 3. if has source node, update displayResources variable currentNode
     * 4. if has source node, update nav history and nav tool
     * 
     * @param {cytoscape object} cy the cytoscape object
     * @param {string} id: id for the node whose source node to be set
     * @param {string[]} labelsToBeRemoved: labels of removed nodes,
     *                   used to remove labels in childrenTable
     **/
    
    setSourceAsCurrentNode(cy, id, labelsToBeRemoved,
			   toolKit) {
	// Tool aliases
	displayResources = toolKit['displayResources'];
	hierarchyPathTool = toolKit['hierachyPathTool'];
	subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    

	// Function body	
	let node = cy.$("#"+id);
	cy.nodes().forEach(function( ele ){
            if (ele.json().data.class === 'concept') {
		cy.nodes(`[id = "${ele.id()}"]`).style({
		    "background-color": '#ADD8E6',
		    "border-color": '#00008B'
		});
            }
	});
	const sourceID = node.json().data.sourceID;
	if (sourceID !== undefined) {
            cy.nodes(`[id = "${sourceID}"]`).style({
		"background-color": 'red'
            });
	    // Update current node
            this.currentNode = cy.$("#"+sourceID);

	    // Update current label
	    this.currentLabel = this.currentNode.json().data.label;
	    
	    // Update navigation system
	    this.updateNav(cy, "",
			   toolKit,
			   labelsToBeRemoved);
	}
    }
    
}



/**
 * 
 * HierarchyPathTool is the tool at the top left of the screen 
 *
 * No constructor arguments:
 **/
class HierarchyPathTool {
    
    /**
     * 
     * Using the data queried from server, generates hierarchy path
     * tool list
     * 
     * @param {object} data: data fetched from server in JSON format
     * @param {dictionary} toolKit: our dictionary with all our graph tools
     *
     * @returns:  hierarchy path tool list (navHistoryList)
     **/
    
    getRankedNavHistoryList(data, toolKit) {	
	// Tool aliases
	displayResources = toolKit['displayResources'];

	// Function body
	const binding = data.results.bindings;
	if (binding.length === 0) {
	    // navHistoryList = [];
	    displayResources.update('navHistoryList', [], -1);	    
            return [];
	}
	// construct mapping from name to Qnumber
	let nameToQnumber = {};
	for (let i = 0; i < binding.length; i++) {
            var current = binding[i];
            nameToQnumber[current.xLabel.value] = current.x.value.split("/data/")[1];
            nameToQnumber[current.yLabel.value] = current.y.value.split("/data/")[1];
	}
	
	// algorithm to sort those pairs
	let nodes = {};
	let done = false;
	while (!done) {
	    done = true
	    for (let i = 0; i < binding.length; i++) {
		var current = binding[i];
		var p = current.xLabel.value;
		var q = current.yLabel.value;
		if (!nodes.hasOwnProperty(p)) {
		    nodes[p] = 0;
		}
		if (!nodes.hasOwnProperty(q)) {
		    nodes[q] = 0;
		}
		if (nodes[q] < nodes[p] + 1) {
		    nodes[q] = nodes[p] + 1
		    done = false;
		}
	    }
	}
	
	
	let navHistoryList = [];
	
	Object.keys(nodes).forEach(function(key) {
	    var value = nodes[key];
	    var temp = {};
	    temp.order = value;
	    temp.name = key;
	    navHistoryList.push(temp);
	})
	navHistoryList = navHistoryList.sort((a, b) => {
	    if (a.order < b.order) {
		return -1;
	    }
	});
	for (let i = 0; i < navHistoryList.length; i++) {
	    navHistoryList[i] = navHistoryList[i].name + "\nboltz:" + nameToQnumber[navHistoryList[i].name];
	}

	// Return the new history list
	return navHistoryList;	
    }    

    

    /**
     * 1. Clear/Delete existing nav history BUTTONS
     * 2. Initialize new nav history BUTTONS according to a new
     *    navHistoryList
     *
     * @param {object} cy: cytoscape object
     * @param {dictionary} toolKit: our dictionary with all our graph tools
     **/

    initNavHistory(cy, toolKit) {

	// Tool aliases
	displayResources = toolKit['displayResources'];
	hierarchyPathTool = toolKit['hierachyPathTool'];
	subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
	graphVipsualizerTool = toolKit['graphVisualizerTool'];

	// Function body
	$('.nav-history-button').remove(); // remove all buttons
	const reversedNavList = displayResources.navHistoryList.slice().reverse();
	for (let i = 0; i < reversedNavList.length; i++) {
	    //label is "Pittsburgh\nboltz:Q1342"
	    let label = reversedNavList[i];
	    let btn1 = $(`<button class="nav-history-button" value = "${i}">${label.split("\nboltz")[0]} ◀</button>`);
	    // Don't animate arrow if button is the last one
	    if (i === reversedNavList.length - 1) {
		btn1 = $(`<button class="nav-history-button selected" value = "${i}">${label.split("\nboltz")[0]}</button>`);
	    }

	    // Here we use jQuery to add the line of code to our HTML header
	    $("#nav-history").append(btn1);

	    /* Turn on listening of button clicks
	       i.e., we navigate to it in the graph
	     */

	    btn1.on ('click', function(e) {
		try {
		    navigateTo(cy, label, toolKit);
		} catch (e) {
		    console.error(e);
		}
	    });

	}
    }




    /**
     * 
     * Updates hierarchy path tool (navHistory) with respect to
     * the arguments given:
     *
     * @param {dictionary} toolKit: our dictionary with all our graph tools
     **/
    
    updateNavHistory(toolKit) {
	// Tool aliases
	displayResources = toolKit['displayResources'];

	// Function body
	let currentConceptName = displayResources.currentLabel.split("\nboltz:")[0];
	
	$('.nav-history-button.selected').removeClass('selected');
	$('.nav-history-button').filter( function() {
            let currentText = $(this).text();
            // important: the name check for nav history are hard coded here
            // if the name for them changed, here should be changed
            return  currentText === currentConceptName ||
		currentText === (currentConceptName + " ◀");
	}).addClass("selected");	
    }

}


// Displays the local subgraph of the current concept top right of the HTML
class SubGraphNavigatorTool {
	
    /**
     * 1. Reset nav tool buttons to be empty
     * 2. Initialize nav tools according to navHistoryList
     * 
     * @param {object} cy: cytoscape object
     * @param {dictionary} toolKit: our dictionary with all our graph tools
     **/

    initNavTools(cy, toolKit) {
	
	// Tool aliases
	displayResources = toolKit['displayResources'];
	hierarchyPathTool = toolKit['hierachyPathTool'];
	subGraphNavigatorTool = toolKit['subGraphNavigatorTool'];    
	graphVipsualizerTool = toolKit['graphVisualizerTool'];

	// Function body
	
	// 1. Reset nav tools to be empty
	this.resetNavTools();
	
	//2. Initialize nav tools according to navHistoryList
	$(".nav-button").on('click', function(e){
	     //navigate nodes
	     let label = $(this).attr("value");
	     if (label !== undefined && label !== "") {
		 try {
		     navigateTo(cy, label, toolKit);
		 } catch (e) {
		     console.error(e);
		 }
	     }
	 });

	 const reversedNavList = displayResources.navHistoryList.slice().reverse();
	 let length = reversedNavList.length;
	 if (length > 0) {
	     var navMid = reversedNavList[length - 1];
	     $("#nav-up").addClass("clickable");
	     $("#nav-mid").attr("value", navMid);
	     $("#nav-mid").text(navMid.split("\nboltz")[0]);

	     if (length > 1) {
		 var navUp = reversedNavList[length - 2];
		 var navUpHTML = "<span>" + navUp.split("\nboltz:")[0] + "<span><br><span>▲</span>";
		 $("#nav-up").attr("value", navUp);
		 $("#nav-up").append(navUpHTML);
	     }
	 }
    }

    
    /**
     * 
     * Update the nav tools buttons
     * 1. delete those labels appeared in labelsToBeRemoved in childrenTable
     * 2. reset nav tools to be empty
     * 3. find text (name such as Pittsburgh) and value (label such as
     *    Pittsburgh\nboltz:Q1342, used for searching in graph) and set
     *    to the right buttons (see the buttons template
     *    in terryDemoCola.html with id=nav-tool)
     * 
     * @param {string} parentLabel: label for the parent node of the newly
     *                              selected node
     * @param {dictionary} toolKit: our dictionary with all our graph tools 
     * @param {list} labelsToBeRemoved: list of labels removed in cytoscape
                     graph, need to be removed in childrenTable as well.
                     Empty as default		     
    **/
    
    updateNavTools(parentLabel, toolKit, labelsToBeRemoved=[]) {
	// Tool aliases
	displayResources = toolKit['displayResources'];

	// Function body
	
	/* _1_ */
	// when close nodes, remove nodes in children table
	for (let i = 0; i < labelsToBeRemoved.length; i++) {
	    displayResources.deleteFromChildrenTable(labelsToBeRemoved[i]);
	}
	// label is the one with Q number while region is the region name
	// e.g. label = Pittsburgh\nboltz:Q1342, region = Pittsburgh
	let prevLabel = $("#nav-mid").attr("value");
	let prevRegion = $("#nav-mid").text();
	
	displayResources.update('currentLabel', displayResources.currentNode.json().data.label);

	let currentConceptName = displayResources.currentLabel.split("\nboltz:")[0];

	/* _2_ */
	this.resetNavTools();


	/* _3_ */
	if (parentLabel === undefined || parentLabel === "") {
	    parentLabel = getParentLabel(displayResources.currentLabel, displayResources.childrenTable);
	}
	if (parentLabel !== undefined && parentLabel !== "") {
	    let siblings = displayResources.childrenTable[parentLabel];
	    if(!siblings.includes(displayResources.currentLabel)) {
		siblings.push(displayResources.currentLabel);
		siblings.sort();
	    }
	    
	    // set PARENT to nav-up btn
	    let navUpHTML = "<span>" + parentLabel.split("\nboltz:")[0] + "<span><br><span>▲</span>";
	    $("#nav-up").attr("value", parentLabel);
	    $("#nav-up").append(navUpHTML);
	    $("#nav-up").addClass("clickable");

	    
	    let index = siblings.indexOf(displayResources.currentLabel);
	    // set SIBLINGS to nav-left & nav-right btns if there's any
	    // also show ellipsis if there are more than one left or right siblings 
	    if (index > 0) {
		$("#nav-left").attr("value", siblings[index - 1]);
		$("#nav-left").text(siblings[index - 1].split("\nboltz:")[0] + " ◀");
		$("#nav-left").addClass("clickable");
	    }
	    if (index > 1) {
		$("#left-ellipsis").addClass("visible");
	    }
	    if (index + 1 < siblings.length) {
		$("#nav-right").attr("value", siblings[index + 1]);
		$("#nav-right").text("▶ " + siblings[index + 1].split("\nboltz:")[0]);
		$("#nav-right").addClass("clickable");
	    }
	    if (index + 2 < siblings.length) {
		$("#right-ellipsis").addClass("visible");
	    }
	}
	
	// set nav-mid to be the current region
	$("#nav-mid").attr("value", displayResources.currentLabel);
	$("#nav-mid").text(currentConceptName);

	let children = getChildrenLabel(displayResources.currentLabel, displayResources.childrenTable);
	let index = -1;
	if (children.includes(prevLabel)) {
	    index = children.indexOf(prevLabel);
	}

	index = -1;
	if (children.includes(prevLabel)) {
	    index = children.indexOf(prevLabel);
	}

	if (index !== -1) {
	    // if we are navigating from a child to parent
	    // make the child be in nav-down btn and fill nav-down-left
	    // and nav-down-right be its siblings
	    // also show ellipsis if there are more than one left or right siblings
	    let navDownHTML = "<span>▼</span><br><span>" + prevRegion + "<span>";
	    $("#nav-down").attr("value", prevLabel);
	    $("#nav-down").append(navDownHTML);
	    $("#nav-down").addClass("clickable");
	    if (index - 1 >= 0) {
		let navDownLeftHTML = "<span>◣</span><br>" + children[index-1].split("\nboltz:")[0] + "<span>";
		$("#nav-down-left").attr("value", children[index-1]);
		$("#nav-down-left").append(navDownLeftHTML);
		$("#nav-down-left").addClass("clickable");
	    }
	    if (index - 1 >= 1) {
		$("#down-left-ellipsis").addClass("visible");
	    }
	    if (index + 1 < children.length) {
		let navDownRightHTML = "<span>◢</span><br>" + children[index+1].split("\nboltz:")[0] + "<span>";
		$("#nav-down-right").attr("value", children[index+1]);
		$("#nav-down-right").append(navDownRightHTML);
		$("#nav-down-right").addClass("clickable");
	    }
	    if (index + 1 < children.length - 1) {
		$("#down-right-ellipsis").addClass("visible");
	    }
	} else {
	    // otherwise, set the first child (if any) in nav-down btn and second
	    // child (if any) in nav-down-right btn
	    // also show ellipsis if there are more than one left or right siblings 
	    if (children.length > 0) {
		let navDownHTML = "<span>▼</span><br><span>" + children[0].split("\nboltz:")[0] + "<span>";
		$("#nav-down").attr("value", children[0]);
		$("#nav-down").append(navDownHTML);
		$("#nav-down").addClass("clickable");
	    }
	    if (children.length > 1) {
		let navDownRightHTML = "<span>◢</span><br>" + children[1].split("\nboltz:")[0] + "<span>";
		$("#nav-down-right").attr("value", children[1]);
		$("#nav-down-right").append(navDownRightHTML);
		$("#nav-down-right").addClass("clickable");
	    }
	    if (children.length > 2) {
		$("#down-right-ellipsis").addClass("visible");
	    }
	}
    }          

    /**
     *
     * Reset nav tool buttons to be empty
     *
     **/
    resetNavTools () {
	$(".nav-button").attr("value", "");
	$(".nav-button").text("");
	$(".clickable").removeClass("clickable");
	$(".visible").removeClass("visible");
    }
    
}



/* This class will be defined depending on the type of graph (non-generic)*/
class GraphVisualizerTool { /* calls expert, which could be animal or city*/

    /* should include expansion of nodes: how you do that expansion is domain specific. When graph visualizer tool handles a mouse click, will have to call expert to do the layout of the expansion for it*/

    /*Add as methods node-dealing functions*/

    
    /* ---------------- GRAPH STYLING FUNCTIONS ---------------------*/
    /* --------------- (only depend on each other) ------------------*/

    /**
     * 
     * relayout the whole graph with cola
     * 
     * @param {cytoscape object} cy: the cytoscape object
     * @param {dictionary} toolKit: our dictionary with all our graph tools
     **/
    
    reLayoutCola(cy, toolKit) { /*this function belongs to city expert visualizer*/
	// Tool aliases
	displayResources = toolKit['displayResources'];
	
	// Function body	
	var layout = cy.layout({
            name: 'cola',
            avoidOverlap: false,
            edgeLength: 500,
            nodeSpacing: 100,
            nodeDimensionsIncludeLabels: true,
            centerGraph:true,
            numIter: 100000,
            alignment: {vertical: []// displayResources.vertAlignments
			, horizontal: []// displayResources.horizAlignments
		       }, // used to determine explicitly if nodes are related vertically/horizontally
            gapInequalities: []// displayResources.nodeRelationships
	    , // used to relatively establish the particular relationship between two nodes
            handleDisconnected: false,
            animate: false,
	});
	layout.start();
}

    
    /**
     * 
     * style the image node width and height according to its image cache
     * 
     * @param {*} imgCache: the imgCache in cy object, can be retrived by
                            cy._private.renderer.imageCache
     * @param {node} ele: the node to be styled
     * @param {cytoscape object} cy: the cytoscape object
     *
     **/
    
    styleImageSize(imgCache, ele, cy) {
	const url = ele.json().data.label;
	const img = imgCache[url].image;
	var imageWidth = img.naturalWidth;
	var imageHeight = img.naturalHeight;
	const maxH = 600;
	const maxW = 600;
	if(imageWidth > maxW) {
            imageWidth = maxW;
            imageHeight = (img.naturalHeight / img.naturalWidth) * imageWidth;
	} else if(imageHeight > maxH) {
            imageHeight = maxW;
            imageWidth = (img.naturalWidth / img.naturalHeight) * imageHeight;
	}
	cy.nodes(`[id = "${ele.id()}"]`).style({
            'width':imageWidth,
            'height':imageHeight,
	});
    }
    
    
    /**
     * 
     * find all image nodes and style their dimensions
     * 
     * @param {cytoscape object} cy: the cytoscape object
     *
     **/
    
    adjustImageSize(cy) {

	/* Here we have to capture our object 'this' in a constant,
	   because the scope of 'this' won't work inside the
	   function d3.json(...).then(function(...){ ... })*/
	let vizTool = this;
	cy.nodes().forEach(function(ele){
            if (ele.json().data.class === 'image' ||
		ele.json().data.class === 'flagImage' ||
		ele.json().data.class === 'imageMap') {

		const url = ele.json().data.label;
		let imgCache = cy._private.renderer.imageCache;
		if (imgCache === undefined || imgCache[url] === undefined) {
		    ele.on('background', function(evt) {
			imgCache = cy._private.renderer.imageCache;
			// graphVisualizerTool
			    vizTool.styleImageSize(imgCache, ele, cy);
		    });
		} else {
		    // graphVisualizerTool.
			vizTool.styleImageSize(imgCache, ele, cy);
		}
            }
	});
    }
    
}
