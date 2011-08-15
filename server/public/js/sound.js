soundManager.url = '/swf';
soundManager.flashVersion = 9; // optional: shiny features (default = 8)
soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
// enable HTML5 audio support, if you're feeling adventurous. iPad/iPhone will always get this.
// soundManager.useHTML5Audio = true;

var Sound = function() {
    var self = this;
    this._musicOn       = PLAY_MUSIC;
    this._audios        = {};
    this._loops         = {};
    
    soundManager.onready(function() {
        self.addAudio("bump",   "/media/sounds/bump.mp3");
        for (var i=0; i<5; i++) {
          self.addAudio("scream"+i, "/media/sounds/scream"+i+".mp3");
        }
        self.addAudio("portal", "/media/sounds/button-43.mp3");
        self.addAudio("chat",   "/media/sounds/button-22.mp3");
        self.addAudio("ouch",   "/media/sounds/grunt.mp3");
        self.addAudio("sword",  "/media/sounds/sword.mp3");
    });
};

Sound.prototype = {
    addAudio: function(key, src) {
        this._audios[key] = soundManager.createSound({
            id:         key, 
            url:        src,
            autoPlay:   false,
            autoLoad:   true
        });
    },
    
    playAudio: function(key) {
        var audio = this._audios[key];
        
        if (audio) {
            soundManager.onready(function() {
                audio.play();
            });
        }
    },
    
    loopAudio: function(src) {
        if (this._musicOn) {
        
            var self = this;
        
            if (!(src in this._loops)) {
                var audio;
            
                soundManager.onready(function() {
                    var audio = soundManager.createSound({
                        id:         src, 
                        url:        Diluvia.MUSIC_BASE_PATH + src + ".mp3",
                        autoPlay:   false,
                        autoLoad:   true
                    });
                
                    self._loops[src] = audio;
                    audio.play({ loops: 999 });                
                });
            }
            else {
                this._loops[src].play({ loops: 999 });
            }
            
         }
    },
    
    startMusic: function(src) {
        this._musicOn = true;
        this.loopAudio(src);
    },
    
    stopMusic: function() {
        this._musicOn = false;
        this.cancelLoops();
    },
    
    resetLoops: function(src) {
        this.cancelLoops();
        
        if (src) {
            this.loopAudio(src);
        }
    },
    
    cancelLoops: function() {
        for (var src in this._loops) {
            var audio = this._loops[src];
            audio.stop();
        }
        
        this._loops = {};
    }
};
