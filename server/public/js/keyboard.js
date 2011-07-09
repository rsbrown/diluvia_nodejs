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
  this.keysDown    = {},
  this.chatting    = false,
  this.sbDown      = false;
  this._controller = controller;
  this[controller.getMode() + "KeyBindings"]();
};

Keyboard.prototype = {
    editorKeyBindings: function() {
      var self = this;
      $(window).keydown(function(ev) {
          var kc  = ev.keyCode,
              cmd = KEYCODE_MOVE_COMMANDS[kc];
          if (cmd && kc < 65) {
              self.keysDown[kc] = true;
              self._controller.command(cmd);
              ev.preventDefault();
          }
      });
    },
    
    worldKeyBindings: function() {
      var self = this;
      $(window).keydown(function(ev) {
          var kc  = ev.keyCode,
              cmd = KEYCODE_MOVE_COMMANDS[kc];

          if (cmd && !self.chatting) {
              self.keysDown[kc] = true;

              if (cmd == "scoreboard") {
                  if (!self.sbDown) {
                      self.sbDown = true;
                      self._controller.command(cmd);
                  }
              }
              else {
                  self._controller.command(cmd);
              }

              ev.preventDefault();
          }
      });

      $(window).keyup(function(ev) {
          var kc  = ev.keyCode,
              cmd = KEYCODE_MOVE_COMMANDS[kc];

          if (cmd && !self.chatting) {
              if (cmd == "scoreboard") {
                  self._controller.hideScoreboard();
                  self.sbDown = false;
              }
          }
      });

      $(window).keypress(function(ev) {
          var kc = ev.keyCode;

          if (!KEYCODE_MOVE_COMMANDS[kc]) {
              if (kc == 13) { // enter
                  if (!self.chatting) {
                      self._controller.showChatBox();
                      self.chatting = true;
                  }
                  else {
                      self._controller.sendChatMessageInChatBox();
                      self.chatting = false;
                  }

                  ev.preventDefault();
              }
          }
      });
    }
}
