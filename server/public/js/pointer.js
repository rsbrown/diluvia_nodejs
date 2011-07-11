var Pointer = function(controller) {
    var keysDown     = {},
        timeout,
        self         = this;
    this._mouseX     = null;
    this._mouseY     = null;
    this._painting   = false;
    this._controller = controller;
    this[controller.getMode() + "MouseBindings"]();
};

Pointer.prototype = {
  movePlayer: function() {
      var self = this;
      var clickX  = self._mouseX,
          clickY  = self._mouseY;

      var midX = $('#viewport').parent().width()/2,
          midY = ($('#viewport').parent().height()/2)+$('header').height();
      var slope = (clickY-midY)/(clickX-midX);
      if (Math.abs(slope) > 1) {
          if (clickY > midY) {cmd = 's';}
          else               {cmd = 'n';}
      } else {
          if (clickX > midX) {cmd = 'e';}
          else               {cmd = 'w';}

      }
      self._controller.command(cmd);
  },

  editorMouseBindings: function() {
    var self = this;
    $("canvas").mousedown(function(ev) {
        if (ev.which != 1) return true;
        self._painting = true;
        return false;
    });
    
    $(document).mousemove(function(ev){
      if (self._painting) {
        self._controller.editTile(ev.pageX, ev.pageY);
      }
      return false;
     });
    
    $(document).mouseup(function(){
        self._painting = false;
        return false;
    });
    
    $("canvas").click(function(ev) {
        ev.preventDefault();
        self._controller.editTile(ev.pageX, ev.pageY);
        return false;
    });
    
    $("#tile_chooser_link").click(function(ev) {
        ev.preventDefault();
        self._controller.showTileChooser();
    })
    
    $("#layer_chooser_link").click(function(ev) {
        ev.preventDefault();
        self._controller.showLayerChooser();
    })
    
  },

  gameMouseBindings: function() {
    var self = this;
    
    $(document).mousemove(function(ev){
        self._mouseX = ev.pageX;
        self._mouseY = ev.pageY;
     });

    $("canvas").mousedown(function(ev) {
        if (ev.which != 1) return true;

        timeout = setInterval(function(){
            self.movePlayer();
        }, 100);

        return false;
    });

    $("canvas").click(function(ev) {
        ev.preventDefault();
        self.movePlayer();
        return false;
    });

    $(document).mouseup(function(){
        clearInterval(timeout);
        return false;
    });
  }
};
