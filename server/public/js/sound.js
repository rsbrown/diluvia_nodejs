var Sound = function() {
    this._audios    = {};
    this._loops     = {};
};

Sound.prototype = {
    addAudio: function(key, src) {
        var audio = new Audio(src);
        this._audios[key] = audio;
    },
    
    playAudio: function(key) {
        this._audios[key].play();
    },
    
    loopAudio: function(key) {
        if (!(key in this._loops)) {
            var audio = this._audios[key];
            
            this._loops[key] = true;
            
            audio.loop = true;
            audio.play();
        }
    },
    
    cancelLoops: function() {
        for (key in this._loops) {
            var loop    = this._loops[key],
                audio   = this._audios[key];
            
            audio.loop = false;
            audio.pause();
            audio.currentTime = 0;
        }
        
        this._loops = {};
    }
};
