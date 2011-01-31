var Sound = function() {
    this._audios    = {};
    this._loops     = {};
    
    this.addAudio("bump",   "/media/sounds/bump.mp3");
    this.addAudio("scream", "/media/sounds/scream.mp3");
    this.addAudio("portal", "/media/sounds/button-43.mp3");
    this.addAudio("chat",   "/media/sounds/button-22.mp3");
};

Sound.prototype = {
    addAudio: function(key, src) {
        this._audios[key] = src;
        new Audio(src); 
    },
    
    playAudio: function(key) {
        // this._audios[key].play();
        var src = this._audios[key];
        var audio = new Audio(src).play();
    },
    
    loopAudio: function(key) {
        var self = this;
        
        if (!(key in this._loops)) {
            var audio = new Audio(this._audios[key]);
            
            this._loops[key] = audio;            
            audio.play();
        }
    },
    
    cancelLoops: function() {
        for (key in this._loops) {
            var audio = this._loops[key];
            audio.play();
            audio.pause(); 
        }
        
        this._loops = {};
    }
};
