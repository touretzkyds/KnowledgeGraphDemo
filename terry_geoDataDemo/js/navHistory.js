var navList = [];
var childrenTable = {};

// expand the node and set it to be current node
// or just set it to be current if it's already expanded
function expandHelper(cy, node) {
    const cityName = node.json().data.label.split("\nboltz")[0];
    if(!node.hasClass('readyToCollapse')) {
        if(conceptExpansionDataCache.hasOwnProperty(node.id())) {
            addConceptNode(cy, node.id(), conceptExpansionDataCache[node.id()]);
        } else {
            const url = propertyQuery(cityName, true);
            d3.json(url).then(function(data) {var jsonData = getDataJSON(data); if(jsonData == undefined) return; addConceptNode(cy, node.id(), jsonData[0]);});
        }
        cy.$("#" + node.id()).addClass('readyToCollapse');
    } else {
      setAsCurrentNode(cy, node.id());
    }
}

// add a link "locatedInAdministrativeRegion" and target node with label = label
// connecting to prevNode
function addNodeHelper(cy, label, prevNode) {
    var addedData = [];
    var key = "locatedInAdministrativeRegion";
    var value = label;
    var tempNode = {"data":{}};
    // tempNode.data.type = "County"; ? 
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

function navigateTo(cy, name) {
  console.log("name", name);
    var node = searchConceptByLabel(cy, name);
    if(node !== undefined) {
      console.log("not undefined");
        expandHelper(cy, node);
        return;
    }
    navigateThrough(cy, name);
}

function navigateThrough(cy, name) {
    var currNode = searchConceptByLabel(cy, navList[0]);
    // follow the link "locatedInAdministrativeRegion" to the last node
    while(true) {
        //outgoers include both edges and nodes
        var outgoers = currNode.outgoers();
        for(let i = 0; i < outgoers.length; i++) {
            var outgoer = outgoers[i];
            if(outgoer.json().group === "edges" && outgoer.json().data.label === "locatedInAdministrativeRegion") {
                currNode = outgoer.target();
                continue;
            }
        }
        break;
    }
    var start = 0;
    var end = 0;
    for(let i = 0; i < navList.length; i++) {
        if(navList[i] === currNode.json().data.label) {
            start = i + 1;
            continue;
        } 
        if(navList[i] === name) {
            end = i + 1;
            break;
        }
    }

    // follow thel link "locatedInAdministrativeRegion" from the curr node 
    // add new link and nodes until the node with label = name is added
    for(let i = start; i < end; i++) {
        var label = navList[i];
        currNode = addNodeHelper(cy, label, currNode);
    }
    expandHelper(cy, currNode);
}

// append nav history buttons in div whose id = nav-history
// according to the navList
function setNavHistory(cy) {
    $('.nav-history-button').remove();
    var reversedNavList = navList.slice().reverse();
    for(let i = 0; i < reversedNavList.length; i++) {
      var name = reversedNavList[i];
      var btn1 = $(`<button class="nav-history-button" value = "${i}">${name.split("\nboltz")[0]} ◀</button>`);
      if(i === reversedNavList.length - 1) {
        btn1 = $(`<button class="nav-history-button selected" value = "${i}">${name.split("\nboltz")[0]}</button>`);
      }
      $("#nav-history").append(btn1);
      (function(btn1, name) {
        btn1.on('click', function(e) {
          //navigate nodes
          try { 
            navigateTo(cy, name);
          } catch (e) {
            console.error(e);
          }
        });
      })(btn1, name);
    }
 }

 function setNavTools(cy) {
  resetNavTools();
  $(".nav-button").on('click', function(e){
    //navigate nodes
    var name = $(this).attr("value");
    if(name !== undefined && name !== "") {
      try { 
        navigateTo(cy, name);
      } catch (e) {
        console.error(e);
      }
    }
  });
    var reversedNavList = navList.slice().reverse();
    var n = reversedNavList.length;
    if(n > 1) {
      var navUp = reversedNavList[n - 2];
      var navUpHTML = "<span>" + navUp.split("\nboltz:")[0] + "<span><br><span>▲</span>";
      $("#nav-up").attr("value", navUp);
      $("#nav-up").append(navUpHTML);
      if(n > 0) {
        var navMid = reversedNavList[n - 1];
        $("#nav-up").addClass("clickable");
        $("#nav-mid").attr("value", navMid);
        $("#nav-mid").text(navMid.split("\nboltz")[0]);
      }
    }
 }

 // start from the first place, get the navigation list
 function setRankedNavList(data, value) {
    var binding = data.results.bindings;
    if(binding.length === 0) {
        navList = [];
        return;
    }
    // construct mapping from name to Qnumber
    var nameToQnumber = {};
    for(let i = 0; i < binding.length; i++) {
        var curr = binding[i];
        nameToQnumber[curr.xLabel.value] = curr.x.value.split("/data/")[1];
        nameToQnumber[curr.yLabel.value] = curr.y.value.split("/data/")[1];
    }
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
    
    navList = [];
    
    Object.keys(nodes).forEach(function(key) {
      var value = nodes[key];
      var temp = {};
      temp.order = value;
      temp.name = key;
      navList.push(temp);
    })
    navList = navList.sort((a, b) => {
      if (a.order < b.order) {
        return -1;
      }
    });
    for(let i = 0; i < navList.length; i++) {
      navList[i] = navList[i].name + "\nboltz:" + nameToQnumber[navList[i].name];
    }
  }

  // get the url to navigation list query
  function navListQuery(value) {
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

  // set nav history and nav tools buttons, value is the start city
  function setNav(cy, value) {
    const navListPairsUrl = navListQuery(value, true);
    d3.json(navListPairsUrl).then(function(data) {setRankedNavList(data, value); updateChildrenTable(); setNavHistory(cy); setNavTools(cy);});
  }

  // update the nav history buttons and nav tools
  function updateNav(cy, parentLabel, labelsToBeRemoved=[]) {
    currLabel = currentNode.json().data.label;
    var currRegion = currLabel.split("\nboltz:")[0];
    if(navList.includes(currLabel)) {
      // update nav history
      $('.nav-history-button.selected').removeClass('selected');
      $('.nav-history-button').filter(function() {
          var currText = $(this).text();
          // important: the name check for nav history and 
          // nav tools are hard coded here
          // if the name for them changed, here should be changed
          return  currText === currRegion || currText === (currRegion + " ◀");
      }).addClass("selected");
      updateNavTools(parentLabel);
    } else {
      const navListPairsUrl = navListQuery(currRegion, true);
      d3.json(navListPairsUrl).then(function(data) {setRankedNavList(data, currRegion); updateChildrenTable(); setNavHistory(cy); updateNavTools(parentLabel, labelsToBeRemoved)});
    }
  }

  function updateNavTools(parentLabel, labelsToBeRemoved=[]) {
    // when close nodes, remove nodes in children table
    for(let i = 0; i < labelsToBeRemoved.length; i++) {
      deleteFromChildrenTable(labelsToBeRemoved[i]);
    }

    var prevLabel = $("#nav-mid").attr("value");
    var prevRegion = $("#nav-mid").text();
    
    currLabel = currentNode.json().data.label;
    var currRegion = currLabel.split("\nboltz:")[0];
    resetNavTools();
    
    if(parentLabel === undefined || parentLabel === "") {
      parentLabel = getParent(currLabel);
    }
    if(parentLabel !== undefined && parentLabel !== "") {
      var siblings = childrenTable[parentLabel];
      if(!siblings.includes(currLabel)) {
        siblings.push(currLabel);
        siblings.sort();
      }
      var navUpHTML = "<span>" + parentLabel.split("\nboltz:")[0] + "<span><br><span>▲</span>";
      $("#nav-up").attr("value", parentLabel);
      $("#nav-up").append(navUpHTML);
      $("#nav-up").addClass("clickable");
      var index = siblings.indexOf(currLabel);
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
    
    $("#nav-mid").attr("value", currLabel);
    $("#nav-mid").text(currRegion);
    
    var children = getChildren(currLabel);
    console.log("currLabel", currLabel);
    console.log("prevLabel", prevLabel);
    console.log("children", children);
    var index = -1;
    if(children.includes(prevLabel)) {
      index = children.indexOf(prevLabel);
    }
    var index = -1;
    if(children.includes(prevLabel)) {
      index = children.indexOf(prevLabel);
    }
    // if we are going from a child to parent
    if(index !== -1) {
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

  function updateChildrenTable() {
    for(let i = 0; i < navList.length; i++) {
      var curr = navList[i];
      if(i === 0) {
        if(childrenTable.hasOwnProperty(curr)) {
          continue;
        }
        childrenTable[curr] = [];
      } else {
        var child = navList[i - 1];
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

  function getParent(p) {
    var parent = undefined;
    for(var key in childrenTable){
      var siblings = childrenTable[key];
      if(siblings.includes(p)) {
        parent = key;
      }
    };
    return parent;
  }

  function getChildren(p) {
    if(childrenTable.hasOwnProperty(p)) {
      return childrenTable[p];
    }
    return [];
  }

  function deleteFromChildrenTable(p) {
    if(navList.includes(p)) {
      return;
    }
    if(childrenTable.hasOwnProperty(p)) {
      delete childrenTable[p];
    }
    for(var key in childrenTable){
      var siblings = childrenTable[key];
      if(siblings.includes(p)) {
        var id = siblings.indexOf(p);
        siblings.splice(id, 1);
      }
    };
  }

  function resetNavTools() {
    $(".nav-button").attr("value", "");
    $(".nav-button").text("");
    $(".clickable").removeClass("clickable");
    $(".visible").removeClass("visible");
  }