function navigateTo(cy, name, navList) {
    
}

// append nav history buttons in div whose id = nav-history
// according to the navList
function appendNavButtons(cy, navList) {
    for(let i = 0; i < navList.length; i++) {
      var name = navList[i];
      var btn = $(`<button class="nav-button">${name} ◀</button>`);
      if(i == navList.length - 1) {
        btn = $(`<button class="nav-button selected">${name}</button>`);
      }
      $("#nav-history").append(btn);
      (function(btn, name) {
        btn.on('click', function(e) {
          $('.nav-button.selected').removeClass('selected');
          if(!btn.hasClass("selected")) {
            btn.addClass("selected")
          }
          //TODO: add node function here
          navigateTo(cy, name, navList.reverse());
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
    var pairs = [];
    Object.keys(binding).forEach(function(key) {
      pairs.push(binding[key])
    })
    var nodes = {}
    var done = false
    while(!done) {
      done = true
      for(let i = 0; i < pairs.length; i++) {
        var curr = pairs[i];
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
      navList[i] = navList[i].name;
    }
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
      SELECT ?xLabel ?yLabel
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