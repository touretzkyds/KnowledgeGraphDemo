// function happens after tap event
function tap(evt, cy) {
    var node = evt.target;
    if(node.json().data.class === 'qudt') {
        if(!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
            const sourceCityName = cy.$('#' + node.json().data.sourceID).json().data.label.split("\nboltz:")[0];
            if(bnodeExpansionDataCache.hasOwnProperty(node.id())) {
                addbNode(cy, node.id(), bnodeExpansionDataCache[node.id()]);
            } else {
                const url = propertyQuery(sourceCityName, true);
                d3.json(url).then(function(data) {var jsonData = getDataJSON(data); if(jsonData == undefined) return; addbNode(cy, node.id(), jsonData[1]);});
            }
            cy.$("#" + node.id()).addClass('readyToCollapse');
        } else {
            removebNode(cy, node.id());
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
                addConceptNode(cy, node.id(), conceptExpansionDataCache[node.id()]);
            } else {
                const url = propertyQuery(cityName, true);
                d3.json(url).then(function(data) {var jsonData = getDataJSON(data); if(jsonData == undefined) return; addConceptNode(cy, node.id(), jsonData[0]);});
            }
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
            cy.nodes(`[id = "${node.id()}"]`).style({
                "background-color": 'red'
            });
            cy.$("#" + node.id()).addClass('readyToCollapse');
        } else {
            const style = cy.$('#'+node.id()).style();
            if (style['background-color'] === "rgb(255,0,0)") {
                cy.nodes().forEach(function( ele ){
                    if(ele.json().data.class === 'concept') {
                        cy.nodes(`[id = "${ele.id()}"]`).style({
                            "background-color": '#ADD8E6',
                            "border-color": '#00008B'
                        });
                    }
                });
                const sourceID = node.json().data.sourceID;
                cy.nodes(`[id = "${sourceID}"]`).style({
                    "background-color": 'red'
                });
            }
            cy.$("#" + node.id()).removeClass('readyToCollapse');
            removeConceptNode(cy, node.id());
        }
    } else if(node.json().data.class === 'image' || node.json().data.class === 'countyImage') {
        if(!cy.$("#" + node.id()).hasClass('readyToCollapse')) {
            prevImagePositions.x = node.position('x');
            prevImagePositions.y = node.position('y');
            cy.nodes(`[id = "${node.id()}"]`).style({
                'width': node.width() * 10,
                'height': node.height() * 10,
                'z-index': '20',
            });
            cy.$("#" + node.id()).addClass('readyToCollapse');
        } else if(node.json().data.class === 'countyImage') {
            addCounties(evt, cy);
        }
    }
}
// function happens after cxttap event
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
                removeConceptNode(cy, id);
                cy.$("#" + id).removeClass('readyToCollapse');
            }
        }
    }
}

// function happens after mouseover event
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

// function happens after mouseout event
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
    else if(node.json().data.class === 'image' || node.json().data.class === 'countyImage') {
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
        if(node.json().data.class === 'countyImage') {
        reLayoutCola(cy);
        }
    }
    }
}

// function happens after grab event
function grab(evt) {
    var draggedNode = evt.target;
    initialPositions[draggedNode.id()] = {
      x: draggedNode.position('x'),
      y: draggedNode.position('y')
    };
    var connectedNodes = draggedNode.neighborhood();
    connectedNodes.forEach(function(node){
      if(node.id() !== draggedNode.id()){
        initialPositions[node.id()] = {
          x: node.position('x'),
          y: node.position('y')
        };
      }
    });
}

// function happens after drag event
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