"use strict";

/** 
 * @constructor 
 */
function AudioManager(enabled)
{
    this.muted = !enabled;
    this.works = true;

    if(!window.Audio)
    {
        this.works = false;
    }
    // save the planet, use ogg/vorbis
    else if(!new Audio().canPlayType("audio/ogg; codecs=vorbis"))
    {
        this.works = false;
    }
    //this.works = false;

    this.playing = [];

    // files that are enqueued when the game is muted, so
    // they can be played as soon as someone unmutes
    this.playQueue = [];
}

/**
 * @param {boolean=} loop
 * @param {boolean=} once
 * @param {number=} volume
 * @param {number=} startTime
 */
AudioManager.prototype.play = function(file, loop, once, volume, startTime)
{
    if(!this.works)
    {
        return;
    }

    if(this.muted)
    {
        this.playQueue.push([new Date, Array.toArray(arguments)]);
        return;
    }

    var existing = this.playing.filter(Function.byIndex("file", file)),
        audioObject = existing.find(playable),
        audio;

    function playable(obj)
    {
        return (obj.audio.ended || obj.audio.paused) != !!once;
    }

    if(audioObject)
    {
        // if the audio ended and can be player more than once
        // OR it's running and shouldn't be played more than once,
        // restart it
        audio = audioObject.audio;
    }
    else
    {
        audio = new Audio(this.path + file);

        this.playing.push({
            audio: audio,
            file: file,
        });
    }

    var dontPlay = false;

    if(startTime !== undefined)
    {
        // audio.duration is NaN if it's not known yet, so this
        // check should be safe
        if(audio.duration && (audio.duration < startTime))
        {
            // we're too late
            dontPlay = true;
        }
    }
    else
    {
        startTime = 0;
    }

    if(!dontPlay)
    {
        if(volume !== undefined)
        {
            audio.volume = volume;
        }

        if(audio.readyState < 4)
        {
            audio.addEventListener("loadedmetadata", function()
            {
                audio.currentTime = startTime;
            });
        }
        else
        {
            audio.currentTime = startTime;
        }

        audio.loop = loop;
        audio.play();
    }
};

/**
 * @param {function()=} onload
 * @param {function()=} onerror
 */
AudioManager.prototype.preload = function(file, onload, onerror)
{
    // no check is made if the game is muted

    if(this.works && !this.muted)
    {
        var existing = this.playing.find(Function.byIndex("file", file));

        if(existing)
        {
            if(onload)
            {
                setTimeout(onload, 0);
            }
            return;
        }

        var audio = new Audio(this.path + file);

        audio.muted = this.muted;

        if(onload)
        {
            audio.addEventListener("canplaythrough", onload);
            
            if(onerror)
            {
                audio.addEventListener("error", onerror);
            }
        }

        audio.load();

        this.playing.push({
            audio: audio,
            file: file,
        });

        return audio;
    }
    else
    {
        setTimeout(onload, 0);
    }
};

AudioManager.prototype.stop = function(file)
{
    if(this.works)
    {
        var audioObjs = this.playing.filter(Function.byIndex("file", file));

        audioObjs.forEach(stop);
    }

    function stop(obj)
    {
        obj.audio.pause();
        //obj.currentTime = 0;
    }
};

AudioManager.prototype.toggleMute = function()
{
    if(this.works)
    {
        var muted = this.muted = !this.muted;

        this.playing.forEach(setMute);
    }

    if(!this.muted)
    {
        var self = this;

        this.playQueue.forEach(function(args)
        {
            args[1][4] = (Date.now() - args[0]) / 1000;
            self.play.apply(self, args[1]);
        });

        this.playQueue = [];
    }

    function setMute(audioObj)
    {
        audioObj.audio.muted = muted;
    }
};


