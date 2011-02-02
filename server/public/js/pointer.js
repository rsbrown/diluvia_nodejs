var Pointer = function(controller) {
    var keysDown   = {},
        timeout,
        self       = this;
    this._mouseX   = null;
    this._mouseY   = null;
    
    this.movePlayer = function() {
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
        controller.command(cmd);
    }

    $(document).mousemove(function(ev){
        self._mouseX = ev.pageX;
        self._mouseY = ev.pageY;
     });

    $("canvas").mousedown(function(ev) {
        if (event.which != 1) return true;
        
        timeout = setInterval(function(){
            self.movePlayer();
        }, 100);
        
        return false;
    });
    
    $("canvas").click(function(ev) {
        self.movePlayer();
        return false;
    });
    
    $(document).mouseup(function(){
        clearInterval(timeout);
        return false;
    });
};
