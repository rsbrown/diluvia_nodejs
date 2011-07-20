var pointerTimeout;

var Pointer = function(controller) {
    var keysDown     = {},
        self         = this;
    this._mouseX     = null;
    this._mouseY     = null;
    this._painting   = false;
    this._scrolling  = false;
    this._controller = controller;
    this[controller.getMode() + "MouseBindings"]();
};

Pointer.prototype = {
  
  getDirectionFromMouse: function() {
    var self = this,
        cmd  = null,
        clickX  = self._mouseX,
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
    return cmd;
  },

  editorMouseBindings: function() {
    var self = this;

    $("canvas").mousedown(function(ev) {
      if (ev.which != 1) return true;
      self._painting = true;
      return false;
    });
    
    $("canvas").mousemove(function(ev){
      self._mouseX = ev.pageX;
      self._mouseY = ev.pageY;
      if (self._painting) {
        self._controller.editTile(ev.pageX, ev.pageY);
      } else {
        self._controller.hoverTile(ev.pageX, ev.pageY);
      }
     });
    
    $("canvas").mouseup(function(){
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
    
    $("#edit_menu a").hover(
      function() {
        $("#menu-info").html($(this).data("info"));
      },
      function() {
        $("#menu-info").html("");
      }
    );
    
    $("#edit_zone_link").click(function(ev) {
      ev.preventDefault();
      self._controller.showZoneEditor();
    });

    $("#eraser_link").click(function(ev){
      ev.preventDefault();
      $("#editor_dashboard").find("img.selected").removeClass("selected")
      $(this).find("img").addClass("selected");
      self._controller.selectEraser();
    });
    
    $("#tile_chooser_link").click(function(ev) {
        ev.preventDefault();
        self._controller.showTileChooser();
    });
    
    $("#tile_edit_link").click(function(ev) {
        ev.preventDefault();
        $("#editor_dashboard").find("img.selected").removeClass("selected")
        $(this).find("img").addClass("selected");
        self._controller.selectEditLayer(Diluvia.LAYERS.BASE);
    });

    $("#object_edit_link").click(function(ev) {
        ev.preventDefault();
        $("#editor_dashboard").find("img.selected").removeClass("selected")
        $(this).find("img").addClass("selected");
        self._controller.selectEditLayer(Diluvia.LAYERS.OBJECT);
    });

    $("#actor_edit_link").click(function(ev) {
        ev.preventDefault();
        $("#editor_dashboard").find("img.selected").removeClass("selected")
        $(this).find("img").addClass("selected");
        self._controller.selectEditLayer(Diluvia.LAYERS.ACTOR);
    });
    
    $("#portal_edit_link").click(function(ev) {
        ev.preventDefault();
        $("#editor_dashboard").find("img.selected").removeClass("selected")
        $(this).find("img").addClass("selected");
        self._controller.startPortalEditing();
    });
    
    $("#spawn_edit_link").click(function(ev) {
        ev.preventDefault();
        $("#editor_dashboard").find("img.selected").removeClass("selected")
        $(this).find("img").addClass("selected");
    });  

    $("#zoom_out_link").click(function(ev) {
        ev.preventDefault();
        self._controller.zoomOutEditor();
    });
    
    $("#zoom_in_link").click(function(ev) {
        ev.preventDefault();
        self._controller.zoomInEditor();
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
          self._controller.command(self.getDirectionFromMouse());
        }, 100);

        return false;
    });

    $("canvas").click(function(ev) {
        ev.preventDefault();
        self._controller.command(self.getDirectionFromMouse());
        return false;
    });

    $(document).mouseup(function(){
        clearInterval(pointerTimeout);
        return false;
    });
  }
};
