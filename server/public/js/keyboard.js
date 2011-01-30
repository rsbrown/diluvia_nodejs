var KEYCODE_COMMANDS = {
    38: "n",
    40: "s",
    39: "e",
    37: "w"
};

var Keyboard = function(controller) {
    var keysDown = {};

    $(window).keydown(function(ev) {
        var kc = ev.keyCode;
    
        // if (!keysDown[kc]) {
              var cmd = KEYCODE_COMMANDS[kc];
    
              if (cmd) {
                  keysDown[kc] = true;
                  // controller.commandStart(cmd);
                  controller.move(cmd);
              }
        // }
    
        ev.preventDefault();
    });
    
    /*
    $(window).keyup(function(ev) {
        var kc  = ev.keyCode;
    
        delete keysDown[kc];
    
        var cmd = KEYCODE_COMMANDS[kc];
    
        if (cmd) {
            controller.commandEnd(cmd);
        }
    
        ev.preventDefault();
    });
    */
    
    // $(window).keydown(function(ev) {
    //     var kc  = ev.keyCode;
    //     var cmd = KEYCODE_COMMANDS[kc];
    // 
    //     if (cmd) {
    //         controller.command(cmd);
    //     }
    // 
    //     ev.preventDefault();        
    // });
};
