
/**
 * 
 * mapping from state name to its county map positions
 * county map positions contains normalized center coordinate (as percentage of whole imgae) and county name
 * e.g. {"x":0.1308, "y":0.1724, "countyName":"Erie\nboltz:Q488679"} means the center of Erie county in the 
 * county map image is 13.08% to the left and 17.24% to the top
 * 
 */
const countyData = {
    "Pennsylvania":[{"x":0.1308, "y":0.1724, "countyName":"Erie\nboltz:Q488679"}, {"x":0.1228, "y":0.2795, "countyName":"Crawford\nboltz:Q494086"}, {"x":0.0971, "y":0.3996, "countyName": "Mercer\nboltz:Q497216"}, {"x":0.0826, "y":0.4989, "countyName":"Lawrence\nboltz:Q501256"}, {"x": 0.0794, "y":0.6034, "countyName": "Beaver\nboltz:Q494104"}, {"x": 0.0875, "y": 0.7549, "countyName": "Washington\nboltz:Q497200"}, {"x": 0.0923, "y": 0.8803, "countyName": "Greene\nboltz:Q494098"}, {"x": 0.2497, "y": 0.2404, "countyName": "Warren\nboltz:Q495662"}, {"x": 0.1726, "y": 0.3762, "countyName": "Venango\nboltz:Q494241"}, {"x": 0.1485, "y": 0.5250, "countyName": "Butler\nboltz:Q488672"}, {"x": 0.1357, "y": 0.6713, "countyName": "Allegheny\nboltz:Q156291"}, {"x": 0.2546, "y": 0.3265, "countyName": "Forest\nboltz:Q494236"}, {"x": 0.2224, "y": 0.4441, "countyName": "Clarion\nboltz:Q494198"}, {"x": 0.2160, "y": 0.5694, "countyName": "Armstrong\nboltz:Q494186"}, {"x": 0.2176, "y": 0.7366, "countyName": "Westmoreland\nboltz:Q495645"}, {"x": 0.1822, "y": 0.8698, "countyName": "Fayette\nboltz:Q488683"}, {"x": 0.3558, "y": 0.2404, "countyName": "Mckean\nboltz:Q495640"}, {"x": 0.3429, "y": 0.3657, "countyName": "Elk\nboltz:Q494254"}, {"x": 0.2883, "y": 0.4649, "countyName": "Jefferson\nboltz:Q494156"}, {"x": 0.2754, "y": 0.6217, "countyName": "Indiana\nboltz:Q494146"}, {"x": 0.4152, "y": 0.3631, "countyName": "Cameron\nboltz:Q494142"}, {"x": 0.3686, "y": 0.5068, "countyName": "Clearfield\nboltz:Q494233"}, {"x": 0.3269, "y": 0.6739, "countyName": "Cambria\nboltz:Q490077"}, {"x": 0.2819, "y": 0.8489, "countyName": "Somerset\nboltz:Q490908"}, {"x": 0.4586, "y": 0.2691, "countyName": "Potter\nboltz:Q501340"}, {"x": 0.4988, "y": 0.4284, "countyName": "Clinton\nboltz:Q494093"}, {"x": 0.4731, "y": 0.5355, "countyName": "Centre\nboltz:Q494248"}, {"x": 0.3895, "y": 0.6739, "countyName": "Blair\nboltz:Q494152"}, {"x": 0.3654, "y": 0.8437, "countyName": "Bedford\nboltz:Q494174"}, {"x": 0.4377, "y": 0.6922, "countyName": "Huntingdon\nboltz:Q494077"}, {"x": 0.4249, "y": 0.8620, "countyName": "Fulton\nboltz:Q494211"}, {"x": 0.5534, "y": 0.2560, "countyName": "Tioga\nboltz:Q495613"}, {"x": 0.5903, "y": 0.3924, "countyName": "Lycoming\nboltz:Q495633"}, {"x": 0.5887, "y": 0.5135, "countyName": "Union\nboltz:Q501248"}, {"x": 0.5049, "y": 0.6321, "countyName": "Mifflin\nboltz:Q494161"}, {"x": 0.5344, "y": 0.6599, "countyName": "Juniata\nboltz:Q501270"}, {"x": 0.5903, "y": 0.5816, "countyName": "Snyder\nboltz:Q495595"}, {"x": 0.5624, "y": 0.7027, "countyName": "Perry\nboltz:Q501298"}, {"x": 0.5624, "y": 0.7810, "countyName": "Cumberland\nboltz:Q494134"}, {"x": 0.5655, "y": 0.8819, "countyName": "Adams\nboltz:Q351865"}, {"x": 0.6725, "y": 0.2436, "countyName": "Bradford\nboltz:Q488687"}, {"x": 0.6710, "y": 0.3596, "countyName": "Sullivan\nboltz:Q501306"}, {"x": 0.6486, "y": 0.4918, "countyName": "Montour\nboltz:Q495687"}, {"x": 0.6896, "y": 0.4865, "countyName": "Columbia\nboltz:Q488693"}, {"x": 0.6454, "y": 0.5649, "countyName": "Northumberland\nboltz:Q494164"}, {"x": 0.6293, "y": 0.7043, "countyName": "Dauphin\nboltz:Q488690"}, {"x": 0.6414, "y": 0.8610, "countyName": "York\nboltz:Q490914"}, {"x": 0.7200, "y": 0.6024, "countyName": "Schuylkill\nboltz:Q494207"}, {"x": 0.6820, "y": 0.7139, "countyName": "Lebanon\nboltz:Q781165"}, {"x": 0.7200, "y": 0.8229, "countyName": "Lancaster\nboltz:Q142369"}, {"x": 0.7795, "y": 0.2334, "countyName": "Susquehanna\nboltz:Q495603"}, {"x": 0.7460, "y": 0.3349, "countyName": "Wyoming\nboltz:Q495677"}, {"x": 0.7551, "y": 0.4439, "countyName": "Luzerne\nboltz:Q501292"}, {"x": 0.7947, "y": 0.5306, "countyName": "Carbon\nboltz:Q488698"}, {"x": 0.8160, "y": 0.6297, "countyName": "Lehigh\nboltz:Q494117"}, {"x": 0.7672, "y": 0.6965, "countyName": "Berks\nboltz:Q490920"}, {"x": 0.7962, "y": 0.8402, "countyName": "Chester\nboltz:Q27840"}, {"x": 0.8099, "y": 0.3622, "countyName": "Lackawanna\nboltz:Q501350"}, {"x": 0.8557, "y": 0.7634, "countyName": "Montgomery\nboltz:Q378527"}, {"x": 0.8496, "y": 0.8575, "countyName": "Delaware\nboltz:Q27844"}, {"x": 0.8602, "y": 0.2854, "countyName": "Wayne\nboltz:Q494167"}, {"x": 0.8983, "y": 0.3894, "countyName": "Pike\nboltz:Q495649"}, {"x": 0.8557, "y": 0.4786, "countyName": "Monroe\nboltz:Q495588"}, {"x": 0.8557, "y": 0.5851, "countyName": "Northampton\nboltz:Q495658"}, {"x": 0.8938, "y": 0.7238, "countyName": "Bucks\nboltz:Q494192"}, {"x": 0.8877, "y": 0.8228, "countyName": "Philadelphia\nboltz:Q496900"}]
}

/**
 * 
 * calculate the distance between (x1, y1), (x2, y2)
 * 
 * @param {number} x1 x coordinate for point 1
 * @param {number} y1 y coordinate for point 1
 * @param {number} x2 x coordinate for point 2
 * @param {number} y2 y coordinate for point 2
 * @returns 
 */
function distanceBetween(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x2-x1), 2)+Math.pow((y2-y1),2));
}

/**
 * 
 * when use click on the county map image, get the normalized position
 * 
 * @param {event} evt the clicking event
 * @returns 
 */
function getNormalizedPositions(evt) {
  var node = evt.target;
  var renderedBoundingBox = node.renderedBoundingBox();
  var renderedPosition = evt.renderedPosition;
  var x1 = renderedBoundingBox.x1;
  var x2 = renderedBoundingBox.x2;
  var y1 = renderedBoundingBox.y1;
  var y2 = renderedBoundingBox.y2;
  var x = renderedPosition.x;
  var y = renderedPosition.y;

  var relativeX = x - x1; 
  var relativeY = y - y1;

  var normalizedX = relativeX / (x2 - x1);
  var normalizedY = relativeY / (y2 - y1);
  return {'x': normalizedX, 'y': normalizedY};
}

/**
 * 
 * when click on map image, find the nearest county to the position user clicked on
 * 
 * @param {string} stateName state name
 * @param {number} normalizedX normalized x coordinate for click positions
 * @param {*} normalizedY normalized y coordinate for click positions
 * @returns 
 */
function getNearestCounty(stateName, normalizedX, normalizedY) {
    var data = countyData[stateName];
    var shortestDistance = Number.MAX_SAFE_INTEGER;
    var nearestCounty = "";
    for(let i = 0; i < data.length; i++) {
        var currCounty = data[i];
        var currDistance = distanceBetween(normalizedX, normalizedY, currCounty.x, currCounty.y);
        if(currDistance < shortestDistance) {
        shortestDistance = currDistance;
        nearestCounty = currCounty.countyName;
        }
    }
    return nearestCounty;
}




/**
 * 
 * add the clicked county node to the graph
 * 
 * @param {event} evt the clicking event
 * @param {cytoscape object} cy the cytoscape object
 */
function addCounty(evt, cy) {
    var node = evt.target;
    var sourceStateNode = cy.$("#"+node.json().data.sourceID);
    var parentLabel = sourceStateNode.json().data.label;
    
    var normalizedX = getNormalizedPositions(evt).x;
    var normalizedY = getNormalizedPositions(evt).y;

    var id = node.json().data.sourceID;

    var stateName = cy.$("#"+id).json().data.label.split("\nboltz:")[0];

    var countyName = getNearestCounty(stateName, normalizedX, normalizedY);
    
    //add new county node
    var addedData = [];
    
    var key = "hasCounty";
    var value = countyName;
    var tempNode = {"data":{}};
    tempNode.data.type = "County";
    tempNode.group = "nodes";
    tempNode.data.label = value;
    tempNode.data.class = classifyclass(key, value);
    tempNode.data.id = convertToNodeID(id, key, value);
    tempNode.data.sourceID = id;
    if(tempNode.data.class == "concept") {
      if(!conceptNodeLabelToID.hasOwnProperty(value)) {
        conceptNodeLabelToID[value] = tempNode.data.id;
      } else {
        tempNode.data.class = "dummyConcept";
      }
    }
    const radius = 400; 
    const sourceX = cy.$("#" + id).position('x');
    const sourceY = cy.$("#" + id).position('y');
    tempNode.position = {x:sourceX + radius, y:sourceY - radius};
    addedData.push(tempNode);
    var tempEdge = {"data":{}}
    tempEdge.group = "edges";
    tempEdge.data.id = convertToEdgeID(id, key, value)
    tempEdge.data.label = "hasCounty";
    tempEdge.data.source = id;
    tempEdge.data.target = tempNode.data.id;
    addedData.push(tempEdge);

    cy.add(addedData);
    reLayoutCola(cy);
    setAsCurrentNode(cy, tempNode.data.id, parentLabel);
  }