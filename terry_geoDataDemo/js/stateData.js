
/**
 * 
 * mapping from country name to its state map positions
 */
const stateData = {
    "United States of America":[{"x":0.1227, "y":0.08314, "stateName":"Washington\nboltz:Q1223"},
                     {"x":0.2911, "y":0.13403, "stateName":"Montana\nboltz:Q1212"},
                     {"x":0.4415, "y":0.16483, "stateName":"North Dakota\nboltz:Q1207"},
                     {"x":0.4415, "y":0.26334, "stateName":"South Dakota\nboltz:Q1211"},
                     {"x":0.3183, "y":0.29617, "stateName":"Wyoming\nboltz:Q1214"},
                     {"x":0.1068, "y":0.21643, "stateName":"Oregon\nboltz:Q824"},
                     {"x":0.2047, "y":0.24926, "stateName":"Idaho\nboltz:Q1221"},
                     {"x":0.1478, "y":0.37592, "stateName":"Nevada\nboltz:Q1227"},
                     {"x":0.2331, "y":0.40875, "stateName":"Utah\nboltz:Q829"},
                     {"x":0.2236, "y":0.57762, "stateName":"Arizona\nboltz:Q816"},
                     {"x":0.3247, "y":0.59638, "stateName":"New Mexico\nboltz:Q1522"},
                     {"x":0.3436, "y":0.44159, "stateName":"Colorado\nboltz:Q1261"},
                     {"x":0.0847, "y":0.47442, "stateName":"California\nboltz:Q99"},
                     {"x":0.4541, "y":0.37592, "stateName":"Nebraska\nboltz:Q1553"},
                     {"x":0.4668, "y":0.47911, "stateName":"Kansas\nboltz:Q1558"},
                     {"x":0.4889, "y":0.57293, "stateName":"Oklahoma\nboltz:Q1649"},
                     {"x":0.4510, "y":0.70896, "stateName":"Texas\nboltz:Q1439"},
                     {"x":0.5331, "y":0.22112, "stateName":"Minnesota\nboltz:Q1527"},
                     {"x":0.5552, "y":0.35246, "stateName":"Iowa\nboltz:Q1546"},
                     {"x":0.5710, "y":0.46973, "stateName":"Missouri\nboltz:Q1581"},
                     {"x":0.5773, "y":0.59638, "stateName":"Arkansas\nboltz:Q1612"},
                     {"x":0.5773, "y":0.70896, "stateName":"Louisiana\nboltz:Q1588"},
                     {"x":0.6089, "y":0.26803, "stateName":"Wisconsin\nboltz:Q1537"},
                     {"x":0.6310, "y":0.40875, "stateName":"Illinois\nboltz:Q1204"},
                     {"x":0.6341, "y":0.65267, "stateName":"Mississippi\nboltz:Q1494"},
                     {"x":0.6878, "y":0.64058, "stateName":"Alabama\nboltz:Q173"},
                     {"x":0.7541, "y":0.63589, "stateName":"Georgia\nboltz:Q1428"},
                     {"x":0.8047, "y":0.80476, "stateName":"Florida\nboltz:Q812"},
                     {"x":0.8001, "y":0.58710, "stateName":"South Carolina\nboltz:Q1456"},
                     {"x":0.8245, "y":0.52455, "stateName":"North Carolina\nboltz:Q1454"},
                     {"x":0.6893, "y":0.54760, "stateName":"Tennessee\nboltz:Q1509"},
                     {"x":0.8245, "y":0.45541, "stateName":"Virginia\nboltz:Q1370"},
                     {"x":0.7114, "y":0.47516, "stateName":"Kentucky\nboltz:Q1603"},
                     {"x":0.6826, "y":0.40273, "stateName":"Indiana\nboltz:Q1415"},
                     {"x":0.7431, "y":0.38903, "stateName":"Ohio\nboltz:Q1397"},
                     {"x":0.7763, "y":0.42188, "stateName":"West Virginia\nboltz:Q1371"},
                     {"x":0.8205, "y":0.33974, "stateName":"Pennsylvania\nboltz:Q1400"},
                     {"x":0.6933, "y":0.28636, "stateName":"Michigan\nboltz:Q1166"},
                     {"x":0.8537, "y":0.24939, "stateName":"New York\nboltz:Q1384"},
                     {"x":0.8454, "y":0.39402, "stateName":"Maryland\nboltz:Q1391"},
                     {"x":0.8730, "y":0.39486, "stateName":"Delaware\nboltz:Q1393"},
                     {"x":0.8841, "y":0.34969, "stateName":"New Jersey\nboltz:Q1408"},
                     {"x":0.9366, "y":0.13614, "stateName":"Maine\nboltz:Q724"},
                     {"x":0.9117, "y":0.21417, "stateName":"New Hampshire\nboltz:Q759"},
                     {"x":0.8896, "y":0.19774, "stateName":"Vermont\nboltz:Q16551"},
                     {"x":0.9200, "y":0.25113, "stateName":"Massachusetts\nboltz:Q771"},
                     {"x":0.9228, "y":0.27577, "stateName":"Rhode Island\nboltz:Q1387"},
                     {"x":0.9034, "y":0.27987, "stateName":"Connecticut\nboltz:Q779"},
                     {"x":0.1278, "y":0.77241, "stateName":"Alaska\nboltz:Q797"},
                     {"x":0.3394, "y":0.86441, "stateName":"Hawaii\nboltz:Q782"}
                    ]
}

/**
 * hierarchy: state -> region, for the nav bar to work we have to create a region->state mapping
 */
const northeast = new Set(["Connecticut\nboltz:Q779", "Maine\nboltz:Q724", 
                          "Massachusetts\nboltz:Q771", "New Hampshire\nboltz:Q759",
                          "Rhode Island\nboltz:Q1387", "Vermont\nboltz:Q16551",
                          "New Jersey\nboltz:Q1408", "New York\nboltz:Q1384",
                          "Pennsylvania\nboltz:Q1400"]);
                  
const midwest = new Set(["Illinois\nboltz:Q1204", "Indiana\nboltz:Q1415",
                        "Michigan\nboltz:Q1166", "Ohio\nboltz:Q1397",
                        "Wisconsin\nboltz:Q1537", "Iowa\nboltz:Q1546",
                        "Kansas\nboltz:Q1558", "Minnesota\nboltz:Q1527",
                        "Missouri\nboltz:Q1581", "Nebraska\nboltz:Q1553",
                        "North Dakota\nboltz:Q1207", "South Dakota\nboltz:Q1211"]);

const southern = new Set(["Delaware\nboltz:Q1393", "Florida\nboltz:Q812",
                          "Georgia\nboltz:Q1428", "Maryland\nboltz:Q1391",
                          "North Carolina\nboltz:Q1454", "South Carolina\nboltz:Q1456",
                          "Virginia\nboltz:Q1370", "West Virginia\nboltz:Q1371",
                          "Alabama\nboltz:Q173", "Kentucky\nboltz:Q1603",
                          "Mississippi\nboltz:Q1494", "Tennessee\nboltz:Q1509",
                          "Arkansas\nboltz:Q1612", "Louisiana\nboltz:Q1588",
                          "Oklahoma\nboltz:Q1649", "Texas\nboltz:Q1439"]);
                          
const western = new Set(["Arizona\nboltz:Q816", "Colorado\nboltz:Q1261",
                        "Idaho\nboltz:Q1221", "Montana\nboltz:Q1212",
                        "Nevada\nboltz:Q1227", "New Mexico\nboltz:Q1522",
                        "Utah\nboltz:Q829", "Wyoming\nboltz:Q1214",
                        "Alaska\nboltz:Q797", "California\nboltz:Q99",
                        "Hawaii\nboltz:Q782", "Oregon\nboltz:Q824",
                        "Washington\nboltz:Q1223"]);

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
 * when click on map image, find the nearest state to the position user clicked on
 * 
 * @param {string} countryName country name
 * @param {number} normalizedX normalized x coordinate for click positions
 * @param {*} normalizedY normalized y coordinate for click positions
 * @returns nearestState name as a string
 */
function getNearestState(countryName, normalizedX, normalizedY) {
  var data = stateData[countryName];
  var shortestDistance = Number.MAX_SAFE_INTEGER;
  var nearestState = "";
  for(let i = 0; i < data.length; i++) {
      var currState = data[i];
      var currDistance = distanceBetween(normalizedX, normalizedY, currState.x, currState.y);
      if(currDistance < shortestDistance) {
        shortestDistance = currDistance;
        nearestState = currState.stateName;
      }
  }
  return nearestState;
}

/**
 * 
 * add the clicked state node to the graph
 * 
 * @param {event} evt the clicking event
 * @param {cytoscape object} cy the cytoscape object
 */
function addState(evt, cy) {
  console.log("Called addState");
  var node = evt.target;
  var sourceCountryNode = cy.$("#"+node.json().data.sourceID);
  var parentLabel = sourceCountryNode.json().data.label;

  var normalizedX = getNormalizedPositions(evt).x;
  var normalizedY = getNormalizedPositions(evt).y;

  var id = node.json().data.sourceID;

  var countryName = cy.$("#"+id).json().data.label.split("\nboltz:")[0];

  var stateName = getNearestState(countryName, normalizedX, normalizedY);

  //add new state node and edge
  var addedData = [];
  var key = "hasState";
  var value = stateName;
  //node info
  var tempNode = {"data":{}};
  tempNode.data.type = "State";
  tempNode.group = "nodes";
  tempNode.data.label = value;
  tempNode.data.class = classifyclass(key, value);
  tempNode.data.id = convertToNodeID(id, key, value);
  tempNode.data.sourceID = id;
  if (tempNode.data.class == "concept") {
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
  // edge info
  var tempEdge = {"data":{}}
  tempEdge.group = "edges";
  tempEdge.data.id = convertToEdgeID(id, key, value)
  tempEdge.data.label = "hasState";
  tempEdge.data.source = id;
  tempEdge.data.target = tempNode.data.id;
  addedData.push(tempEdge);
  cy.add(addedData);
  reLayoutCola(cy);
  
  // to maintain our hierarchy 
  if (northeast.has(stateName)) {
    parentLabel = "Northeastern United States\nboltz:Q24460";
  }
  if (midwest.has(stateName)) {
    parentLabel = "Midwestern United States\nboltz:Q186545";
  }
  if (southern.has(stateName)) {
    parentLabel = "Southern United States\nboltz:Q49042";
  }
  if (western.has(stateName)) {
    parentLabel = "Western United States\nboltz:Q12612";
  }
  
  setAsCurrentNode(cy, tempNode.data.id, parentLabel);
}