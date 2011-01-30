var Sound = function() {
    this._audios    = {};
    this._loops     = {};
    
    this.addAudio("bump",   "/media/sounds/bump.mp3");
    this.addAudio("scream", "/media/sounds/scream1.wav");
};

Sound.prototype = {
    addAudio: function(key, src) {
        // var audio = new Audio(src);
        // this._audios[key] = audio;
        this._audios[key] = src;
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
