var pointerTimeout;

var Pointer = function(controller) {
    var keysDown     = {},
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
    
    $("#zone-selector").change(function(){
      self._controller.switchZone($(this).val());
    });
    
    $("canvas").click(function(ev) {
      ev.preventDefault();
      self._controller.editTile(ev.pageX, ev.pageY);
    });
    
    $("canvas").mousemove(function(ev) {
      self._controller.hoverTile(ev.pageX, ev.pageY);
    });
    
    $("#edit_menu a").hover(
      function() {
        $("#menu-info").html($(this).data("info"));
      },
      function() {
        $("#menu-info").html("");
      }
    );
    
    $("#eraser_link").click(function(ev){
      ev.preventDefault();
      $(this).parent().find("img.selected").removeClass("selected")
      $(this).find("img").addClass("selected");
      self._controller.selectEraser();
    });
    
    $("#edit_zone_link").click(function(ev) {
      ev.preventDefault();
      self._controller.showZoneEditor();
    });
      
    $("#tile_chooser_link").click(function(ev) {
        ev.preventDefault();
        $(this).parent().find("img.selected").removeClass("selected")
        $(this).find("img").addClass("selected");
        self._controller.showTileChooser();
    });
    
    $("#layer_chooser_link").click(function(ev) {
        ev.preventDefault();
        $(this).parent().find("img.selected").removeClass("selected")
        $("#tile_chooser_link").find("img").addClass("selected");
        self._controller.showLayerChooser();
    });

    $("#portal_edit_link").click(function(ev) {
        ev.preventDefault();
        $(this).parent().find("img.selected").removeClass("selected")
        $(this).find("img").addClass("selected");
        self._controller.startPortalEditing();
    });
    
  },

  gameMouseBindings: function() {
    var self = this;
    
    $(document).mousemove(function(ev){
        self._mouseX = ev.pageX;
        self._mouseY = ev.pageY;
     });

    $("canvas").mousedown(function(ev) {
        if (ev.which != 1) return true;

        pointerTimeout = setInterval(function(){
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
        clearInterval(pointerTimeout);
        return false;
    });
  }
};
