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
            //throw "todo";
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
    }

    function startPlatform(game)
    {
        if(!game.dead)
        {
            var p = game.objectMap["movingPlatform"]; 
            p.forward = true;
            p.backward = false;
        }
    }

    function movePlatform(game)
    {
        if(this.backward)
        {
            if(this.y < 310)
            {
                this.backward = false;
                this.forward = false;
            }
            else
            {
                game.moveObjectDown(this, -1);
            }
        }

        if(this.forward)
        {
            if(this.y > 588)
            {
                this.backward = true;
                this.forward = false;
            }
            else
            {
                game.moveObjectDown(this, 4);
            }
        }
    }

    function moveSpike(length, speed)
    {
        return function(game)
        {
            if(this.start === undefined)
            {
                this.start = this.x;
            }

            if(this.backward)
            {
                if(this.x === this.start)
                {
                    this.backward = false;
                    this.forward = false;
                }
                else
                {
                    this.x -= speed;
                }
            }

            if(this.forward)
            {
                if(Math.abs(this.x - this.start) >= length)
                {
                    this.backward = true;
                    this.forward = false;
                }
                else
                {
                    this.x += speed;
                }
            }
        }
    }

    function startObject(id)
    {
        return function(game)
        {
            if(!game.dead)
            {
                var obj = game.objectMap[id];

                obj.forward = true;
                obj.backward = false;
            }
        };
    }

    function tickFunction(game)
    {

    }

    return {

        resourceDir: "res/original/",
        musicDir : "res/music/",

        startPosition: { x: 3, y: 575 },
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


        backgroundColor : "#211",

        images : {
            "gameOver" : "309.png",

            "platform" : "black_platform.png",
            "wall": "1686.png",

            "spikesLeft": "spikes_left.png",
            "spikesRight": "spikes_right.png",

            "yellowGradient": "left_gradient_yellow.png",

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
                blocking: true,
                image: "wall",
                position: [
                    { x: 0, y: range(184, 568, 32) },
                    { x: 280, y: range(184, 600, 32) },

                ]
            },

            {
                image: "yellowGradient",
                position: { x: 0, y: 568 },
            },

            {
                position: { x: -200, y: 600 },
                shape: new Line(0, 0, 1000, 0),
                blocking: true,
            },

            {
                position: { x: -150, y: 400 },
                shape: new Line(0, 0, 0, 400),
                killing: true,
            },


            {
                id: "saveState1",
                position: { x: 166, y: 587 },
                trigger: saveState1,
                shape: new Line(0,0,1,0),
            },

            {
                id: "movingPlatform",
                position: { x: 140, y: 430 },
                image: "platform",
                tickFunction: movePlatform,
                blocking: true,
            },

            {
                position: [
                    { x: 140, y: 599 },
                    { x: 140, y: 290 },
                ],
                shape: new Line(0, 0, 32, 0),
                trigger: startObject("movingPlatform"),
            },


            // spikes on the left
            {
                position: [
                    { x: 270, y: 184 },
                    { x: 270, y: 568 },
                    { x: 270, y: 536 },
                ],
                image: "spikesLeft",
                killing: true,
            },

            {
                position: { x: 270, y: 408 },
                image: "spikesLeft",
                id: "spike1",
                killing: true,
                tickFunction: moveSpike(130, -3),
            },

            {
                position: { x: 0, y: 480 },
                shape: new Rectangle(300, 5),
                trigger: startObject("spike1"),
            },


            {
                position: { x: 270, y: 440 },
                image: "spikesLeft",
                id: "spike2",
                killing: true,
                tickFunction: moveSpike(130, -3),
            },

            {
                position: { x: 0, y: 470 },
                shape: new Rectangle(300, 5),
                trigger: startObject("spike2"),
            },


            {
                position: { x: 270, y: 472 },
                image: "spikesLeft",
                id: "spike3",
                killing: true,
                tickFunction: moveSpike(130, -2),
            },

            {
                position: { x: 0, y: 490 },
                shape: new Rectangle(300, 5),
                trigger: startObject("spike3"),
            },

            {
                position: { x: 270, y: 504 },
                image: "spikesLeft",
                id: "spike4",
                killing: true,
                tickFunction: moveSpike(130, -3),
            },

            {
                position: { x: 0, y: 550 },
                shape: new Rectangle(300, 5),
                trigger: startObject("spike4"),
            },

            // spikes on the right
            {
                position: [
                    { x: 32, y: 536 },
                    { x: 32, y: 504 },
                    { x: 32, y: 440 },
                ],
                image: "spikesRight",
                killing: true,
            },

            {
                position: { x: 32, y: 472 },
                image: "spikesRight",
                id: "spike10",
                killing: true,
                tickFunction: moveSpike(130, 3),
            },

            {
                position: { x: 0, y: 550 },
                shape: new Rectangle(300, 5),
                trigger: startObject("spike10"),
            },

            {
                position: { x: 32, y: 408 },
                image: "spikesRight",
                id: "spike11",
                killing: true,
                tickFunction: moveSpike(90, 5),
            },

            {
                position: { x: 0, y: 480 },
                shape: new Rectangle(300, 5),
                trigger: startObject("spike11"),
            },

            {
                position: { x: 199, y: 580 },
                shape: new Rectangle(20, 20),
                retrigger: true,
                trigger: function() { console.log("test"); },
            },


        ],
    };

})();

