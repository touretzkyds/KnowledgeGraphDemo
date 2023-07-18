
// initial positions of grabbed nodes
// used to achieve dragging nodes in group
var initialPositions = {};

// initial positions for images
// used to restore image to the previous position after zooming in and dragging
var prevImagePositions = {};

// for clicking ontological nodes, todo update from demo2e ver
function display_ranks(id, rank, position) {
  let url = all_ranks_query();
  var taxonomic_rank_nodes = [];
  var taxonomic_rank_edges = [];

  var rank_name = rank.replace('prop ', '')
  // Goal is to create the nodes out of this json_result
  d3.json(url).then(function(json_result) {
    var data = json_result.results.bindings;
    // Prepare to sort the list
    var ranks_to_object = {}
    var ranks_and_nexthigher = data.map(function(object) {
      let rank = object.rank.value.replace('http://solid.boltz.cs.cmu.edu:3030/data/', '');
      let nextHigher = null;
      if ('nextHigher' in object) {
        nextHigher = object.nextHigher.value.toString().replace('http://solid.boltz.cs.cmu.edu:3030/data/', '');
      }
      ranks_to_object[rank] = object;
      return ([rank, nextHigher]);
    })
    // Sorting function: returns array, where key (rank qval) and value (the order in the hierarchy)
    var nodes = {};
    let done = false;
    while (! done) {
      done = true;
      ranks_and_nexthigher.forEach(p => {
        var rank = p[0];
        var nextHigher = p[1];
        if (nextHigher != null) {
          if (!(Object.keys(nodes).includes(rank))) {
            nodes[rank] = 0;
            nodes[nextHigher] = 0;
          }
          if (nodes[rank] < nodes[nextHigher] + 1) {
            nodes[rank] = nodes[nextHigher] + 1;
            done = false;
        }}
      }
      )
    }
    // Create final array, ordered in the correct rank hierarchy.
    var length = Object.keys(nodes).length;
    var ordered_rank_hierarchy = Array.from(Array(length).keys());
    for (var rank_key in nodes) {
      let rank_index = nodes[rank_key]
      ordered_rank_hierarchy[rank_index] = rank_key
    }
    // Goal: automate this process, for all nodes, call a query that returns all of its properties. You make the node with the properties expandable. 
    for (rank_qval of ordered_rank_hierarchy) {
      var rank_object = ranks_to_object[rank_qval];

      var name = rank_object['rankLabel']['value'];
      qvals_to_names[rank_qval] = name;
      names_to_qvals[name] = rank_qval;
      // Create node object to push onto graph
      var node_obj = {
        group: 'nodes',
        data:
          {id: rank_qval, 
          name:`${name} boltz:${rank_qval}`,
          color: '#90EE90', 
          width: 150, 
          height: 150,
          label: name,
          type: 'display',
          clickable: "true",
          isExpandable: "true",
          parent: rank,
          },
        position: {x: position['x'], y: position['y']},
        };
      cy.add(node_obj);
      taxonomic_rank_nodes.push({node: cy.$id(rank_qval), offset: 0});

      // Connecting edge for all concepts
      if ('nextHigher' in rank_object){
        var nextHigher_qval = rank_object.nextHigher.value.toString().replace('http://solid.boltz.cs.cmu.edu:3030/data/', '');
        connecting_edge = {
          group: 'edges',
          data:
            {id: `${rank_qval} to ${nextHigher_qval}`, 
            source: rank_qval, 
            target: nextHigher_qval,
            type: 'hierarchy: up',
            label: '',
            },
        }
        taxonomic_rank_edges.push(connecting_edge);
      }
      if ('nextLower' in rank_object){
        var nextLower_qval = rank_object.nextLower.value.toString().replace('http://solid.boltz.cs.cmu.edu:3030/data/', '');
        connecting_edge = {
          group: 'edges',
          data:
            {id: `${rank_qval} to ${nextLower_qval}`, 
            source: rank_qval, 
            target: nextLower_qval,
            type: 'hierarchy: down',
            label: '',
            },
        }
        taxonomic_rank_edges.push(connecting_edge)
      }
    }
    // Manipulations to graph
    cy.add(taxonomic_rank_edges);

    // Change rank layout to cola 
    var rank_layout = cy.nodes(`[type = 'display']`).layout({
      name: 'cola',
      edgeLength: 200,
      avoidOverlap: true,
      nodeSpacing: 180,
      nodeDimensionsIncludeLabels: true,
      alignment: {vertical: [taxonomic_rank_nodes]},
      flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
      handleDisconnected: false,
      centerGraph: false,
      fit: false,
    })
    rank_layout.run();
    // Default view is collapsed view
    api.collapseAll();
});
}


/**
 * 
 * when left clicking on a node
 * 1. if it's qudt, if it's not ready to collapse, exnpande it; otherwise close it. In either case toggle the class 'readyToCollapse'
 * 2. if it's dummyConcept, recenter to the corresponding real node
 * 3. if it's concept, if it's not ready to collapse, exnpande it; otherwise close it. In either case toggle the class 'readyToCollapse'
 * 4. if it's image, and it does not have class 'readyToCollapse', store previous position, enlarge it by factor 10 and add class 'readyToCollapse',
 * this class will be removed when mouseout. If the image is imageMap, add the clicked county
 * 
 * @param {event} evt the left click event
 * @param {cytoscape object} cy the cytoscape object
 */
function tap(evt, cy) {
  var node = evt.target;
  if (node.json().data.class === 'qudt') {
    if (!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
      const sourceNodeName = cy.$('#' + node.json().data.sourceID).json().data.label.split("\nboltz:")[0];
      if (bnodeExpansionDataCache.hasOwnProperty(node.id())) {
        expandbNode(cy, node.id(), bnodeExpansionDataCache[node.id()]);
      } else {
        const url = propertyQuery(sourceNodeName, true);
        d3.json(url).then(function (data) { var jsonData = getDataJSON(data); if (jsonData == undefined) return; expandbNode(cy, node.id(), jsonData[1]); });
      }
      cy.$("#" + node.id()).addClass('readyToCollapse');
    } else {
      closebNode(cy, node.id());
      cy.$("#" + node.id()).removeClass('readyToCollapse');
    }
  } else if (node.json().data.class === 'dummyConcept') {
    const id = conceptNodeLabelToID[node.json().data.label];
    if (id !== undefined) {
      cy.center("#" + id);
    }
  } else if (node.json().data.class === 'concept') {
    console.log('tap on concept');
    const nodeName = node.json().data.label.split("\nboltz")[0];
    console.log('node name:', nodeName);
    console.log('node id:', node.id());
    if (!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
      if (conceptExpansionDataCache.hasOwnProperty(node.id())) {
        expandConceptNode(cy, node.id(), conceptExpansionDataCache[node.id()]);
      } else {
        const url = propertyQuery(nodeName, true);
        d3.json(url).then(function (data) { var jsonData = getDataJSON(data); if (jsonData == undefined) return; expandConceptNode(cy, node.id(), jsonData[0]); });
      }
      cy.$("#" + node.id()).addClass('readyToCollapse');
    } else {
      cy.$("#" + node.id()).removeClass('readyToCollapse');
      closeConceptNode(cy, node.id());
    }
  } else if (node.json().data.class === 'image' || node.json().data.class === 'flagImage' || node.json().data.class === 'imageMap') {
    if (!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
      prevImagePositions.x = node.position('x');
      prevImagePositions.y = node.position('y');
      cy.nodes(`[id = "${node.id()}"]`).style({
        'width': node.width() * 10,
        'height': node.height() * 10,
        'z-index': '20',
      });
      cy.$("#" + node.id()).addClass('readyToCollapse');
    } else if (node.json().data.class === 'imageMap') {
      // get relation pointing to image map
      var edgeLabel = node.connectedEdges().json().data.label;
      if (node.json().data.type === 'Country' && edgeLabel === 'hasRegionsImageMap') {
        addRegionFromCountry(evt, cy);
      } else if (node.json().data.type === 'Country' && edgeLabel === 'hasStatesImageMap') {
        addStateFromCountry(evt, cy);
      } else if (node.json().data.type === 'Region' && edgeLabel === 'hasStatesImageMap') {
        addStateFromRegion(evt, cy);
      } else if (node.json().data.type === 'State' && edgeLabel === 'hasCountiesImageMap') {
        addCountyFromState(evt, cy);
      } else {
        console.log('tap on image map:', node.json().data.type, edgeLabel);
      }
    }
  }
}

/**
 * 
 * when right clicking on a node, only has effects on dummyConcept
 * will change it to be the corresponding real node which is expandable,
 * adjust size and color and make the original real node be dummy node,
 * and update global variable conceptNodeLabelToID
 * 
 * @param {event} evt the right click event
 * @param {cytoscape object} cy the cytoscape object
 */
function cxttap(evt, cy) {
  var node = evt.target;
  if (node.json().data.class === 'dummyConcept') {
    cy.nodes(`[id = "${node.id()}"]`).style({
      'width': node.width() * 1.25,
      'height': node.height() * 1.25
    });
    const id = conceptNodeLabelToID[node.json().data.label];
    if (id !== undefined) {
      cy.nodes(`[id = "${id}"]`).style({
        'width': cy.$('#' + id).width() * 0.8,
        'height': cy.$('#' + id).height() * 0.8
      });
      if (cy.$("#" + id).json().data.class === 'greenConcept') {
        cy.$("#" + id).json({ data: { class: 'concept' } });
      }
    }
    const currlabel = node.json().data.label;
    cy.nodes().forEach(function (ele) {
      if (ele.json().data.label === currlabel && (ele.json().data.class === 'concept')) {
        ele.json({ data: { class: 'dummyConcept' } });
        cy.nodes(`[id = "${ele.id()}"]`).style({
          "background-color": '#FFFFFF',
          "border-color": '#ADD8E6',
        });
      }
    });
    console.log("in event.js ", node.id());
    node.json({ data: { class: 'concept' } });
    cy.nodes(`[id = "${node.id()}"]`).style({
      "background-color": '#ADD8E6',
      "border-color": '#00008B',
    });
    conceptNodeLabelToID[node.json().data.label] = node.id();

    if (id !== undefined) {
      if (cy.$("#" + id).hasClass('readyToCollapse')) {
        closeConceptNode(cy, id);
        cy.$("#" + id).removeClass('readyToCollapse');
      }
    }
  } else if (node.json().data.class === "imageMap") {
    // use this to see the normalized position
    var p = getNormalizedPositions(evt);
    console.log("x", p.x, "y", p.y);
  }
}

/**
 * 
 * when mousing over a node
 * 1. if it's qudt or concept, enlarge in to 125% of its original size
 * 2. if it's dummyConcept, expand the corresponding real enlarge to 125% of its original size,
 * set its type to greenConcept, and set its color to green
 * 
 * @param {event} evt the mouseover event
 * @param {cytoscape object} cy the cytoscape object
 */
function mouseover(evt, cy) {
  var node = evt.target;
  if (node.json().data.class === 'qudt' || node.json().data.class === 'concept') {
    cy.nodes(`[id = "${node.id()}"]`).style({
      'width': node.width() * 1.25,
      'height': node.height() * 1.25
    });
  } else if (node.json().data.class === 'dummyConcept') {
    const id = conceptNodeLabelToID[node.json().data.label];
    if (id !== undefined) {
      cy.nodes(`[id = "${conceptNodeLabelToID[node.json().data.label]}"]`).style({
        'width': cy.$('#' + id).width() * 1.25,
        'height': cy.$('#' + id).height() * 1.25,
      });
      if (cy.$("#" + id).json().data.class === 'concept') {
        cy.$("#" + id).json({ data: { class: 'greenConcept' } });
        cy.nodes(`[id = "${id}"]`).style({
          "background-color": '#00FF00',
        });
      }
    }
  }
}

/**
 * 
 * when mousing out a node:
 * 1. if it's qudt or concept, shrink to 80% of its original size
 * 2. if it's dummyConcept, shrink the corresponding real node to 80% of its original size
 * reset its type back to concept, and reset its color to blue
 * 3. if it's images, shrink to 10% of its original size and go back to previous position stored in 
 * global variable prevImagePositions. Remove class 'readyToCollapse' and relayout
 * 
 * @param {event} evt the mouseout event
 * @param {cytoscape object} cy the cytoscape object
 */
function mouseout(evt, cy) {
  var node = evt.target;
  if (node.json().data.class === 'qudt' || node.json().data.class === 'concept') {
    cy.nodes(`[id = "${node.id()}"]`).style({
      'width': node.width() * 0.8,
      'height': node.height() * 0.8
    });
  } else if (node.json().data.class === 'dummyConcept') {
    const id = conceptNodeLabelToID[node.json().data.label];
    if (id !== undefined) {
      cy.nodes(`[id = "${id}"]`).style({
        'width': cy.$('#' + id).width() * 0.8,
        'height': cy.$('#' + id).height() * 0.8,
      });
      if (cy.$("#" + id).json().data.class === 'greenConcept') {
        cy.$("#" + id).json({ data: { class: 'concept' } });
        cy.nodes(`[id = "${id}"]`).style({
          "background-color": '#ADD8E6',
          "border-color": '#00008B'
        });
      }
    }
  }
  else if (node.json().data.class === 'image' || node.json().data.class === 'flagImage' || node.json().data.class === 'imageMap') {
    if (cy.$("#" + node.id()).hasClass('readyToCollapse')) {
      cy.nodes(`[id = "${node.id()}"]`).style({
        'width': node.width() * 0.1,
        'height': node.height() * 0.1,
        'z-index': '10',
      });
      node.position({
        x: prevImagePositions.x,
        y: prevImagePositions.y
      });
      cy.$("#" + node.id()).removeClass('readyToCollapse');
      if (node.json().data.class === 'imageMap') {
        reLayoutCola(cy);
      }
    }
  }
}

/**
 * 
 * when grabbing a node, store its positions and neighbors positions to global variable initialPositions
 * 
 * @param {event} evt the grab event
 */
function grab(evt) {
  var grabbedNode = evt.target;
  initialPositions[grabbedNode.id()] = {
    x: grabbedNode.position('x'),
    y: grabbedNode.position('y')
  };
  var connectedNodes = grabbedNode.neighborhood();
  connectedNodes.forEach(function (node) {
    if (node.id() !== grabbedNode.id()) {
      initialPositions[node.id()] = {
        x: node.position('x'),
        y: node.position('y')
      };
    }
  });
}

/**
 * 
 * when dragging a node, move its neighbors who has zero outgoers to move together
 * 
 * @param {event} evt the drag event
 */
function drag(evt) {
  var draggedNode = evt.target;
  var connectedNodes = draggedNode.neighborhood();
  connectedNodes.forEach(function (node) {
    if (node.id() !== draggedNode.id() && node.outgoers().length == 0) {
      var dx = draggedNode.position('x') - initialPositions[draggedNode.id()].x;
      var dy = draggedNode.position('y') - initialPositions[draggedNode.id()].y;
      var newX = dx + initialPositions[node.id()].x;
      var newY = dy + initialPositions[node.id()].y;
      node.position({
        x: newX,
        y: newY
      });
    }
  });
}