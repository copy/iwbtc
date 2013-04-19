"use strict";

(function()
{

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

    function movePlatform(game)
    {
        if(this.backward)
        {
            if(this.y <= 300)
            {
                this.backward = false;
                this.forward = true;
            }
            else
            {
                game.moveObjectDown(this, -1);
            }
        }
        
        if(this.forward)
        {
            game.moveObjectDown(this, 4);

            if(this.y === 460)
            {
                this.backward = false;
                this.forward = false;
            }
            else if(this.y > 588)
            {
                this.backward = true;
                this.forward = false;
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
                var obj = game.objectMap[id] || id;

                obj.forward = true;
                obj.backward = false;
            }
        };
    }

    function tickFunction(game)
    {
        game.viewportX = Math.max(0, game.posX) / 3 | 0;
    }

    // the spikes in the first part of the game
    function MovingSpike(posX, posY, triggerY, moveLength, speed)
    {
        this.position = { x: posX, y: posY };
        this.image = speed < 0 ? "spikesLeft" : "spikesRight";
        this.killing = true;
        this.tickFunction = moveSpike(moveLength, speed);
        this.dynamic = true;

        this.init = function(game)
        {
            game.addObject({
                x: 0, 
                y: triggerY,
                shape: new Rectangle(300, 100),
                trigger: startObject(this),
            });
        };
    }


    return {

        resourceDir: "res/original/",
        musicDir : "res/music/",

        startPosition: { x: 3, y: 575 },
        startViewport: { x: 0, y: 0 },

        width: 1200,
        height: 600,

        characterWidth : 25,
        characterHeight: 21,

        backgroundMusic : "Fire_Man_Stage.ogg",
        deathMusic : "28.ogg",

        jumpMusic1 : "jump1.ogg",
        jumpMusic2 : "jump2.ogg",

        loadState: loadState,

        init : function(game) 
        {
            var canvas = document.createElement("canvas"),
                context;

            canvas.width = game.width;
            canvas.height = game.height;
            context = canvas.getContext("2d");

            game.addDrawHook(function(game)
            {
                return;
                var renderer = game.renderer,
                    x = game.posX + game.level.characterWidth / 2 | 0,
                    y = game.posY + game.level.characterHeight / 2 | 0;

                context.clearRect(0, 0, game.width, game.height);

                var g = context.createRadialGradient(x, y, 0, x, y, 200);
                g.addColorStop(1, 'rgba(0,0,0,.95)');
                g.addColorStop(0, 'rgba(0,0,0,0)');

                context.fillStyle = g;
                context.fillRect(0, 0, game.width, game.height);

                renderer.context.drawImage(canvas, 0, 0);
            });
        
        },


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
            "spikesUp": "spikes_up.png",
            "spikesDown": "spikes_down.png",

            "yellowGradientLeft": "left_gradient_yellow.png",
            "yellowGradientRight": "right_gradient_yellow.png",
            "yellowGradientTop": "top_gradient_yellow.png",

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
                    { x: 352, y: range(184, 568, 32) },

                    { x: 704, y: range(184, 600, 32) },
                    { x: 768, y: range(184, 536, 32) },
                    { x: 768, y: 568 },

                    { x: range(384, 660, 32), y: 536 },
                    { x: range(384, 660, 32), y: 504 },

                    { x: range(416, 692, 32), y: 440 },
                    { x: range(416, 692, 32), y: 408 },

                    { x: range(384, 660, 32), y: 346 },
                    { x: range(384, 660, 32), y: 314 },

                    { x: range(416, 692, 32), y: 250 },
                    { x: range(384, 660, 32), y: 184 },

                ]
            },


            {
                image: "yellowGradientRight",
                position: { x: 0, y: 568 },
            },

            {
                image: "spikesUp",
                position: { x: 736, y: 587 },
                killing: true,
            },

            {
                position: { x: -200, y: 600 },
                shape: new Line(0, 0, 720, 0),
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
                    //{ x: 140, y: 290 },
                ],
                shape: new Line(0, 0, 32, 0),
                trigger: startObject("movingPlatform"),
            },


            // spikes on the left
            {
                position: [
                    { x: 270, y: 184 },
                    { x: 270, y: 216 },
                    { x: 270, y: 568 },
                    { x: 270, y: 536 },
                ],
                image: "spikesLeft",
                killing: true,
            },


            new MovingSpike(270, 248, 210, 110, -1),
            new MovingSpike(270, 280, 230, 110, -2),
            new MovingSpike(270, 312, 240, 110, -3),
            new MovingSpike(270, 344, 270, 70,  -1),
            new MovingSpike(270, 376, 270, 130, -3),
            new MovingSpike(270, 408, 380, 130, -3),
            new MovingSpike(270, 440, 370, 130, -3),
            new MovingSpike(270, 472, 390, 130, -2),
            new MovingSpike(270, 504, 450, 130, -3),


            {
                position: [
                    { x: 32, y: 184 },
                    { x: 32, y: 216 },
                    { x: 32, y: 536 },
                    { x: 32, y: 504 },
                    { x: 32, y: 440 },
                ],
                image: "spikesRight",
                killing: true,
            },


            new MovingSpike(32, 248, 310, 90,  3),
            new MovingSpike(32, 280, 330, 140, 2),
            new MovingSpike(32, 312, 330, 170, 1),
            new MovingSpike(32, 344, 370, 70,  2),
            new MovingSpike(32, 376, 340, 130, 2),
            new MovingSpike(32, 408, 400, 90,  5),
            new MovingSpike(32, 472, 450, 130, 3),

            // tunnel
            {
                position: { x: 312, y: range(184, 600, 32) },
                image: "spikesRight",
                killing: true,
            },
            {
                position: { x: 342, y: range(184, 568, 32) },
                image: "spikesLeft",
                killing: true,
            },


            {
                position: { x: range(352, 660, 32), y: 171 },
                image: "spikesUp",
                killing: true,
            },


        ],
    };

})();

