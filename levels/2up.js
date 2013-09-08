"use strict";

(function()
{
    function loadState(game, state)
    {
        if(state === 0xbaffbeff)
        {
            //throw "todo";
            game.posX = 350;
            game.posY = 577;
            game.removeObjectById("saveState1");
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


    function saveState2(game)
    {
        game.saveState(0xf0f0b33f);
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

    function moveSpikeLaby1(game)
    {
        if(this.forward)
        {
            if(this.x > 395)
            {
                this.x -= 2;
            }
        }
    }

    function moveSpikeLaby2(game)
    {
        this.x -= Math.rectangle(150)(game.tickCount);
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
        game.viewportX = Math.min(350, Math.max(0, game.posX - 200) * .4 | 0);
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
                    x = game.posX + game.level.characterWidth / 2 - game.viewportX | 0,
                    y = game.posY + game.level.characterHeight / 2 - game.viewportY | 0;

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

            "spikeUp": "small_spike_up.png",
            "spikeLeft": "small_spike_left.png",
            "spikeRight": "small_spike_right.png",
            "spikeDown": "small_spike_down.png",


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

                    { x: range(448, 608, 32), y: 536 },
                    { x: 640, y: 536 },
                    { x: range(384, 660, 32), y: 504 },

                    { x: range(416, 480, 32), y: 440 },
                    { x: range(608, 692, 32), y: 440 },

                    { x: range(416, 692, 32), y: 408 },

                    { x: range(384, 672, 32), y: 314 },
                    { x: range(384, 576, 32), y: 314 },
                    { x: range(384, 448, 32), y: 346 },
                    { x: range(576, 672, 32), y: 346 },

                    { x: range(416, 692, 32), y: 250 },
                    { x: range(384, 660, 32), y: 184 },

                    { x: 768, y: range(184, 280, 32) },

                    { x: 768, y: 568 },

                    { x: range(800, 1200, 32), y: 248 },

                    { x: range(768, 1088, 32), y: [344, 376] },
                    { x: range(768, 1000, 32), y: [472, 504] },

                    { x: 1024, y: range(472, 600, 32) },
                    { x: 1088, y: range(344, 600, 32) },

                ]
            },


            {
                image: "yellowGradientRight",
                position: { x: 0, y: 568 },
            },

            {
                image: "yellowGradientTop",
                position: { x: 1120, y: 568 },
            },

            {
                shape: new Line(0, 0, 0, 350),
                position: { x: 1150, y: 250 },
                blocking: true,
            },

            {
                image: "spikesUp",
                position: [
                    { x: 736, y: 587 },
                    { x: 704, y: 172 },
                    { x: 768, y: 172 },

                    { x: 501, y: 492 },
                    { x: 522, y: 492 },

                    { x: range(1024, 1300, 32), y: 236 },

                    { x: range(800, 1000, 32), y: 588 },

                    { x: 1056, y: 588 },

                ],
                killing: true,
            },

            {
                image: "spikesUp",
                position: [
                    { x: 554, y: 492 },
                ],
                id: "movingSpikesLaby1",
                tickFunction: moveSpikeLaby1,
                killing: true,
            },
            {
                position: { x: 460, y: 490 },
                shape: new Line(0, 0, 1, 0),
                trigger: startObject("movingSpikesLaby1"),
            },

            {
                image: "spikesUp",
                position: [
                    { x: 524, y: 396 },
                ],
                id: "movingSpikesLaby2-1",
                tickFunction: moveSpikeLaby2,
                killing: true,
            },

            {
                image: "spikeUp",
                position: [
                    { x: 621, y: 591 },
                ],
                killing: true,
            },
            {
                image: "spikeDown",
                position: [
                    { x: 393, y: 215 },
                ],
                killing: true,
            },
            {
                image: "spikeLeft",
                position: [
                    { x: 406, y: 264 },
                ],
                killing: true,
            },

            {
                image: "spikeUp",
                position: [
                    { x: 619, y: 238 },
                ],
                blocking: true,
            },


            {
                position: [
                    { x: range(418, 672, 32), y: 279 },
                ],
                image: "spikesDown",
                killing: true,
            },

            {
                position: [
                    { x: 692, y: range(474, 596, 32) },
                    { x: 692, y: range(282, 404, 32) },
                ],
                image: "spikesLeft",
                killing: true,
            },

            {
                position: [
                    { x: 384, y: range(378, 500, 32) },
                ],
                image: "spikesRight",
                killing: true,
            },

            {
                position: { x: -200, y: 600 },
                shape: new Line(0, 0, 1400, 0),
                blocking: true,
            },

            {
                position: { x: -150, y: 400 },
                shape: new Line(0, 0, 0, 400),
                killing: true,
            },


            {
                id: "saveState1",
                position: { x: 406, y: 550 },
                image: "blueOrb",
                trigger: saveState1,
            },


            {
                id: "saveState2",
                position: { x: 406, y: 550 },
                image: "blueOrb",
                trigger: saveState1,
            },


            // platform
            {
                id: "movingPlatform",
                position: { x: 140, y: 430 },
                image: "platform",
                tickFunction: movePlatform,
                blocking: true,
            },
            {
                position: [
                    { x: 100, y: 599 },
                    { x: 150, y: 599 },
                ],
                shape: new Line(0, 0, 1, 0),
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


            // spikes on the right
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
            //new MovingSpike(32, 376, 340, 130, 2),
            //new MovingSpike(32, 408, 400, 90,  5),
            //new MovingSpike(32, 472, 450, 130, 3),

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
            {
                position: { x: 402, y: 588 },
                image: "spikesUp",
                killing: true,
            },


        ],
    };

})();

