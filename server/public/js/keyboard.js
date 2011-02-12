var KEYCODE_MOVE_COMMANDS = {
    38: "n",
    40: "s",
    39: "e",
    37: "w",
    65: "attack",
    69: "drop",
    9:  "scoreboard"
};

var Keyboard = function(controller) {
    var keysDown    = {},
        chatting    = false,
        sbDown      = false;

    $(window).keydown(function(ev) {
        var kc  = ev.keyCode,
            cmd = KEYCODE_MOVE_COMMANDS[kc];
    
        if (cmd && !chatting) {
            keysDown[kc] = true;
                
            if (cmd == "scoreboard") {
                if (!sbDown) {
                    sbDown = true;
                    controller.command(cmd);
                }
            }
            else {
                controller.command(cmd);
            }
            
            ev.preventDefault();
        }
    });
    
    $(window).keyup(function(ev) {
        var kc  = ev.keyCode,
            cmd = KEYCODE_MOVE_COMMANDS[kc];
        
        if (cmd && !chatting) {
            if (cmd == "scoreboard") {
                controller.hideScoreboard();
                sbDown = false;
            }
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
