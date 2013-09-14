"use strict";

var KEY_UP = 38,
    KEY_DOWN = 40,
    KEY_LEFT = 37,
    KEY_RIGHT = 39,
    KEY_JUMP = 32,
    KEY_RESTART = 82,
    KEY_MUTE = 77,
    KEY_SHOOT = 84,
    KEY_SUICIDE = 81;


var KBD_STORAGE_KEY = "keyboard_settings";

/** @constructor */
function KeyboardManager(game)
{
    this.keysPressed = {};
    this.keyWasPressed = {};
    this.game = game;

    var fromSettings = game.storage.getItem(KBD_STORAGE_KEY);

    if(fromSettings)
    {
        this.gameKeys = fromSettings;
    }
    else
    {
        this.resetKeys();
    }

    window.addEventListener("keydown", this.onkeydown.bind(this), false);
    window.addEventListener("keyup", this.onkeyup.bind(this), false);

    window.addEventListener("blur", this.onblur.bind(this), false);

    var self = this;

    var click_count = 0;

    document.getElementById("reset_keys").addEventListener("click",
        function()
        {
            this.textContent = [
                "Done.", 
                "Keys resetted.",
                "You keep failing at this, huh?", 
                "undefined", 
                "Just kidding.", 
                "Bored?",
                "Okay ...",
                "There once was a girl from Kentucky ..."
            ][click_count++];

            if(click_count === 8)
            {
                location.href = "https://www.youtube.com/watch?v=oHg5SJYRHA0";
            }

            self.resetKeys();
            self.saveSettings();
        }, false);

    [
        ["left", KEY_LEFT], 
        ["right", KEY_RIGHT], 
        ["shoot", KEY_SHOOT], 
        ["jump", KEY_JUMP],
        ["mute", KEY_MUTE], 
        ["restart", KEY_RESTART],
    ].forEach(addKeyChanger);

    function addKeyChanger(key)
    {
        var name = key[0],
            keyNumber = key[1],
            id = "change_" + name,
            element = document.getElementById(id),
            keyField = document.getElementById("keys"),
            msgField = document.getElementById("press_key_msg");

        element.addEventListener("click", function()
        {
            keyField.style.display = "none";
            msgField.style.display = "block";

            window.addEventListener("keydown", function changeKey(e)
            {
                if(e.which === 27)
                {
                    // escape
                }
                else
                {
                    Object.deleteByValue(self.gameKeys, keyNumber);

                    self.gameKeys[e.which] = keyNumber;
                    self.saveSettings();
                }

                window.removeEventListener("keydown", changeKey, false);
                keyField.style.display = "block";
                msgField.style.display = "none";

                e.preventDefault();

            }, false);
        }, false);
    }
};

KeyboardManager.prototype.resetKeys = function()
{
    this.gameKeys = {
        38: KEY_UP,
        40: KEY_DOWN,
        37: KEY_LEFT,
        39: KEY_RIGHT,
        32: KEY_JUMP,
        82: KEY_RESTART,
        77: KEY_MUTE,
        84: KEY_SHOOT,
        81: KEY_SUICIDE,
    };
};

KeyboardManager.prototype.saveSettings = function()
{
    this.game.storage.setItem(KBD_STORAGE_KEY, this.gameKeys);
};

KeyboardManager.prototype.isValid = function(e)
{
    return !(
            e.ctrlKey || e.altKey || e.metaKey || 
            e.target instanceof HTMLTextAreaElement ||
            e.target instanceof HTMLInputElement ||
            !this.gameKeys[e.which]
        );
};

KeyboardManager.prototype.onkeydown = function(e)
{
    if(this.keysPressed[e.which])
    {
        e.preventDefault();
    }
    else if(this.isValid(e))
    {
        this.keysPressed[e.which] = true;
        this.handleKey(false, e.which);
        e.preventDefault();
    }
}

KeyboardManager.prototype.onkeyup = function(e)
{
    if(this.isValid(e))
    {
        this.keysPressed[e.which] = false;
        this.handleKey(true, e.which);
        e.preventDefault();
    }
}

KeyboardManager.prototype.onblur = function()
{
    var keys = Object.keys(this.keysPressed);

    for(var i = 0; i < keys.length; i++)
    {
        var key = keys[i];

        if(this.keysPressed[key])
        {
            this.handleKey(true, Number(key));
        }
    }

    this.keysPressed = {};
}

KeyboardManager.prototype.handleKey = function(is_up, keyCode)
{
    var code = this.gameKeys[keyCode];

    if(code === KEY_MUTE)
    {
        if(!is_up)
        {
            this.game.toggleMute();
        }
    }
    else if(code === KEY_RESTART)
    {
        if(!is_up)
        {
            this.game.restart();
        }
    }
    if(code === KEY_SUICIDE)
    {
        if(!is_up)
        {
            this.game.die();
        }
    }
    else
    {
        this.keyWasPressed[code] = !is_up;
    }
};

