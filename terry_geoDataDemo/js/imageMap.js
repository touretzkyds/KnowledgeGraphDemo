const countryToRegionImageMaps = {
  "United States of America": [
    { "x": 0.8364634015613773, "y": 0.3108128572018856, "prefLabel": "Northeastern United States", "concept": "boltz:Q24460" },
    { "x": 0.536691171440346, "y": 0.3757588858924756, "prefLabel": "Midwestern United States", "concept": "boltz:Q186545" },
    { "x": 0.6269840118382469, "y": 0.7762593961511136, "prefLabel": "Southern United States", "concept": "boltz:Q49042" },
    { "x": 0.2874829319421391, "y": 0.44070491458306554, "prefLabel": "Western United States", "concept": "Q12612" }
  ]
}

const countryImageMaps = {
  "United States of America": [
    { "x": 0.1227, "y": 0.08314, "prefLabel": "Washington", "concept": "boltz:Q1223" },
    { "x": 0.2911, "y": 0.13403, "prefLabel": "Montana", "concept": "boltz:Q1212" },
    { "x": 0.4415, "y": 0.16483, "prefLabel": "North Dakota", "concept": "boltz:Q1207" },
    { "x": 0.4415, "y": 0.26334, "prefLabel": "South Dakota", "concept": "boltz:Q1211" },
    { "x": 0.3183, "y": 0.29617, "prefLabel": "Wyoming", "concept": "boltz:Q1214" },
    { "x": 0.1068, "y": 0.21643, "prefLabel": "Oregon", "concept": "boltz:Q824" },
    { "x": 0.2047, "y": 0.24926, "prefLabel": "Idaho", "concept": "boltz:Q1221" },
    { "x": 0.1478, "y": 0.37592, "prefLabel": "Nevada", "concept": "boltz:Q1227" },
    { "x": 0.2331, "y": 0.40875, "prefLabel": "Utah", "concept": "boltz:Q829" },
    { "x": 0.2236, "y": 0.57762, "prefLabel": "Arizona", "concept": "boltz:Q816" },
    { "x": 0.3247, "y": 0.59638, "prefLabel": "New Mexico", "concept": "boltz:Q1522" },
    { "x": 0.3436, "y": 0.44159, "prefLabel": "Colorado", "concept": "boltz:Q1261" },
    { "x": 0.0847, "y": 0.47442, "prefLabel": "California", "concept": "boltz:Q99" },
    { "x": 0.4541, "y": 0.37592, "prefLabel": "Nebraska", "concept": "boltz:Q1553" },
    { "x": 0.4668, "y": 0.47911, "prefLabel": "Kansas", "concept": "boltz:Q1558" },
    { "x": 0.4889, "y": 0.57293, "prefLabel": "Oklahoma", "concept": "boltz:Q1649" },
    { "x": 0.4510, "y": 0.70896, "prefLabel": "Texas", "concept": "boltz:Q1439" },
    { "x": 0.5331, "y": 0.22112, "prefLabel": "Minnesota", "concept": "boltz:Q1527" },
    { "x": 0.5552, "y": 0.35246, "prefLabel": "Iowa", "concept": "boltz:Q1546" },
    { "x": 0.5710, "y": 0.46973, "prefLabel": "Missouri", "concept": "boltz:Q1581" },
    { "x": 0.5773, "y": 0.59638, "prefLabel": "Arkansas", "concept": "boltz:Q1612" },
    { "x": 0.5773, "y": 0.70896, "prefLabel": "Louisiana", "concept": "boltz:Q1588" },
    { "x": 0.6089, "y": 0.26803, "prefLabel": "Wisconsin", "concept": "boltz:Q1537" },
    { "x": 0.6310, "y": 0.40875, "prefLabel": "Illinois", "concept": "boltz:Q1204" },
    { "x": 0.6341, "y": 0.65267, "prefLabel": "Mississippi", "concept": "boltz:Q1494" },
    { "x": 0.6878, "y": 0.64058, "prefLabel": "Alabama", "concept": "boltz:Q173" },
    { "x": 0.7541, "y": 0.63589, "prefLabel": "Georgia", "concept": "boltz:Q1428" },
    { "x": 0.8047, "y": 0.80476, "prefLabel": "Florida", "concept": "boltz:Q812" },
    { "x": 0.8001, "y": 0.58710, "prefLabel": "South Carolina", "concept": "boltz:Q1456" },
    { "x": 0.8245, "y": 0.52455, "prefLabel": "North Carolina", "concept": "boltz:Q1454" },
    { "x": 0.6893, "y": 0.54760, "prefLabel": "Tennessee", "concept": "boltz:Q1509" },
    { "x": 0.8245, "y": 0.45541, "prefLabel": "Virginia", "concept": "boltz:Q1370" },
    { "x": 0.7114, "y": 0.47516, "prefLabel": "Kentucky", "concept": "boltz:Q1603" },
    { "x": 0.6826, "y": 0.40273, "prefLabel": "Indiana", "concept": "boltz:Q1415" },
    { "x": 0.7431, "y": 0.38903, "prefLabel": "Ohio", "concept": "boltz:Q1397" },
    { "x": 0.7763, "y": 0.42188, "prefLabel": "West Virginia", "concept": "boltz:Q1371" },
    { "x": 0.8205, "y": 0.33974, "prefLabel": "Pennsylvania", "concept": "boltz:Q1400" },
    { "x": 0.6933, "y": 0.28636, "prefLabel": "Michigan", "concept": "boltz:Q1166" },
    { "x": 0.8537, "y": 0.24939, "prefLabel": "New York", "concept": "boltz:Q1384" },
    { "x": 0.8454, "y": 0.39402, "prefLabel": "Maryland", "concept": "boltz:Q1391" },
    { "x": 0.8730, "y": 0.39486, "prefLabel": "Delaware", "concept": "boltz:Q1393" },
    { "x": 0.8841, "y": 0.34969, "prefLabel": "New Jersey", "concept": "boltz:Q1408" },
    { "x": 0.9366, "y": 0.13614, "prefLabel": "Maine", "concept": "boltz:Q724" },
    { "x": 0.9117, "y": 0.21417, "prefLabel": "New Hampshire", "concept": "boltz:Q759" },
    { "x": 0.8896, "y": 0.19774, "prefLabel": "Vermont", "concept": "boltz:Q16551" },
    { "x": 0.9200, "y": 0.25113, "prefLabel": "Massachusetts", "concept": "boltz:Q771" },
    { "x": 0.9228, "y": 0.27577, "prefLabel": "Rhode Island", "concept": "boltz:Q1387" },
    { "x": 0.9034, "y": 0.27987, "prefLabel": "Connecticut", "concept": "boltz:Q779" },
    { "x": 0.1278, "y": 0.77241, "prefLabel": "Alaska", "concept": "boltz:Q797" },
    { "x": 0.3394, "y": 0.86441, "prefLabel": "Hawaii", "concept": "boltz:Q782" }
  ]
}

const regionImageMaps = {
  "Northeastern United States": [
    { "x": 0.5983823403176434, "y": 0.5391546183150998, "prefLabel": "Connecticut", "concept": "boltz:Q779" },
    { "x": 0.7035045825483284, "y": 0.21422452778456694, "prefLabel": "Maine", "concept": "boltz:Q724" },
    { "x": 0.6918153295477952, "y": 0.22371586021504428, "prefLabel": "Massachusetts", "concept": "boltz:Q771" },
    { "x": 0.6353172733785516, "y": 0.40405117639411375, "prefLabel": "New Hampshire", "concept": "boltz:Q759" },
    { "x": 0.6528511528793514, "y": 0.5226928317750805, "prefLabel": "Rhode Island", "concept": "boltz:Q1387" },
    { "x": 0.5651817553753526, "y": 0.34947601491886904, "prefLabel": "Vermont", "concept": "boltz:Q16551" },
    { "x": 0.5515442935413972, "y": 0.6698084844474793, "prefLabel": "New Jersey", "concept": "boltz:Q1408" },
    { "x": 0.4794605667047761, "y": 0.47049050340745513, "prefLabel": "New York", "concept": "boltz:Q1384" },
    { "x": 0.39763579570104396, "y": 0.63184315472557, "prefLabel": "Pennsylvania", "concept": "boltz:Q1400" }
  ]
}

const stateImageMaps = {
  "Pennsylvania": [
    { "x": 0.1308, "y": 0.1724, "prefLabel": "Erie County", "concept": "boltz:Q488679" },
    { "x": 0.1228, "y": 0.2795, "prefLabel": "Crawford County", "concept": "boltz:Q494086" },
    { "x": 0.0971, "y": 0.3996, "prefLabel": "Mercer County", "concept": "boltz:Q497216" },
    { "x": 0.0826, "y": 0.4989, "prefLabel": "Lawrence County", "concept": "boltz:Q501256" },
    { "x": 0.0794, "y": 0.6034, "prefLabel": "Beaver County", "concept": "boltz:Q494104" },
    { "x": 0.0875, "y": 0.7549, "prefLabel": "Washington County", "concept": "boltz:Q497200" },
    { "x": 0.0923, "y": 0.8803, "prefLabel": "Greene County", "concept": "boltz:Q494098" },
    { "x": 0.2497, "y": 0.2404, "prefLabel": "Warren County", "concept": "boltz:Q495662" },
    { "x": 0.1726, "y": 0.3762, "prefLabel": "Venango County", "concept": "boltz:Q494241" },
    { "x": 0.1485, "y": 0.5250, "prefLabel": "Butler County", "concept": "boltz:Q488672" },
    { "x": 0.1357, "y": 0.6713, "prefLabel": "Allegheny County", "concept": "boltz:Q156291" },
    { "x": 0.2546, "y": 0.3265, "prefLabel": "Forest County", "concept": "boltz:Q494236" },
    { "x": 0.2224, "y": 0.4441, "prefLabel": "Clarion County", "concept": "boltz:Q494198" },
    { "x": 0.2160, "y": 0.5694, "prefLabel": "Armstrong County", "concept": "boltz:Q494186" },
    { "x": 0.2176, "y": 0.7366, "prefLabel": "Westmoreland County", "concept": "boltz:Q495645" },
    { "x": 0.1822, "y": 0.8698, "prefLabel": "Fayette County", "concept": "boltz:Q488683" },
    { "x": 0.3558, "y": 0.2404, "prefLabel": "Mckean County", "concept": "boltz:Q495640" },
    { "x": 0.3429, "y": 0.3657, "prefLabel": "Elk County", "concept": "boltz:Q494254" },
    { "x": 0.2883, "y": 0.4649, "prefLabel": "Jefferson County", "concept": "boltz:Q494156" },
    { "x": 0.2754, "y": 0.6217, "prefLabel": "Indiana County", "concept": "boltz:Q494146" },
    { "x": 0.4152, "y": 0.3631, "prefLabel": "Cameron County", "concept": "boltz:Q494142" },
    { "x": 0.3686, "y": 0.5068, "prefLabel": "Clearfield County", "concept": "boltz:Q494233" },
    { "x": 0.3269, "y": 0.6739, "prefLabel": "Cambria County", "concept": "boltz:Q490077" },
    { "x": 0.2819, "y": 0.8489, "prefLabel": "Somerset County", "concept": "boltz:Q490908" },
    { "x": 0.4586, "y": 0.2691, "prefLabel": "Potter County", "concept": "boltz:Q501340" },
    { "x": 0.4988, "y": 0.4284, "prefLabel": "Clinton County", "concept": "boltz:Q494093" },
    { "x": 0.4731, "y": 0.5355, "prefLabel": "Centre County", "concept": "boltz:Q494248" },
    { "x": 0.3895, "y": 0.6739, "prefLabel": "Blair County", "concept": "boltz:Q494152" },
    { "x": 0.3654, "y": 0.8437, "prefLabel": "Bedford County", "concept": "boltz:Q494174" },
    { "x": 0.4377, "y": 0.6922, "prefLabel": "Huntingdon County", "concept": "boltz:Q494077" },
    { "x": 0.4249, "y": 0.8620, "prefLabel": "Fulton County", "concept": "boltz:Q494211" },
    { "x": 0.5534, "y": 0.2560, "prefLabel": "Tioga County", "concept": "boltz:Q495613" },
    { "x": 0.5903, "y": 0.3924, "prefLabel": "Lycoming County", "concept": "boltz:Q495633" },
    { "x": 0.5887, "y": 0.5135, "prefLabel": "Union County", "concept": "boltz:Q501248" },
    { "x": 0.5049, "y": 0.6321, "prefLabel": "Mifflin County", "concept": "boltz:Q494161" },
    { "x": 0.5344, "y": 0.6599, "prefLabel": "Juniata County", "concept": "boltz:Q501270" },
    { "x": 0.5903, "y": 0.5816, "prefLabel": "Snyder County", "concept": "boltz:Q495595" },
    { "x": 0.5624, "y": 0.7027, "prefLabel": "Perry County", "concept": "boltz:Q501298" },
    { "x": 0.5624, "y": 0.7810, "prefLabel": "Cumberland County", "concept": "boltz:Q494134" },
    { "x": 0.5655, "y": 0.8819, "prefLabel": "Adams County", "concept": "boltz:Q351865" },
    { "x": 0.6725, "y": 0.2436, "prefLabel": "Bradford County", "concept": "boltz:Q488687" },
    { "x": 0.6710, "y": 0.3596, "prefLabel": "Sullivan County", "concept": "boltz:Q501306" },
    { "x": 0.6486, "y": 0.4918, "prefLabel": "Montour County", "concept": "boltz:Q495687" },
    { "x": 0.6896, "y": 0.4865, "prefLabel": "Columbia County", "concept": "boltz:Q488693" },
    { "x": 0.6454, "y": 0.5649, "prefLabel": "Northumberland County", "concept": "boltz:Q494164" },
    { "x": 0.6293, "y": 0.7043, "prefLabel": "Dauphin County", "concept": "boltz:Q488690" },
    { "x": 0.6414, "y": 0.8610, "prefLabel": "York County", "concept": "boltz:Q490914" },
    { "x": 0.7200, "y": 0.6024, "prefLabel": "Schuylkill County", "concept": "boltz:Q494207" },
    { "x": 0.6820, "y": 0.7139, "prefLabel": "Lebanon County", "concept": "boltz:Q781165" },
    { "x": 0.7200, "y": 0.8229, "prefLabel": "Lancaster County", "concept": "boltz:Q142369" },
    { "x": 0.7795, "y": 0.2334, "prefLabel": "Susquehanna County", "concept": "boltz:Q495603" },
    { "x": 0.7460, "y": 0.3349, "prefLabel": "Wyoming County", "concept": "boltz:Q495677" },
    { "x": 0.7551, "y": 0.4439, "prefLabel": "Luzerne County", "concept": "boltz:Q501292" },
    { "x": 0.7947, "y": 0.5306, "prefLabel": "Carbon County", "concept": "boltz:Q488698" },
    { "x": 0.8160, "y": 0.6297, "prefLabel": "Lehigh County", "concept": "boltz:Q494117" },
    { "x": 0.7672, "y": 0.6965, "prefLabel": "Berks County", "concept": "boltz:Q490920" },
    { "x": 0.7962, "y": 0.8402, "prefLabel": "Chester County", "concept": "boltz:Q27840" },
    { "x": 0.8099, "y": 0.3622, "prefLabel": "Lackawanna County", "concept": "boltz:Q501350" },
    { "x": 0.8557, "y": 0.7634, "prefLabel": "Montgomery County", "concept": "boltz:Q378527" },
    { "x": 0.8496, "y": 0.8575, "prefLabel": "Delaware County", "concept": "boltz:Q27844" },
    { "x": 0.8602, "y": 0.2854, "prefLabel": "Wayne County", "concept": "boltz:Q494167" },
    { "x": 0.8983, "y": 0.3894, "prefLabel": "Pike County", "concept": "boltz:Q495649" },
    { "x": 0.8557, "y": 0.4786, "prefLabel": "Monroe County", "concept": "boltz:Q495588" },
    { "x": 0.8557, "y": 0.5851, "prefLabel": "Northampton County", "concept": "boltz:Q495658" },
    { "x": 0.8938, "y": 0.7238, "prefLabel": "Bucks County", "concept": "boltz:Q494192" },
    { "x": 0.8877, "y": 0.8228, "prefLabel": "Philadelphia County", "concept": "boltz:Q496900" }
  ]
}

/**
 * hierarchy: state -> region, for the nav bar to work we have to create a region->state mapping
 */
const northeastRegion = new Set(["Connecticut\nboltz:Q779", "Maine\nboltz:Q724",
  "Massachusetts\nboltz:Q771", "New Hampshire\nboltz:Q759",
  "Rhode Island\nboltz:Q1387", "Vermont\nboltz:Q16551",
  "New Jersey\nboltz:Q1408", "New York\nboltz:Q1384",
  "Pennsylvania\nboltz:Q1400"]);

const midwestRegion = new Set(["Illinois\nboltz:Q1204", "Indiana\nboltz:Q1415",
  "Michigan\nboltz:Q1166", "Ohio\nboltz:Q1397",
  "Wisconsin\nboltz:Q1537", "Iowa\nboltz:Q1546",
  "Kansas\nboltz:Q1558", "Minnesota\nboltz:Q1527",
  "Missouri\nboltz:Q1581", "Nebraska\nboltz:Q1553",
  "North Dakota\nboltz:Q1207", "South Dakota\nboltz:Q1211"]);

const southernRegion = new Set(["Delaware\nboltz:Q1393", "Florida\nboltz:Q812",
  "Georgia\nboltz:Q1428", "Maryland\nboltz:Q1391",
  "North Carolina\nboltz:Q1454", "South Carolina\nboltz:Q1456",
  "Virginia\nboltz:Q1370", "West Virginia\nboltz:Q1371",
  "Alabama\nboltz:Q173", "Kentucky\nboltz:Q1603",
  "Mississippi\nboltz:Q1494", "Tennessee\nboltz:Q1509",
  "Arkansas\nboltz:Q1612", "Louisiana\nboltz:Q1588",
  "Oklahoma\nboltz:Q1649", "Texas\nboltz:Q1439"]);

const westernRegion = new Set(["Arizona\nboltz:Q816", "Colorado\nboltz:Q1261",
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
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
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
  console.log({ 'x': normalizedX, 'y': normalizedY });
  return { 'x': normalizedX, 'y': normalizedY };
}

function getNearestSubRegion(maps, name, normalizedX, normalizedY) {
  console.log(maps);
  console.log(name)
  var data = maps[name];
  var shortestDistance = Number.MAX_SAFE_INTEGER;
  var [nearestRegion, concept] = ["", ""];
  for (let i = 0; i < data.length; i++) {
    var currRegion = data[i];
    var currDistance = distanceBetween(normalizedX, normalizedY, currRegion.x, currRegion.y);
    if (currDistance < shortestDistance) {
      shortestDistance = currDistance;
      nearestRegion = currRegion.prefLabel;
      concept = currRegion.concept;
    }
  }
  console.log(nearestRegion);
  return [nearestRegion, concept];
}

function addSubRegion(evt, regionType, maps, cy) {
  console.log("Adding subregion");
  var node = evt.target;
  var sourceNode = cy.$("#" + node.json().data.sourceID);
  var parentLabel = sourceNode.json().data.label;

  var normalizedX = getNormalizedPositions(evt).x;
  var normalizedY = getNormalizedPositions(evt).y;

  var id = node.json().data.sourceID;

  var adminRegionName = cy.$("#" + id).json().data.label.split("\nboltz:")[0];

  var [subRegionName, subRegionConcept] = getNearestSubRegion(maps, adminRegionName, normalizedX, normalizedY);

  var addedData = [];
  var subRegionType = "";
  if (regionType === "State") {
    subRegionType = "County";
  } else if (regionType === "Country" || regionType === "Region") {
    subRegionType = "State";
  }
  var key = "has" + subRegionType;
  var value = subRegionName + '\n' + subRegionConcept

  var tempNode = { "data": {} };
  tempNode.data.type = subRegionType
  tempNode.group = "nodes";
  tempNode.data.label = value;
  tempNode.data.class = classifyclass(key, value);
  tempNode.data.id = convertToNodeID(id, key, value);
  tempNode.data.sourceID = id;
  if (tempNode.data.class == "concept") {
    if (!conceptNodeLabelToID.hasOwnProperty(value)) {
      conceptNodeLabelToID[value] = tempNode.data.id;
    } else {
      tempNode.data.class = "dummyConcept";
    }
  }
  const radius = 400;
  const sourceX = cy.$("#" + id).position('x');
  const sourceY = cy.$("#" + id).position('y');
  tempNode.position = { x: sourceX + radius, y: sourceY - radius };
  console.log(tempNode);
  addedData.push(tempNode);

  var tempEdge = { "data": {} }
  tempEdge.group = "edges";
  tempEdge.data.id = convertToEdgeID(id, key, value)
  tempEdge.data.label = key;
  tempEdge.data.source = id;
  tempEdge.data.target = tempNode.data.id;
  console.log(tempEdge);
  addedData.push(tempEdge);
  cy.add(addedData);

  reLayoutCola(cy);

  if (regionType === "Country") {
    if (northeastRegion.has(subRegionName + '\n' + subRegionConcept)) {
      parentLabel = "Northeastern United States\nboltz:Q24460";
    }
    if (midwestRegion.has(subRegionName + '\n' + subRegionConcept)) {
      parentLabel = "Midwestern United States\nboltz:Q186545";
    }
    if (southernRegion.has(subRegionName + '\n' + subRegionConcept)) {
      parentLabel = "Southern United States\nboltz:Q49042";
    }
    if (westernRegion.has(subRegionName + '\n' + subRegionConcept)) {
      parentLabel = "Western United States\nboltz:Q12612";
    }
  }
  setAsCurrentNode(cy, tempNode.data.id, parentLabel);
}

function addCountyFromState(evt, cy) {
  addSubRegion(evt, "State", stateImageMaps, cy);
}
function addStateFromRegion(evt, cy) {
  addSubRegion(evt, "Region", regionImageMaps, cy);
}
function addStateFromCountry(evt, cy) {
  addSubRegion(evt, "Country", countryImageMaps, cy);
}
function addRegionFromCountry(evt, cy) {
  addSubRegion(evt, "Country", countryToRegionImageMaps, cy);
}