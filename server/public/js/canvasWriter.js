var context;
$(document).ready(function() {
  var elem = document.getElementById('viewport');
  if (!elem || !elem.getContext) {
    return;
  }
 
  context = elem.getContext('2d');
});



TILE_DIMS = [64,64];

var zonedata;
var images = {};
var zonestate;
var paint_ok = true;


var parseMessage = function(msg) {
    if (msg) {
//    blockPaint();
    if (msg.type == "ZoneData") {
        zonedata = msg.attrs;
        _.each(_.keys(msg.attrs), function(i) {
            var imgParts = zonedata[i].image.split(':');
            var img = imgParts[0];
            zonedata[i].img = img;
            var rowcol = imgParts[1].split(',');
            zonedata[i].coords = rowColToPixels(parseInt(rowcol[0], 10), parseInt(rowcol[1], 10) );
            
            
            setImage(img);
             
        });
    } else if (msg.type == "ZoneState")  {
        parseZoneState(msg.attrs);
        paint();
    }
//    enablePaint();
    }

};



var setImage = function(img) {
  if (!images[img]) {
      images[img] = new Image();
      images[img].src = 'images/' + img;
  }  
  
  return images[img];
};

var parseZoneState = function(state) {
   zonestate = state;
   
};

var blockPaint = function() {
    paint_ok = false;
};
var enablePaint = function() {
    paint_ok = true;
}

var paint = function() {
    if (paint_ok && zonedata && zonestate) {
        //draw terrain
        //var m = 20;
        var m = 4096;
        for (var i = 0; i < m; i++) {
            var tile = zonedata[zonestate[0][i]];
            var row = parseInt(i / 64, 10);
            var col = i % 64;
            var dest_coords = rowColToPixels(row, col);
            
            //console.log(row);
            //console.log(col);
            
            drawImage(context, images[tile.img], tile.coords, dest_coords );
           //break;
        }
    } else {
        //console.log {zonedata: zonedata, zonestate: zonestate}
        console.log(zonedata);
        console.log("have zonestate with length: " + zonestate.length);
    }
};


var rowColToPixels = function(row, col) {
    return [row * TILE_DIMS[0], col * TILE_DIMS[1] ];
};

var drawImage = function(canvas, img, img_coords, dest_coords) {
    try {
        canvas.drawImage(img, img_coords[0], img_coords[1], TILE_DIMS[0], TILE_DIMS[1], dest_coords[0], dest_coords[1], TILE_DIMS[0], TILE_DIMS[1]); 
    }
    catch(e) {
        console.log(e);
    }
};
