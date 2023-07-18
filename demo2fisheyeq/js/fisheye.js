//COPIED DIRECTLY FROM THE NY TIMES SOURCE
function fisheye() {
  // console.log("fisheye")

  var min = 0,
    max = 1,
    distortion = 3,
    focus = 0;

  function G(x) {
    return (distortion + 1) * x / (distortion * x + 1);
  }

  function fisheye(x) {
    var Dmax_x = (x < focus ? min : max) - focus,
      Dnorm_x = x - focus;
    return G(Dnorm_x / Dmax_x) * Dmax_x + focus;
  }

  fisheye.extent = function (_) {
    if (!arguments.length) return [min, max];
    min = +_[0], max = +_[1];
    return fisheye;
  };

  fisheye.distortion = function (_) {
    if (!arguments.length) return distortion;
    distortion = +_;
    return fisheye;
  };

  fisheye.focus = function (_) {
    if (!arguments.length) return focus;
    focus = +_;
    return fisheye;
  };

  // console.log("fisheye takes milliseconds", endTime - startTime);

  return fisheye;
}

//copying the render() function from the NYTIMES fisheye algorithm 
function render_nodes(cy_graph, siblings, fisheye_fn_instance, normalWidth, nodeWidth, first_x_pos, currentFocus) {
  //console.log("render_nodes")
  lastX = 0;
  for (let i = 0; i < siblings.length; i++) {
    // console.log('lastX', lastX)
    let curr_node = siblings[i];
    var x0 = fisheye_fn_instance(i * normalWidth),
      x1 = fisheye_fn_instance((i + 1) * normalWidth),
      dx = Math.min(nodeWidth, x1 - x0);
    cy_graph.nodes(`[id = "${siblings[i]}-fisheye"]`).ungrabify()

    cy_graph.nodes(`[id = "${siblings[i]}-fisheye"]`).style({
      'width': dx ? dx : normalWidth,
      'font-size': dx ? .2 * dx : NORMAL_FONT_SIZE
    });

    cy_graph.nodes(`[id = "${siblings[i]}-fisheye"]`).position({
      x: dx ? first_x_pos + lastX + dx / 2 : first_x_pos + lastX + normalWidth / 2
    });
    lastX += dx;
  }
  // console.log("render_nodes takes milliseconds", endTime - startTime);
}

//NEW ADD_FISHEYE_EFFECT FUNCTION USING THE NY TIMES ALGORITHM
function enableFisheye(cy_graph, siblings, first_x_pos) {
  // console.log("enableFisheye")
  let startTimee = new Date().getTime();

  let canvas_width = (FISHEYE_NODE_SIZE * (siblings.length));
  // let canvas_height = FISHEYE_NODE_SEP;
  let normalWidth = FISHEYE_NODE_SIZE;

  // console.log("canvas width", canvas_width);

  let nodeWidth = normalWidth * 5; // Why?
  // let nodeHeight = 225;
  let desiredDistortion = 0,
    desiredFocus,
    idle = true;

  let fisheye_fn_instance = fisheye().distortion(0).extent([0, canvas_width]);

  // console.log('initial distortion', fisheye_fn_instance.distortion())

  let curr_place = 'background';

  function idle_function() {
    // console.log('idle val', idle)
    var currentDistortion = fisheye_fn_instance.distortion(),
      currentFocus = currentDistortion ? fisheye_fn_instance.focus() : desiredFocus;
    idle = Math.abs(desiredDistortion - currentDistortion) < .01 && Math.abs(desiredFocus - currentFocus) < .5;

    fisheye_fn_instance.distortion(idle ? desiredDistortion : currentDistortion + (desiredDistortion - currentDistortion) * .14);
    fisheye_fn_instance.focus(idle ? desiredFocus : currentFocus + (desiredFocus - currentFocus) * .14);
    render_nodes(cy_graph, siblings, fisheye_fn_instance, normalWidth, nodeWidth, first_x_pos, currentFocus);
    return idle;
  }

  cy_graph.on('mousemove', function (evt) {
    // console.log('mouseover', curr_place)
    let x_pos_on_canvas = evt.position.x - first_x_pos;
    // console.log('x_pos', x_pos_on_canvas, 'canvas_width', canvas_width)
    let evtTarget = evt.target;
    let data = evtTarget._private.data;
    if (data.type == 'fisheye-child' && x_pos_on_canvas < canvas_width && x_pos_on_canvas > 0) {
      //we just moved over to the canvas
      desiredDistortion = nodeWidth / normalWidth - 1;

      //replacing mousemove() function in NYTIMES fisheye algorithm
      desiredFocus = Math.max(0, Math.min(canvas_width, x_pos_on_canvas));
      if (idle) {
        var timer = d3.timer(idle_function)
      }
      curr_place = 'canvas';
    } else {
      //we've moved out of the canvas so it's mimicking the mouseout function
      curr_place = 'background';
      desiredFocus = Math.max(0, Math.min(canvas_width, x_pos_on_canvas));
      desiredDistortion = 0;
      idle_function()
    }
  });
  //this render_nodes function basically needs to redraw the nodes
  //giving them their appropriate canvas_width to create the fisheye effect
}

function create_fisheye_nodes(node_qval, parent_and_all_children, cy_graph, qvals_to_names) {
  // console.log("create_fisheye_nodes")

  let startTime = new Date().getTime();

  cy_graph.remove(`node[type = "fisheye-child"]`);

  cy_graph.elements().nodes().style(
    {
      'opacity': '1',
      'text-opacity': '1'
    });

  //let nodes = cy_graph.elements().nodes();

  cy_graph.nodes(`node[type = "taxon"]`).style({
    "background-color": TAXON_NODE_COLOR,
    'width': TAXON_NODE_SIZE,
    'height': TAXON_NODE_SIZE,
    'font-size': NORMAL_FONT_SIZE,
    'border-width': 0
  });
  cy_graph.elements().edges().style(
    {
      'line-opacity': '1',
      'text-opacity': '1'
    });

  let curr_children = parent_and_all_children[node_qval];
  if (curr_children == undefined) {
    return false;
  }
  shade_other_nodes(node_qval, cy_graph, node_qval);

  let curr_x = cy_graph.nodes(`[id = "${node_qval}"]`).position().x;
  let y_pos = cy_graph.nodes(`[id = "${node_qval}"]`).position().y + FISHEYE_NODE_DEPTH;
  let amount_before_x = (Math.floor((curr_children.length) / 2)) * FISHEYE_NODE_SEP;
  let first_x;

  if (curr_children.length % 2 != 0) {
    first_x = curr_x - amount_before_x;
  } else {
    first_x = curr_x - amount_before_x + (FISHEYE_NODE_SEP * .5);
  }

  for (let i = 0; i < curr_children.length; i++) {
    let curr_child_qval = curr_children[i];
    let new_child_node =
    {
      group: 'nodes',
      data: {
        id: `${curr_child_qval}-fisheye`,
        name: `${qvals_to_names[curr_child_qval]}`,
        //name: '',
        color: FISHEYE_CHILD_COLOR,
        width: FISHEYE_NODE_SIZE,
        height: FISHEYE_NODE_SIZE * 3,
        type: 'fisheye-child'
      },
      position: { x: first_x + (i * FISHEYE_NODE_SEP), y: y_pos }
    };
    let new_edge =
    {
      group: 'edges',
      data: {
        id: `${curr_child_qval}-fisheye-${node_qval}`,
        source: `${curr_child_qval}-fisheye`,
        target: node_qval,
        label: 'subTaxonOf'
      }
    };
    cy_graph.add([new_child_node]);
    cy_graph.add([new_edge]);
  }

  cy_graph.nodes(`[type = "fisheye-child"]`).style({
    'shape': 'square',
    'font-size': NORMAL_FONT_SIZE,
    'border-color': FISHEYE_PARENT_COLOR,
    'border-width': 5,
    'text-wrap': 'wrap',
    'text-max-width': TAXON_NODE_SIZE,
    'opacity': 0.5,
    'text-rotation': FISHEYE_TEXT_ROTATION
  });

  let id_label = `[id = '${node_qval}']`;

  let clientWidth = document.getElementById('cy').clientWidth;
  let clientHeight = document.getElementById('cy').clientHeight;
  let smaller_space = Math.min(clientWidth, clientHeight);

  let padding_amount = Math.floor(clientHeight / 2.2);

  //zoom on the selected node enough to display all of the properties
  cy_graph.animate({
    fit: {
      eles: id_label,
      padding: padding_amount
    }
  });

  enableFisheye(cy_graph, curr_children, first_x);
  let endTime = new Date().getTime();
  // console.log("Create_fisheye_Node takes milliseconds", endTime - startTime);
}
