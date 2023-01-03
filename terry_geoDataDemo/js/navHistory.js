
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
        setAsCurrent(cy, node.id());
    }
}

function addNodeHelper(cy, label, prevNode) {
    //add this node and expand
    //need to find Q # / type
    var addedData = [];
    var key = "locatedInAdministrativeRegion";
    var value = label;
    var tempNode = {"data":{}};
    // tempNode.data.type = "County";
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

function navigateTo(cy, name, navList) {
    var node = searchConceptByLabel(cy, name);
    console.log("name", name);
    if(node !== undefined) {
        expandHelper(cy, node);
        return;
    }
    navigateThrough(cy, name, navList);
}

function navigateThrough(cy, name, navList) {
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

function navigateTo2(cy, name, navList) {
    var prevNode = searchByLabel(cy, navList[0]);
    if(prevNode === undefined) {
        throw new Error('prevNode is undefined!');
    }
    for(let i = 1; i < navList.length; i++) {
        var label = navList[i];
        var node = searchByLabel(cy, label);
        if(node === undefined) {
            //add this node and expand
            //need to find Q # / type
            var addedData = [];
            var key = "locatedInAdministrativeRegion";
            var value = label;
            var tempNode = {"data":{}};
            // tempNode.data.type = "County";
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
            prevNode = cy.$("#"+tempNode.data.id);
            reLayoutCola(cy);
        } else {
            prevNode = node;
            if(label === name) {
                if(!node.hasClass('readyToCollapse')) {
                    if(conceptExpansionDataCache.hasOwnProperty(node.id())) {
                        addConceptNode(cy, node.id(), conceptExpansionDataCache[node.id()]);
                    } else {
                        const url = propertyQuery(name, true);
                        d3.json(url).then(function(data) {var jsonData = getDataJSON(data); if(jsonData == undefined) return; addConceptNode(cy, node.id(), jsonData[0]);});
                    }
                    cy.$("#" + node.id()).addClass('readyToCollapse');
                } else {
                    setAsCurrent(cy, node.id());
                }
                break;
            };
        }
    };
}

// append nav history buttons in div whose id = nav-history
// according to the navList
function appendNavButtons(cy, navList) {
    for(let i = 0; i < navList.length; i++) {
      var name = navList[i];
      var btn = $(`<button class="nav-button">${name.split("\nboltz")[0]} ◀</button>`);
      if(i == navList.length - 1) {
        btn = $(`<button class="nav-button selected">${name.split("\nboltz")[0]}</button>`);
      }
      $("#nav-history").append(btn);
      (function(btn, name) {
        btn.on('click', function(e) {
          $('.nav-button.selected').removeClass('selected');
          if(!btn.hasClass("selected")) {
            btn.addClass("selected")
          }
          //TODO: add node function here
          try { 
            navigateTo(cy, name, navList.slice().reverse());
          } catch (e) {
            console.error(e);
          }
        });
      })(btn, name);
    }
 }

 // start from the first place, get the navigation list
 function getRankedNavList(data) {
    const binding = data.results.bindings;
    if(binding.length === 0) {
        return [];
    }
    // construct mapping from name to Qnumber
    var nameToQnumber = {};
    for(let i = 0; i < binding.length; i++) {
        var curr = binding[i];
        nameToQnumber[curr.xLabel.value] = curr.x.value.split("/data/")[1];
        nameToQnumber[curr.yLabel.value] = curr.y.value.split("/data/")[1];
    }
    var nodes = {}
    var done = false
    while(!done) {
      done = true
      for(let i = 0; i < binding.length; i++) {
        var curr = binding[i];
        var p = curr.xLabel.value;
        var q = curr.yLabel.value;
        if(!nodes.hasOwnProperty(p)) {
          nodes[p] = 0;
          nodes[q] = 0;
        }
        if(nodes[q] < nodes[p] + 1) {
          nodes[q] = nodes[p] + 1
          done = false
        }
      }
    }
    var navList = [];
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
    }).reverse();
    for(let i = 0; i < navList.length; i++) {
      navList[i] = navList[i].name + "\nboltz:" + nameToQnumber[navList[i].name];
    }
    console.log(navList);
    return navList;
  }


  // get the url to navigation list query
  function navListQuery(value, perform_query) {
    const prevquery = document.getElementById("sparql");
  prevquery.innerHTML = 
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
        ?Q kgo:locatedInAdministrativeRegion* ?y.
        ?x kgo:locatedInAdministrativeRegion ?y.
        ?x rdfs:label|skos:prefLabel ?xLabel.
        ?y rdfs:label|skos:prefLabel ?yLabel.
      }`; 

      
      if (perform_query) {
      const endpoint = d3.select("#endpoint").property("value")
      const sparql = d3.select("#sparql").property("value")
      const url = endpoint + "?query=" + encodeURIComponent(sparql)
      return url
      } else {
      return false
      }
  }

  // set nav history buttons
  function setNavHistoryButtons(cy, value) {
    const navListPairsUrl = navListQuery(value, true);
    d3.json(navListPairsUrl).then(function(data) {appendNavButtons(cy, getRankedNavList(data))});
  }