
// initial positions of grabbed nodes
// used to achieve dragging nodes in group
var initialPositions = {};

// initial positions for images
// used to restore image to the previous position after zooming in and dragging
var prevImagePositions = {};


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
    if(node.json().data.class === 'qudt') {
        if(!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
            const sourceCityName = cy.$('#' + node.json().data.sourceID).json().data.label.split("\nboltz:")[0];
            if(bnodeExpansionDataCache.hasOwnProperty(node.id())) {
                expandbNode(cy, node.id(), bnodeExpansionDataCache[node.id()]);
            } else {
                const url = propertyQuery(sourceCityName, true);
                d3.json(url).then(function(data) {var jsonData = getDataJSON(data); if(jsonData == undefined) return; expandbNode(cy, node.id(), jsonData[1]);});
            }
            cy.$("#" + node.id()).addClass('readyToCollapse');
        } else {
            closebNode(cy, node.id());
            cy.$("#" + node.id()).removeClass('readyToCollapse');
        }
    } else if(node.json().data.class === 'dummyConcept') {
        const id = conceptNodeLabelToID[node.json().data.label];
        if(id !== undefined) {
            cy.center("#" + id);
        }
    } else if(node.json().data.class === 'concept') {
        const cityName = node.json().data.label.split("\nboltz")[0];
        if(!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
            if(conceptExpansionDataCache.hasOwnProperty(node.id())) {
                expandConceptNode(cy, node.id(), conceptExpansionDataCache[node.id()]);
            } else {
                const url = propertyQuery(cityName, true);
                d3.json(url).then(function(data) {var jsonData = getDataJSON(data); if(jsonData == undefined) return; expandConceptNode(cy, node.id(), jsonData[0]);});
            }
            cy.$("#" + node.id()).addClass('readyToCollapse');
        } else {
            cy.$("#" + node.id()).removeClass('readyToCollapse');
            closeConceptNode(cy, node.id());
        }
    } else if(node.json().data.class === 'image' || node.json().data.class === 'flagImage' || node.json().data.class === 'imageMap') {
        if(!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
            prevImagePositions.x = node.position('x');
            prevImagePositions.y = node.position('y');
            cy.nodes(`[id = "${node.id()}"]`).style({
                'width': node.width() * 10,
                'height': node.height() * 10,
                'z-index': '20',
            });
            cy.$("#" + node.id()).addClass('readyToCollapse');
        } else if(node.json().data.class === 'imageMap' && node.json().data.type === 'State') {
            addCounty(evt, cy);
        } else if(node.json().data.class === 'imageMap' &&  node.json().data.type === 'Region') {
            addState(evt, cy);
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
    if(node.json().data.class === 'dummyConcept') {
        cy.nodes(`[id = "${node.id()}"]`).style({
            'width': node.width() * 1.25,
            'height': node.height() * 1.25
        });
        const id = conceptNodeLabelToID[node.json().data.label];
        if(id !== undefined) {
            cy.nodes(`[id = "${id}"]`).style({
                'width': cy.$('#'+id).width() * 0.8,
                'height': cy.$('#'+id).height() * 0.8
            });
            if(cy.$("#" + id).json().data.class === 'greenConcept') {
                cy.$("#"+id).json({data:{class:'concept'}});
            }
        }
        const currlabel = node.json().data.label;
        cy.nodes().forEach(function( ele ){
            if(ele.json().data.label === currlabel && (ele.json().data.class === 'concept')) {
                ele.json({data:{class:'dummyConcept'}});
                cy.nodes(`[id = "${ele.id()}"]`).style({
                    "background-color": '#FFFFFF',
                    "border-color": '#ADD8E6',
                });
            }
        });
        node.json({data:{class:'concept'}});
        cy.nodes(`[id = "${node.id()}"]`).style({
            "background-color": '#ADD8E6',
            "border-color": '#00008B',
        });
        conceptNodeLabelToID[node.json().data.label] = node.id();

        if(id !== undefined) {
            if(cy.$("#" + id).hasClass('readyToCollapse')) {
                closeConceptNode(cy, id);
                cy.$("#" + id).removeClass('readyToCollapse');
            }
        }
    } else if(node.json().data.class === "imageMap") {
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
    if(node.json().data.class === 'qudt' || node.json().data.class === 'concept') {
    cy.nodes(`[id = "${node.id()}"]`).style({
        'width': node.width() * 1.25,
        'height': node.height() * 1.25
    });
    } else if(node.json().data.class === 'dummyConcept') {
        const id = conceptNodeLabelToID[node.json().data.label];
        if(id !== undefined) {
            cy.nodes(`[id = "${conceptNodeLabelToID[node.json().data.label]}"]`).style({
                'width': cy.$('#'+id).width() * 1.25,
                'height': cy.$('#'+id).height() * 1.25,
            });
            if(cy.$("#" + id).json().data.class === 'concept') {
            cy.$("#"+id).json({data:{class:'greenConcept'}});
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
    if(node.json().data.class === 'qudt' || node.json().data.class === 'concept') {
    cy.nodes(`[id = "${node.id()}"]`).style({
        'width': node.width() * 0.8,
        'height': node.height() * 0.8
    });
    } else if(node.json().data.class === 'dummyConcept') {
    const id = conceptNodeLabelToID[node.json().data.label];
    if(id !== undefined) {
        cy.nodes(`[id = "${id}"]`).style({
        'width': cy.$('#'+id).width() * 0.8,
        'height': cy.$('#'+id).height() * 0.8,
        });
        if(cy.$("#" + id).json().data.class === 'greenConcept') {
            cy.$("#"+id).json({data:{class:'concept'}});
            cy.nodes(`[id = "${id}"]`).style({
                "background-color": '#ADD8E6',
                "border-color": '#00008B'
            });
        }
    }
    } 
    else if(node.json().data.class === 'image' || node.json().data.class === 'flagImage' || node.json().data.class === 'imageMap') {
    if(cy.$("#" + node.id()).hasClass('readyToCollapse')) {
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
        if(node.json().data.class === 'imageMap') {
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
    connectedNodes.forEach(function(node){
      if(node.id() !== grabbedNode.id()){
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
    connectedNodes.forEach(function(node){
    if(node.id() !== draggedNode.id() && node.outgoers().length == 0){
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