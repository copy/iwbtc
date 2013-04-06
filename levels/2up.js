"use strict";

(function()
{

    function transitionUp(game)
    {
        if(game.viewportY === 600)
        {
            game.viewportY = 0;
        }
    }

    function transitionDown(game)
    {
        if(game.viewportY === 0)
        {
            game.viewportY = 600;
        }
    }

    function additionalJump(game)
    {
        game.canJump = true;
        game.removeObject(this);

        game.audio.play("Mega_Man_Blast_Sound.ogg");
    }



    function loadState(game, state)
    {
        if(state === 0xbaffbeff)
        {
            throw "todo";
        }
        else
        {
            console.log("invalid state: " + state);
        }
    }

    function saveState1(game)
    {
        game.saveState(0xbaffbeff);
        game.removeObject(this);

        game.audio.play("Mega_Man_Beam_Sound.ogg", false, false);
    }

    function tickFunction(game)
    {

    }

    return {

        resourceDir: "res/original/",
        musicDir : "res/music/",

        startPosition: { x: 37, y: 200 },
        startViewport: { x: 0, y: 0 },

        width: 2400,
        height: 600,

        characterWidth : 25,
        characterHeight: 21,

        backgroundMusic : "Fire_Man_Stage.ogg",
        deathMusic : "28.ogg",

        jumpMusic1 : "jump1.ogg",
        jumpMusic2 : "jump2.ogg",

        loadState: loadState,


        physics : {
            jumpInitialSpeed : -5,
            jumpGravity : .15,
            jumpTicks : 100,

            fallSpeedCap : 4.5,
            fallGravity : 0.3,

            moveSpeed : 2,

            timePerTick : 12,
        },


        backgroundColor : "#111",

        images : {
            "gameOver" : "309.png",
            1: "338.png",
            3: "5.png",
            "apple": "269.png",


            "charR1": "1.png",
            "charR2": "2.png",
            "charR3": "3.png",
            "charR4": "4.png",
            "charL1": "18.png",
            "charL2": "19.png",
            "charL3": "20.png",
            "charL4": "21.png",

            "charMR1": "250.png", 
            "charMR2": "247.png", 
            "charMR3": "251.png", 
            "charMR4": "249.png", 
            "charMR5": "252.png", 
            "charMR6": "250.png", 

            "charML1": "255.png", 
            "charML2": "248.png", 
            "charML3": "256.png", 
            "charML4": "248.png", 
            "charML5": "257.png", 
            "charML6": "255.png", 
                                  
            "charFR1": "14.png",  
            "charFR2": "15.png",  
            "charFL1": "17.png",
            "charFL2": "16.png",

            "charJumpingLeft" : "7.png",
            "charJumpingRight" : "12.png",

            "charHitmap": "char_hitmap.png",

            "spikeUp": "161.png",
            "spikeLeft": "163.png",
            "spikeRight": "162.png",
            "spikeDown": "164.png",

            "platform": "259.png",
            "platform2": "341.png",

            "jumpOrb": "844.png",
            "redOrb": "red_orb.png",
            "blueOrb": "blue_orb.png",
        },

        animations : {

            "charFallingLeft" : {
                time : 2,
                images : ["charFL1", "charFL2"],
            },
            "charFallingRight" : {
                time : 2,
                images : ["charFR1", "charFR2"],
            },

            "charRight" : {
                time : 6,
                images : ["charR1", "charR2", "charR3", "charR4"],
            },
            "charLeft" : {
                time : 6,
                images : ["charL1", "charL2", "charL3"],
            },

            "charMovingRight" : {
                time : 2,
                images : ["charMR1", "charMR2", "charMR3", "charMR4", "charMR5", "charMR6"],
            },
            "charMovingLeft" : {
                time : 2,
                images : ["charML1", "charML2", "charML3", "charML4", "charML5", "charML6"],
            },
        },

        tickFunction : tickFunction,

        objects : [

            {
                position: { x: 0, y: 600 },
                shape: new Line(0, 0, 800, 0),
                blocking: true,
            }
        ],
    };

})();

