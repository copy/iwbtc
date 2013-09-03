"use strict";


/** @constructor */
function GameStorage(gameVersion)
{
    this.works = true;
    this.tempStorage = {};

    try {
        if(!localStorage.getItem("version"))
        {
            localStorage.setItem("version", gameVersion);

            if(!localStorage.getItem("version"))
            {
                throw "grenade";
            }
        }
    }
    catch(e)
    {
        this.works = false;
    }

    if(this.works)
    {
        if(Number(localStorage.getItem("version")) !== gameVersion)
        {
            localStorage.clear();
            console.log("Storage cleared because of game update to version " + gameVersion);
        }
    }
    else
    {
        this.setItem("version", gameVersion);
    }
}

GameStorage.prototype.setItem = function(key, value)
{
    var storageValue = JSON.stringify(value);

    if(this.works)
    {
        localStorage.setItem(key, storageValue);
    }
    else
    {
        this.tempStorage[key] = storageValue;
    }
};

GameStorage.prototype.removeItem = function(key)
{
    if(this.works)
    {
        localStorage.removeItem(key);
    }
    else
    {
        delete this.tempStorage[key];
    }
};

GameStorage.prototype.getItem = function(key)
{
    if(this.works)
    {
        // returns null if key is not defined
        return JSON.parse(localStorage.getItem(key));
    }
    else
    {
        if(this.tempStorage[key])
        {
            return JSON.parse(this.tempStorage[key]);
        }
        else
        {
            return null;
        }
    }
}
