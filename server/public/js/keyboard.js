var KEYCODE_MOVE_COMMANDS = {
    38: "n",
    40: "s",
    39: "e",
    37: "w"
};

var Keyboard = function(controller) {
    var keysDown = {},
        chatting = false;

    $(window).keydown(function(ev) {
        var kc  = ev.keyCode,
            cmd = KEYCODE_MOVE_COMMANDS[kc];
    
        if (cmd && !chatting) {
            keysDown[kc] = true;
            // controller.commandStart(cmd);
            controller.move(cmd);

            ev.preventDefault();
        }

    });

    $(window).keypress(function(ev) {
        var kc = ev.keyCode;
        
        if (!KEYCODE_MOVE_COMMANDS[kc]) {
            if (kc == 13) { // enter
                if (!chatting) {
                    controller.showChatBox();
                    chatting = true;
                }
                else {
                    controller.sendChatMessageInChatBox();
                    chatting = false;
                }
                
                ev.preventDefault();
            }
        }
    });
};
