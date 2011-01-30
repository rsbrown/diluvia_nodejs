var Sound = function() {
    this._audios    = {};
    this._loops     = {};
    
    this.addAudio("bgmusic1", "/media/music/beat_music.wav")
    this.addAudio("bgmusic2", "/media/music/dungeon_music.wav")
    this.addAudio("bump", "/media/sounds/bump.mp3")
    this.loopAudio("bgmusic1");
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
        if (!(key in this._loops)) {
            var audio = new Audio(this._audios[key]);
            this._loops[key] = audio;
            audio.loop = true;
            audio.play();
        }
    },
    
    cancelLoops: function() {
        for (key in this._loops) {
            var audio    = this._loops[key];
            
            audio.loop = false;
            audio.pause();
            audio.currentTime = 0;
        }
        
        this._loops = {};
    }
};
