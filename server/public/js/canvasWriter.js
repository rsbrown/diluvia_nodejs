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
        for (var i = 0; i < 4096; i++) {
            var tile = zonedata[zonestate[0][i]];
            //var row = 0;//    i / 64;
            //var col = 0; //i % 64;
            var row = i / 64;
            var col = i % 64;
            var dest_coords = rowColToPixels(row, col);
            
            console.log(row);
            console.log(col);
            
            drawImage(context, images[tile.img], tile.coords, dest_coords );
           break;
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
    canvas.drawImage(img, img_coords[0], img_coords[1], TILE_DIMS[0], TILE_DIMS[1], dest_coords[0], dest_coords[1], TILE_DIMS[0], TILE_DIMS[1]); 
};
