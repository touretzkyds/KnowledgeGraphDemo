
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

function adjustImageSize(cy) {
    cy.nodes().forEach(function(ele){
        if(ele.json().data.class === 'image' || ele.json().data.class === 'countyImage') {
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

          