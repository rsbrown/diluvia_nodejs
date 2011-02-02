var Pointer = function(controller) {
    var keysDown = {},
        chatting = false;

    $("canvas").click(function(ev) {
        var clickX  = ev.pageX,
            clickY  = ev.pageY;
            
        var midX = $('#viewport').parent().width()/2,
            midY = ($('#viewport').parent().height()/2)+$('header').height();
        
        var slope = (clickY-midY)/(clickX-midX);
        if (Math.abs(slope) > 1) {
            if (clickY > midY) {controller.move('s');}
            else               {controller.move('n');}
        } else {
            if (clickX > midX) {controller.move('e');}
            else               {controller.move('w');}
            
        }
        ev.preventDefault();
    });
};
