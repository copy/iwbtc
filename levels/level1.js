"use strict";

(function()
{
    function spawnSpike(game)
    {
        if(this.spike && this.spike.timer)
        {
            // there is already a spike that is moving
            return;
        }

        this.spike = game.addObject({
            image: "spikeUp",
            killing: true,
            x: this.x,
            y: this.y,
            tickFunction: moveHiddenSpike,
            zIndex: -1,
        });

        this.spike.timer = 64;
    }

    function moveHiddenSpike(game)
    {
        if(this.timer)
        {
            this.y += Math.rectangle(64)(this.timer);
            this.timer--;
        }
        else
        {
            game.removeObject(this);
        }
    }

    function startObject(id)
    {
        return function(game)
        {
            var obj = game.objectMap[id];

            obj.active = true;
            obj.timer = 0;

            // remove the trigger
            game.removeObject(this);
        }
    }

    function movePlatform(game)
    {
        if(this.active)
        {
            if(this.timer % 2 === 0)
            {
                game.moveObjectDown(this, -1);
            }

            if(this.y > 400)
            {
                game.moveObjectRight(this, -Math.rectangle(260)(this.timer + 65));
            }
            else
            {
                game.moveObjectRight(this, 1);
            }

            if(this.x < -40)
            {
                game.removeObject(this);
            }

            this.timer++;
        }
    }

    function movePlatform2(game)
    {
        if(this.active)
        {
            if(this.timer < 95)
            {
                game.moveObjectRight(this, -2);
            }
            else if(this.timer < 185)
            {
                //game.moveObjectDown(this, 
                //        2 * Math.rectangle(85)(this.timer - 95));

                game.moveObjectRight(this, 3);
            }
            else if(this.timer < 325)
            {
                if(this.timer % 2)
                {
                    game.moveObjectDown(this, -1);
                    game.moveObjectRight(this, -1);
                }
            }
            else if(this.timer < 480)
            {
                game.moveObjectRight(this, -2);
            }
            else if(this.timer < 500)
            {
                game.moveObjectDown(this, 6);
            }
            else if(this.timer < 600)
            {
                game.moveObjectDown(this, -1);
                game.moveObjectRight(this, 
                        Math.round(2 * Math.triangle(80)(this.timer)));
            }
            else if(this.timer < 750)
            {
                game.moveObjectRight(this, -1);
            }
            else if(this.timer < 790)
            {
                game.moveObjectDown(this, -1);
            }
            else if(this.timer < 850)
            {

            }
            else if(this.timer < 950)
            {
                game.moveObjectRight(this, 3);
            }
            else if(this.timer < 1000)
            {
                game.moveObjectDown(this, -1);
            }
            else if(this.timer < 1022)
            {
                game.moveObjectRight(this, 4);
            }
            else if(this.timer < 1050)
            {

            }
            else if(this.timer < 1150)
            {
                game.moveObjectDown(this, -1);
            }
            else if(this.timer < 1230)
            {
                game.moveObjectRight(this, 1);
            }
            else if(this.timer < 1300)
            {

            }
            else 
            {
                game.moveObjectRight(this, -Math.ceil((this.timer - 1300) / 18));
            }


            this.timer++;
        }
    }

    function badPlatform(game)
    {
        game.removeObject(this);

    }

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


    function moveApple(game)
    {
        this.y += Math.rectangle(100)(game.tickCount);
    }

    function redOrb(game)
    {
        var f = game.addObject({
            tickFunction: shake,
        });

        f.timer = 0;

        game.removeObject(this);
    }

    function shake(game)
    {
        if(this.timer % 4 === 2)
        {
            game.viewportY -= 2;
        }
        else if(this.timer % 4 === 0)
        {
            game.viewportY += 2;
        }

        if(this.timer % 10 === 0)
        {
            game.objectMap["exitBlock"].y--;
            game.objectMap["exitSpike"].y--;
        }

        this.timer++;
        
        if(this.timer > 1500)
        {
            game.removeObject(this);
        }
    }


    function tickFunction(game)
    {
    }

    function nextLevel(game)
    {
        game.nextLevel("2up.js");

        game.removeObject(this);
    }

    function loadState(game, state)
    {
        if(state === 0xbeeeef)
        {
            game.posY = 224;
            game.posX = 37;
            game.viewportY = 0;

            game.removeObjectById("saveState1");
        }
        else
        {
            console.log("invalid state: " + state);
        }
    }

    function saveState1(game)
    {
        game.saveState(0xbeeeef);
        game.removeObject(this);

        game.audio.play("Mega_Man_Beam_Sound.ogg", false, false);
    }

    return {

        resourceDir: "res/original/",
        musicDir : "res/music/",

        startPosition: { x: 37, y: 900 },
        startViewport: { x: 0, y: 600 },

        width: 900,
        height: 1360,

        characterWidth : 25,
        characterHeight: 21,

        backgroundMusic : "Fire_Man_Stage.ogg",
        deathMusic : "28.ogg",

        jumpMusic1 : "jump1.ogg",
        jumpMusic2 : "jump2.ogg",

        loadState: loadState,

        init: function(game) {},

        //physics : {
        //    jumpInitialSpeed : -1.5,
        //    jumpGravity : .015,
        //    jumpTicks : 400,

        //    fallSpeedCap : 3,
        //    fallGravity : .045,

        //    moveSpeed : 1,

        //    // in ms
        //    timePerTick : 5,
        //},

        physics : {
            jumpInitialSpeed : -5,
            jumpGravity : .15,
            jumpTicks : 100,

            fallSpeedCap : 4.5,
            fallGravity : 0.3,

            moveSpeed : 2,

            timePerTick : 12,
        },


        backgroundColor : "#ddf",

        images : {
            "gameOver" : "309.png",
            1: "338.png",
            3: "5.png",
            "apple": "269.png",

            "gradient": "down_gradient_black.png",


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


        // The list of all objects in the game. Basically speaking, everything is an
        // object. Use this if you want to create the ground, draw an image
        // somewhere and create enemies. Every object is a JS object and can have
        // the following properties:
        //
        // - image:
        //   Optional. An image from the list of images defined above. If left out,
        //   the object is invisible
        //
        // - blocking: 
        //   Optional, default: false. If set to true, the object blocks the player
        //   character, he can stand on it but cannot walk through
        //
        // - killing:
        //   Optional, default: false. If set to true, the object kills the player
        //
        // - trigger:
        //   Optional. A function that is called, when the player enters this
        //   object.  Note: The function will be called on every tick as long as the
        //   player is inside of the object, you have to take care of this for
        //   yourself. If not set, nothing happens when the player is inside of the
        //   object
        //
        // - retrigger: 
        //   Boolean, optional, default false. If set to true, the trigger
        //   function above will be called on every tick, as long as the
        //   character is standing inside of the trigger.  Otherwise, it will
        //   only be called once every time the character enters the trigger.
        //
        // - shape:
        //   Optional if the object has an image. Determines where the object blocks
        //   the player or triggers functions. If left out, the shape is determined
        //   by the non-transparent pixels of the image.
        //   Type: An object with a .getBitmap() method, that returns the shape of
        //   the object as a bitmap.
        //
        // - position:
        //   The position of the object(s). A list of objects  or a single object
        //   with x and y property.  Both coordinates can be a list or a number. If
        //   both are lists, the cartesian product is calculated to determine all
        //   points. Example:
        //   [{x: 3, y: 4}, {x: 9, y: [3,4,5]]
        //   -> [{x: 3, y: 4}, {x: 9, y: 3}, {x: 9, y: 4}, {x: 9, y: 5}, 
        //   [{x: [1,2], y:[1,2]}
        //   -> [{x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, 
        //
        // - dynamic:
        //   Optional, default false. If set to true, the object can be changed or
        //   removed later. It will appear in game.objects. Dynamic objects take
        //   more performance.
        //
        // - id:
        //   Optional. Implies dynamic, you don't have to set dynamic if you give an
        //   id. The object will be exported to level.objectMap[id]
        //
        // - zIndex:
        //   Optional, default 0. Cannot be used on non-static objects. Determines
        //   how objects overlay each other. Objects are drawn in this order:
        //     1. Every dynamic object with a negative zIndex, ordered by zIndex
        //     2. Every non-dynamic object in the order they appear
        //     3. The character
        //     4. Every dynamic object with a positive zIndex, ordered by zIndex
        //
        // - tickFunction:
        //   Optional. A function that gets called on every tick of the game with
        //   this set as the object and the game as first parameter.
        //
        // - init:
        //   Optional. A function that gets called once the game is (re-)started.

        objects : [


            {
                image: 3,
                blocking: true,
                position: [
                    { x: 32, y: 984 },
                    { x: range(0, 800, 32), y: 1168 },
                    { x: 0, y: range(0, 1168, 32) },
                    { x: 768, y: range(0, 1104, 32) },
                    { x: 260, y: [984, 1016] },
                    { x: 32, y: 850 },
                    { x: range(128, 800, 32), y: 384 },
                    { x: [292, 324], y: 1016 },
                    { x: range(292, 420, 32), y: 1016 },
                    { x: 324, y: range(920, 1016, 32) },
                    { x: 206, y: 550 },
                    { x: 32, y: 500 },
                    { x: 32, y: 384 },
                    { x: range(32, 320, 32), y: 0 },
                    { x: range(352, 800, 32), y: 0 },

                    { x: 309, y: 102 },

                    { x: 100, y: 1030 },
                    { x: 544, y: 964 },
                    { x: 132, y: 1030 },
                    { x: 192, y: 1030 },
                    { x: 512, y: 964 },

                ],
            },

            {
                image: "gradient",
                position: { x: 320, y: 0 },
            },

            {
                image: "spikeLeft",
                killing: true,
                position: [
                    { x: 736, y: range(416, 1104, 32) },
                    { x: 96, y: 384 },
                    { x: 736, y: range(32, 356, 32) },
                    { x: 256, y: 250 },
                    { x: 416, y: 108 },
                    { x: 480, y: 224 },
                    { x: 640, y: 160 },
                ],
            },
            {
                image: "spikeRight",
                killing: true,
                position: [
                    { x: 288, y: 250 },
                    { x: 448, y: 108 },
                    { x: 512, y: 224 },
                    { x: 672, y: 160 },
                ],
            },
            {
                image: "spikeDown",
                killing: true,
                position: [
                    { x: range(128, 734, 32), y: 416 },

                    { x: range(32, 320, 32), y: 32 },
                    { x: range(352, 736, 32), y: 32 },
                ]
            },
            {
                image: "spikeUp",
                killing: true,
                position: [
                    { x: range(32, 734, 32), y: 1136 },
                    { x: range(128, 736, 32), y: 352 },
                    { x: [292, 356], y: 984 },
                    { x: 324, y: 890 },
                ],
            },

            {
                trigger: spawnSpike,
                shape: new Line(0, 0, 32, 0),
                position: [
                    { x: 132, y: 1029 },
                    { x: 100, y: 1029 },
                    { x: 192, y: 1029 },
                    { x: 528, y: 963 },
                ],
            },

            {
                image: 3,
                trigger: badPlatform,
                dynamic: true,

                position: [ 
                    { x: 170, y: 168 },
                    { x: 435, y: 70 },
                ]
            },

            {
                dynamic: true,
                trigger: redOrb,
                image: "redOrb",
                position: { x: 317, y: 76 },
            },

            {
                trigger: startObject("platform1"),
                shape: new Line(0, 0, 32, 0),
                position: { x: 690, y: 845 },
            },


            {
                trigger: transitionUp,
                shape: new Line(0, 0, 800, 0),
                position: { x: 0, y: 588 }
            },
            {
                trigger: transitionDown,
                shape: new Line(0, 0, 800, 0),
                position: { x: 0, y: 615 }
            },


            {
                id: "platform1",
                image: "platform2",
                blocking: true,
                position: { x: 700, y: 850 },
                tickFunction: movePlatform,
            },

            {
                id: "platform2",
                image: "platform2",
                blocking: true,
                position: { x: 650, y: 330 },
                tickFunction: movePlatform2,
            },

            {
                trigger: startObject("platform2"),
                position: { x: 300, y: 288 },
                shape: new Line(0, 0, 0, 100),
            },

            //{
            //    image: 3,
            //    dynamic: true,
            //    blocking: true,
            //    position: [
            //        { x: 100, y: 1030 },
            //        { x: 544, y: 964 },
            //        { x: 132, y: 1030 },
            //        { x: 192, y: 1030 },
            //        { x: 512, y: 964 },
            //    ],
            //},

            {
                id: "bottomApple",
                image: "apple",
                killing: true,
                position: { x: 775, y: 1130 }
            },

            {
                dynamic: true,
                trigger: additionalJump,
                image: "jumpOrb",
                position: [
                    { x: [565, 485, 405, 325], y: 500 },
                    { x: [230, 300], y: 310 },
                    { x: 340, y: 275 }, // hard mode:  y: 260
                ],
            },

            {
                dynamic: true,
                killing: true,
                image: "apple",
                tickFunction: moveApple,
                position: { x: 466, y: 880 },
            },

            {
                id: "saveState1",
                trigger: saveState1,
                position: { x: 40, y: 360 },
                image: "blueOrb",
            },

            {
                id: "exitBlock",
                position: { x: 320, y: 0 },
                image: 3,
            },

            {
                id: "exitSpike",
                position: { x: 320, y: 32 },
                image: "spikeDown",
                killing: true,
            },
                
            {
                position: { x: 319, y: -300 },
                blocking: true,
                shape: new Line(0, 0, 0, 300),
            },

            {
                position: { x: 500, y: -300 },
                shape: new Line(0, 0, 0, 300),
                trigger: nextLevel,
            },


        ],
    };

})();

