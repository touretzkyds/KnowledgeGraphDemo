
/**
 * 
 * relayout the whole graph with cola
 * 
 * @param {cytoscape object} cy the cytoscape object
 */
function reLayoutCola(cy) {
    var layout = cy.layout({
        name: 'cola',
        avoidOverlap: true,
        edgeLength: 500,
        nodeSpacing: 100,
        nodeDimensionsIncludeLabels: true,
        centerGraph:true,
        numIter: 100000,
    });
    
    layout.start();
}

/**
 * 
 * style the image node width and height according to its image cache
 * 
 * @param {*} imgCache the imgCache in cy object, can be retrived by cy._private.renderer.imageCache
 * @param {node} ele the node to be styled
 * @param {cytoscape object} cy the cytoscape object
 */
function styleImageSize(imgCache, ele, cy) {
    const url = ele.json().data.label;
    const img = imgCache[url].image;
    var imageWidth = img.naturalWidth;
    var imageHeight = img.naturalHeight;
    const maxH = 600;
    const maxW = 600;
    if(imageWidth > maxW) {
        imageWidth = maxW;
        imageHeight = (img.naturalHeight / img.naturalWidth) * imageWidth;
    } else if(imageHeight > maxH) {
        imageHeight = maxW;
        imageWidth = (img.naturalWidth / img.naturalHeight) * imageHeight;
    }
    cy.nodes(`[id = "${ele.id()}"]`).style({
        'width':imageWidth,
        'height':imageHeight,
    });
    }

/**
 * 
 * find all image nodes and style their dimensions
 * 
 * @param {cytoscape object} cy the cytoscape object
 */
function adjustImageSize(cy) {
    cy.nodes().forEach(function(ele){
        if(ele.json().data.class === 'image' || ele.json().data.class === 'flagImage' || ele.json().data.class === 'imageMap') {
        const url = ele.json().data.label;
        var imgCache = cy._private.renderer.imageCache;
        if(imgCache === undefined || imgCache[url] === undefined) {
            ele.on('background', function(evt) {
            imgCache = cy._private.renderer.imageCache;
            styleImageSize(imgCache, ele, cy);
            });
        } else {
            styleImageSize(imgCache, ele, cy);
        }
        }
    });
}

          