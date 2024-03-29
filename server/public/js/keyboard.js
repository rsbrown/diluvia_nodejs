var KEYCODE_MOVE_COMMANDS_EDITOR = {
    38:  "n",
    40:  "s",
    39:  "e",
    37:  "w"
};

var KEYCODE_MOVE_COMMANDS = {
    38:  "n",
    40:  "s",
    39:  "e",
    37:  "w",
    65:  "attack",
    69:  "drop",
    192: "suicide",
    9:   "scoreboard"
};

var Keyboard = function(controller) {
  this.keysDown    = {};
  this.paused      = false;
  this.chatting    = false;
  this.sbDown      = false;
  this._controller = controller;
  this[controller.getMode() + "KeyBindings"]();
};

Keyboard.prototype = {
    isDialogOpen: function() {
      $("#dialog").data("dialog").isOpen
    },
  
    editorKeyBindings: function() {
      var self = this;
      
      $(document).bind('keydown', 'ctrl+s meta+s', function(ev){
        if (!self.paused) {
          ev.preventDefault();
          self._controller.saveZoneEdits();
        }
      });

      $(window).keydown(function(ev) {
          var kc  = ev.keyCode,
              cmd = KEYCODE_MOVE_COMMANDS_EDITOR[kc];

          if (!self.paused) {
            switch(kc) {
              case 49: // "1"
                ev.preventDefault();
                self._controller.selectTileEditor();
                break;
              case 50: // "2"
                ev.preventDefault();
                self._controller.selectObjectEditor();
                break;
              // case 51: // "3"
              //   ev.preventDefault();
              //   self._controller.selectActorEditor();
              //   break;
              default:
                if (cmd) {
                    ev.preventDefault();
                    self.keysDown[kc] = true;
                    self._controller.moveEditorView(cmd);
                }
            }
          }
      });
      
      $(window).keyup(function(ev) {
          var kc  = ev.keyCode,
              cmd = KEYCODE_MOVE_COMMANDS_EDITOR[kc];

          if (cmd && !self.paused) {
              self._controller.settleEditorView(cmd);
          }
      });
    },
    
    gameKeyBindings: function() {
      var self = this;
      $(window).keydown(function(ev) {
          var kc  = ev.keyCode,
              cmd = KEYCODE_MOVE_COMMANDS[kc];
          if (cmd && !self.paused) {
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

          if (cmd && !self.paused) {
              if (cmd == "scoreboard") {
                  self._controller.hideScoreboard();
                  self.sbDown = false;
              }
          }
      });

      $(window).keypress(function(ev) {
          var kc = ev.keyCode;

          if (!self.paused && !KEYCODE_MOVE_COMMANDS[kc]) {
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
