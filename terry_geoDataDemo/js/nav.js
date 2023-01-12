// the path from searched node label to the root following path kgo:locatedInAdministrativeRegion Note: the label string contains Q value: e.g. Pittsburgh\nboltz:Q1342
// this reflects parent children relations e.g. Pittsburgh -> Allegheny -> Pennsylvania -> Northeastern Region -> USA -> North America
// Note again strings in navHistoryList are labels containing Q numbers e.g. Pittsburgh\nboltz:Q1342, not Pittsburgh
var navHistoryList = [];
// parent children pairs where parent is  label string and children is list of label string. e.g. {"'Pennsylvania\nboltz:Q1400': ['Allegheny\boltz:Q156291']"} Note: the label string contains Q value: e.g. Pittsburgh\nboltz:Q1342
var childrenTable = {};

/**
 * 
 * if the current node is not ready to collapse, expand the node and set it to be current node, which is done within function addConceptNode
 * otherwise just set it to be current if it's already expanded
 * 
 * @param {cytoscape object} cy     the cytoscape object
 * @param {node} node current node
 */
function expandHelper(cy, node) {
    const cityName = node.json().data.label.split("\nboltz")[0];
    if(!node.hasClass('readyToCollapse')) {
        if(conceptExpansionDataCache.hasOwnProperty(node.id())) {
            expandConceptNode(cy, node.id(), conceptExpansionDataCache[node.id()]);
        } else {
            const url = propertyQuery(cityName, true);
            d3.json(url).then(function(data) {var jsonData = getDataJSON(data); if(jsonData == undefined) return; expandConceptNode(cy, node.id(), jsonData[0]);});
        }
        cy.$("#" + node.id()).addClass('readyToCollapse');
    } else {
      setAsCurrentNode(cy, node.id());
    }
}

/**
 * 
 * add a link with label = link coming out from prevNoode links
 * to target node with label = label 
 * 
 * @param {cytoscape object} cy     the cytoscape object
 * @param {string} label the label of newly added node
 * @param {node} prevNode the node to which the new edge and node will be added
 * * @param {string} link the label of edge to be added
 * @returns 
 */
function addNodeHelper(cy, label, prevNode, link) {
    var addedData = [];
    var key = link;
    var value = label;
    // node info
    var tempNode = {"data":{}};
    // tempNode.data.type = "County"; ?  cannot determine type
    tempNode.group = "nodes";
    tempNode.data.label = value;
    tempNode.data.class = classifyclass(key, value);
    tempNode.data.id = convertToNodeID(prevNode.id(), key, value);
    tempNode.data.sourceID = prevNode.id();
    if(tempNode.data.class == "concept") {
        if(!conceptNodeLabelToID.hasOwnProperty(value)) {
            conceptNodeLabelToID[value] = tempNode.data.id;
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
    var tempEdge = {"data":{}}
    tempEdge.group = "edges";
    tempEdge.data.id = convertToEdgeID(prevNode.id(), key, value)
    tempEdge.data.label = key;
    tempEdge.data.source = prevNode.id();
    tempEdge.data.target = tempNode.data.id;
    addedData.push(tempEdge);

    cy.add(addedData);
    reLayoutCola(cy);
    return cy.$("#"+tempNode.data.id)
}

/**
 * 
 * navigate the node with label=label
 * if the node is already in graph, expand it, update it to be current node, and update nav his & hav tool
 * otherwise navigate it through a link to the root. the default is "locatedInAdministrativeRegion"
 * 
 * @param {cytoscape object} cy     the cytoscape object
 * @param {string} label the label of the node to be navigated to 
 * @returns 
 */
function navigateTo(cy, label) {
    var node = searchConceptByLabel(cy, label);
    if(node !== undefined) {
        expandHelper(cy, node);
        return;
    }
    navigateThrough(cy, label);
}

/**
 * 
 * navigate through link and add link as edges and target nodes, default link is "locatedInAdministrativeRegion"
 * 
 * @param {cytoscape object} cy     the cytoscape object
 * @param {string} label the label of the start node in the navigation
 * @param {string} link the link to be navigated through
 */
function navigateThrough(cy, label, link="locatedInAdministrativeRegion") {
    var currNode = searchConceptByLabel(cy, navHistoryList[0]);
    // follow the link "locatedInAdministrativeRegion" to the last node
    while(true) {
        //outgoers include both edges and nodes
        var outgoers = currNode.outgoers();
        for(let i = 0; i < outgoers.length; i++) {
            var outgoer = outgoers[i];
            if(outgoer.json().group === "edges" && outgoer.json().data.label === link) {
                currNode = outgoer.target();
                continue;
            }
        }
        break;
    }
    var start = 0;
    var end = 0;
    for(let i = 0; i < navHistoryList.length; i++) {
        if(navHistoryList[i] === currNode.json().data.label) {
            start = i + 1;
            continue;
        } 
        if(navHistoryList[i] === label) {
            end = i + 1;
            break;
        }
    }

    // follow thel link "locatedInAdministrativeRegion" from the curr node 
    // add new link and nodes until the node with label = name is added
    for(let i = start; i < end; i++) {
        var label = navHistoryList[i];
        currNode = addNodeHelper(cy, label, currNode, link);
    }
    expandHelper(cy, currNode);
}

// append nav history buttons in div whose id = nav-history
// according to the navList
/**
 * 
 * first clear existing nav history buttons
 * then initialize the navHistory buttons according to navHistoryList and make the leaf selected e.g. Pittsburgh be selected
 * 
 * @param {cytoscape object} cy     the cytoscape object
 */
function initNavHistory(cy) {
    $('.nav-history-button').remove();
    var reversedNavList = navHistoryList.slice().reverse();
    for(let i = 0; i < reversedNavList.length; i++) {
      var label = reversedNavList[i];
      var btn1 = $(`<button class="nav-history-button" value = "${i}">${label.split("\nboltz")[0]} ◀</button>`);
      if(i === reversedNavList.length - 1) {
        btn1 = $(`<button class="nav-history-button selected" value = "${i}">${label.split("\nboltz")[0]}</button>`);
      }
      $("#nav-history").append(btn1);
      (function(btn1, label) {
        btn1.on('click', function(e) {
          //navigate nodes
          try { 
            navigateTo(cy, label);
          } catch (e) {
            console.error(e);
          }
        });
      })(btn1, label);
    }
 }

 /**
  * 
  * first reset nav tool buttons to be empty
  * then initialize nav tools according to navHistoryList 
  * 
  * @param {cytoscape object} cy     the cytoscape object
  */
 function initNavTools(cy) {
  resetNavTools();
  $(".nav-button").on('click', function(e){
    //navigate nodes
    var label = $(this).attr("value");
    if(label !== undefined && label !== "") {
      try { 
        navigateTo(cy, label);
      } catch (e) {
        console.error(e);
      }
    }
  });
    var reversedNavList = navHistoryList.slice().reverse();
    var n = reversedNavList.length;
    if(n > 0) {
      var navMid = reversedNavList[n - 1];
      $("#nav-up").addClass("clickable");
      $("#nav-mid").attr("value", navMid);
      $("#nav-mid").text(navMid.split("\nboltz")[0]);
      if(n > 1) {
        var navUp = reversedNavList[n - 2];
        var navUpHTML = "<span>" + navUp.split("\nboltz:")[0] + "<span><br><span>▲</span>";
        $("#nav-up").attr("value", navUp);
        $("#nav-up").append(navUpHTML);
      }
    }
 }

 // start from the first place, get the navigation list
 /**
  * 
  * using data queried from server to generate nav history list
  * 
  * @param {JSON} data data fetched from server
  * @returns 
  */
 function setRankedNavHistoryList(data) {
    var binding = data.results.bindings;
    if(binding.length === 0) {
      console.log(11);
        navHistoryList = [];
        return;
    }
    // construct mapping from name to Qnumber
    var nameToQnumber = {};
    for(let i = 0; i < binding.length; i++) {
        var curr = binding[i];
        nameToQnumber[curr.xLabel.value] = curr.x.value.split("/data/")[1];
        nameToQnumber[curr.yLabel.value] = curr.y.value.split("/data/")[1];
    }
    // algorithm to sort those pairs
    var nodes = {};
    var done = false;
    while(!done) {
      done = true
      for(let i = 0; i < binding.length; i++) {
        var curr = binding[i];
        var p = curr.xLabel.value;
        var q = curr.yLabel.value;
        if(!nodes.hasOwnProperty(p)) {
          nodes[p] = 0;
        }
        if(!nodes.hasOwnProperty(q)) {
          nodes[q] = 0;
        }
        if(nodes[q] < nodes[p] + 1) {
          nodes[q] = nodes[p] + 1
          done = false;
        }
      }
    }
    
    navHistoryList = [];
    
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
    for(let i = 0; i < navHistoryList.length; i++) {
      navHistoryList[i] = navHistoryList[i].name + "\nboltz:" + nameToQnumber[navHistoryList[i].name];
    }
  }

  // get the url to navigation list query
  /**
   * 
   * get the url for generating nav history list pairs
   * 
   * @param {string} value the name for region to be queries. e.g. Pittsburgh
   * @returns the url for query
   */
  function navHistoryListQuery(value) {
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
          ?Q kgo:locatedInAdministrativeRegion* ?x.
          ?x kgo:locatedInAdministrativeRegion ?y.
          ?x rdfs:label|skos:prefLabel ?xLabel.
          ?y rdfs:label|skos:prefLabel ?yLabel.
        }`; 

      const url = endpoint + "?query=" + encodeURIComponent(query);
      return url;
  }

  /**
   * 
   * initialize the nav history and nav tools buttons with starting value
   * 
   * @param {cytoscape object} cy     the cytoscape object
   * @param {string} value the starting region e.g. Pittsburgh
   */
  function initNav(cy, value) {
    const navListPairsUrl = navHistoryListQuery(value, true);
    d3.json(navListPairsUrl).then(function(data) {childrenTable = {}; setRankedNavHistoryList(data); updateChildrenTable(); initNavHistory(cy); initNavTools(cy);});
  }

  /**
   * 
   * update both nav history and nav tools buttons
   * 
   * @param {cytoscape object} cy     the cytoscape object
   * @param {*} parentLabel 
   * @param {*} labelsToBeRemoved list of labels removed in cytoscape graph, need to be removed in childrenTable as well. Empty as default
   */
  function updateNav(cy, parentLabel, labelsToBeRemoved=[]) {
    currLabel = currentNode.json().data.label;
    var currRegion = currLabel.split("\nboltz:")[0];
    if(navHistoryList.includes(currLabel)) {
      // update nav history
      $('.nav-history-button.selected').removeClass('selected');
      $('.nav-history-button').filter(function() {
          var currText = $(this).text();
          // important: the name check for nav history are hard coded here
          // if the name for them changed, here should be changed
          return  currText === currRegion || currText === (currRegion + " ◀");
      }).addClass("selected");
      // update nav tool
      updateNavTools(parentLabel);
    } else {
      const navListPairsUrl = navHistoryListQuery(currRegion, true);
      d3.json(navListPairsUrl).then(function(data) {setRankedNavHistoryList(data); updateChildrenTable(); initNavHistory(cy); updateNavTools(parentLabel, labelsToBeRemoved)});
    }
  }

  /**
   * 
   * update the nav tools buttons
   * 1. delete those labels appeared in labelsToBeRemoved in childrenTable
   * 2. reset nav tools to be empty
   * 3. find text (name such as Pittsburgh) and value (label such as Pittsburgh\nboltz:Q1342, used for searching in graph) and set
   * to the right buttons (see the buttons template in terryDemoCola.html with id=nav-tool)
   * 
   * @param {string} parentLabel label for the parent node of the newly selected node
   * @param {*} labelsToBeRemoved list of labels removed in cytoscape graph, need to be removed in childrenTable as well. Empty as default
   */
  function updateNavTools(parentLabel, labelsToBeRemoved=[]) {
    // when close nodes, remove nodes in children table
    for(let i = 0; i < labelsToBeRemoved.length; i++) {
      deleteFromChildrenTable(labelsToBeRemoved[i]);
    }
    // label is the one with Q number while region is the region name
    // e.g. label = Pittsburgh\nboltz:Q1342, region = Pittsburgh
    var prevLabel = $("#nav-mid").attr("value");
    var prevRegion = $("#nav-mid").text();
    
    currLabel = currentNode.json().data.label;
    var currRegion = currLabel.split("\nboltz:")[0];
    resetNavTools();
    
    if(parentLabel === undefined || parentLabel === "") {
      parentLabel = getParentLabel(currLabel);
    }
    if(parentLabel !== undefined && parentLabel !== "") {
      var siblings = childrenTable[parentLabel];
      if(!siblings.includes(currLabel)) {
        siblings.push(currLabel);
        siblings.sort();
      }
      // set parent to nav-up btn
      var navUpHTML = "<span>" + parentLabel.split("\nboltz:")[0] + "<span><br><span>▲</span>";
      $("#nav-up").attr("value", parentLabel);
      $("#nav-up").append(navUpHTML);
      $("#nav-up").addClass("clickable");
      var index = siblings.indexOf(currLabel);
      // set siblings to nav-left & nav-right btns if there's any
      // also show ellipsis if there are more than one left or right siblings 
      if(index > 0) {
        $("#nav-left").attr("value", siblings[index - 1]);
        $("#nav-left").text(siblings[index - 1].split("\nboltz:")[0] + " ◀");
        $("#nav-left").addClass("clickable");
      }
      if(index > 1) {
        $("#left-ellipsis").addClass("visible");
      }
      if(index + 1 < siblings.length) {
        $("#nav-right").attr("value", siblings[index + 1]);
        $("#nav-right").text("▶ " + siblings[index + 1].split("\nboltz:")[0]);
        $("#nav-right").addClass("clickable");
      }
      if(index + 2 < siblings.length) {
        $("#right-ellipsis").addClass("visible");
      }
    }
    
    // set nav-mid to be the current region
    $("#nav-mid").attr("value", currLabel);
    $("#nav-mid").text(currRegion);
    
    var children = getChildrenLabel(currLabel);
    var index = -1;
    if(children.includes(prevLabel)) {
      index = children.indexOf(prevLabel);
    }
    var index = -1;
    if(children.includes(prevLabel)) {
      index = children.indexOf(prevLabel);
    }

    if(index !== -1) {
      // if we are navigating from a child to parent
      // make the child be in nav-down btn and fill nav-down-left
      // and nav-down-right be its siblings
      // also show ellipsis if there are more than one left or right siblings 
      var navDownHTML = "<span>▼</span><br><span>" + prevRegion + "<span>";
      $("#nav-down").attr("value", prevLabel);
      $("#nav-down").append(navDownHTML);
      $("#nav-down").addClass("clickable");
      if(index - 1 >= 0) {
        var navDownLeftHTML = "<span>◣</span><br>" + children[index-1].split("\nboltz:")[0] + "<span>";
        $("#nav-down-left").attr("value", children[index-1]);
        $("#nav-down-left").append(navDownLeftHTML);
        $("#nav-down-left").addClass("clickable");
      }
      if(index - 1 >= 1) {
        $("#down-left-ellipsis").addClass("visible");
      }
      if(index + 1 < children.length) {
        var navDownRightHTML = "<span>◢</span><br>" + children[index+1].split("\nboltz:")[0] + "<span>";
        $("#nav-down-right").attr("value", children[index+1]);
        $("#nav-down-right").append(navDownRightHTML);
        $("#nav-down-right").addClass("clickable");
      }
      if(index + 1 < children.length - 1) {
        $("#down-right-ellipsis").addClass("visible");
      }
    } else {
      // otherwise, set the first child (if any) in nav-down btn and second
      // child (if any) in nav-down-right btn
      // also show ellipsis if there are more than one left or right siblings 
      if(children.length > 0) {
        var navDownHTML = "<span>▼</span><br><span>" + children[0].split("\nboltz:")[0] + "<span>";
        $("#nav-down").attr("value", children[0]);
        $("#nav-down").append(navDownHTML);
        $("#nav-down").addClass("clickable");
      }
      if(children.length > 1) {
        var navDownRightHTML = "<span>◢</span><br>" + children[1].split("\nboltz:")[0] + "<span>";
        $("#nav-down-right").attr("value", children[1]);
        $("#nav-down-right").append(navDownRightHTML);
        $("#nav-down-right").addClass("clickable");
      }
      if(children.length > 2) {
        $("#down-right-ellipsis").addClass("visible");
      }
    }
  }

  /**
   * 
   * updateChildrenTable according to new navHistoryList
   * 
   */
  function updateChildrenTable() {
    for(let i = 0; i < navHistoryList.length; i++) {
      var curr = navHistoryList[i];
      if(i === 0) {
        if(childrenTable.hasOwnProperty(curr)) {
          continue;
        }
        childrenTable[curr] = [];
      } else {
        var child = navHistoryList[i - 1];
        if(childrenTable.hasOwnProperty(curr)) {
          var siblings = childrenTable[curr];
          if(!siblings.includes(child)) {
            siblings.push(child);
            siblings.sort();
          } 
          continue;
        }
        childrenTable[curr] = [child];
      }
    }
  }

  /**
   * 
   * get the label of parent node of the node whose label=label
   * 
   * @param {string} label label for the node whose parent to be get
   * @returns label of parent node
   */
  function getParentLabel(label) {
    var parent = undefined;
    for(var key in childrenTable){
      var siblings = childrenTable[key];
      if(siblings.includes(label)) {
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
  function getChildrenLabel(label) {
    if(childrenTable.hasOwnProperty(label)) {
      return childrenTable[label];
    }
    return [];
  }


  /**
   * 
   * delete any occurance of label=label in childrenTable if its not in the updated navHistoryList
   * 
   * @param {string} label label for the node to be deleted in childrenTable
   * @returns 
   */
  function deleteFromChildrenTable(label) {
    if(navHistoryList.includes(label)) {
      return;
    }
    if(childrenTable.hasOwnProperty(label)) {
      delete childrenTable[label];
    }
    for(var key in childrenTable){
      var siblings = childrenTable[key];
      if(siblings.includes(label)) {
        var id = siblings.indexOf(label);
        siblings.splice(id, 1);
      }
    };
  }

  /**
   * reset the nav tools buttons to be empty
   */
  function resetNavTools() {
    $(".nav-button").attr("value", "");
    $(".nav-button").text("");
    $(".clickable").removeClass("clickable");
    $(".visible").removeClass("visible");
  }