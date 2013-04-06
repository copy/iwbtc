"use strict";


var RIGHT = 0,
    LEFT = 1;
    
var NOT_FALLING = 0,
    IN_JUMP = 1,
    FALLING = 2;


var GAME_WIDTH = 800,
    GAME_HEIGHT = 600;

var FIRST_LEVEL = "level1.js",
    LEVEL_DIR = "levels/";


var STORAGE_USE_AUDIO = "use_audio",
    STORAGE_LEVEL = "last_level",
    STORAGE_STATE = "state";


window.addEventListener("load", function() 
{ 
    var ge = new GameEngine; 

    if(location.host === "localhost" && window.LevelEditor)
    {
        new LevelEditor(ge);
    }

}, false);


/** @constructor */
function GameEngine()
{
    this.version = .01;

    this.width = GAME_WIDTH;
    this.height = GAME_HEIGHT;

    window.ge = this;
    
    this.storage = new GameStorage(this.version);

    if(!this.storage.works)
    {
        dbg_warn("localStorage not supported. Your game will not be saved.");
    }

    this.keyboard = new KeyboardManager(this);
    this.renderer = new GameRenderer(this);

    this.audio = new AudioManager(!!this.storage.getItem(STORAGE_USE_AUDIO));

    if(!this.audio.works)
    {
        dbg_warn("Your browser does not support HTML5 audio or ogg/vorbis");
    }
    
    this.viewportX = null;
    this.viewportY = null;

    this.posX = null;
    this.posY = null;
    
    this.lastTick = Date.now();
    this.totalDelta = 0;

    this.tickCount = null;

    this.fallingState = null;
    this.canJump = null;
    this.direction = null;
    
    // fall speed (vertical)
    this.vspeed = null;

    // bitmap of where the character can be hit
    this.charBitmap = null;


    this.objects = null;
    this.objectMap = null;
    this.triggeringObjects = null;
    this.blockingObjects = null;
    this.drawableObjects = null;


    // is the character moving, used for animating
    this.isMoving = null;

    // loaded images
    this.images = {};

    // information populated by the level scripter
    this.gameData = null;

    this.levelFile = this.storage.getItem(STORAGE_LEVEL);

    if(!this.levelFile)
    {
        this.levelFile = FIRST_LEVEL;
    }

    this.loadLevel(this.levelFile);

}

GameEngine.prototype.loadLevel = function(file)
{
    var self = this;

    http_get(LEVEL_DIR + file + "?" + Math.random(), function(result)
    {
        var level = eval(result);

        if(!level)
        {
            throw "level not found";
        }

        self.level = level;

        self.initLevel(level);
    });
};

GameEngine.prototype.start = function()
{
    this.charBitmap = Bitmap.fromImage(this.images["charHitmap"]);

    this.dead = false;

    // everything else is initialized there:
    this.restart();

    if(!this.running)
    {
        this.running = true;
        this.doTick(this);
    }
};

GameEngine.prototype.restart = function()
{
    this.viewportX = this.level.startViewport.x;
    this.viewportY = this.level.startViewport.y;

    this.posX = this.level.startPosition.x;
    this.posY = this.level.startPosition.y;

    this.fallingState = FALLING;
    this.direction = RIGHT;
    this.dead = false;
    this.isMoving = false;
    this.canJump = true;

    this.vspeed = 0;

    this.audio.play(this.level.backgroundMusic, true, true);
    this.audio.stop(this.level.deathMusic);

    this.tickCount = 0;

    this.gameData = {};

    this.loadObjects();

    var gameState = this.storage.getItem(STORAGE_STATE);

    if(gameState)
    {
        this.level.loadState(this, gameState);
    }
};

GameEngine.prototype.saveState = function(state)
{
    this.storage.setItem(STORAGE_STATE, state);
}


GameEngine.prototype.loadObjects = function()
{
    var staticImages = [],
        self = this,
        level = this.level,
        objects = Object.deepcopy(level.objects);

    this.objects = [];
    this.objectMap = {};
    this.triggeringObjects = [];
    this.blockingObjects = [];
    this.drawableObjects = [];

    objects = objects.concatMap(function(obj)
    {
        var coords = cartesianProductOnObjects(obj.position, ["x", "y"]);

        return coords.map(function(pos)
        {
            var o = Object.deepcopy(obj);

            o.posX = pos.x;
            o.posY = pos.y;

            return o;
        });
    });

    objects.forEach(function(object)
    {
        var obj = self.addObject(object);
    });


    var objectsByType = this.drawableObjects.partition(function(obj)
        {
            return obj.dynamic;
        });

    this.drawableObjects = objectsByType[0];
    //self.objects.sort(function(x, y) { return compare(x.zIndex, y.zIndex); });

    this.renderer.loadBackground(objectsByType[1]);
    this.renderer.loadForeground([]);
};

GameEngine.prototype.addObject = function(object)
{
    var 
        isDynamic = object.dynamic || !!object.id,
        shape = object.shape,
        trigger = object.trigger,
        image = undefined,
        width = undefined,
        height = undefined,
        bitmap = undefined,
        knownProperties = [
            "posX", "posY", "dynamic", "trigger", "image",
            "blocking", "killing", "id", "tickFunction",
            "zIndex", "position", "shape",
        ];

    if(Object.keys(object).deleteList(knownProperties).length)
    {
        console.log(Object.keys(object).deleteList(knownProperties));
        dbg_assert(false, "Unkown properties");

    }

    if(object.image)
    {
        image = this.images[object.image];
        dbg_assert(image, "invalid image id");

        if(shape === undefined)
        {
            shape = new AutoShape(image);
        }
    }

    dbg_assert(!object.blocking || !trigger, "an object cannot block and have a trigger at the same time");

    if(object.killing)
    {
        dbg_assert(!trigger, "an object cannot kill and have a trigger at the same time");
        dbg_assert(!object.blocking, "an object cannot kill and block at the same time");
        trigger = this.die.bind(this);
    }

    if(shape)
    {
        width = shape.width;
        height = shape.height;
        bitmap = shape.getBitmap();
    }

    var newObject = { 
        x: object.posX,
        y: object.posY,
        width: width,
        height: height,
        dynamic: isDynamic,
        visible: true,
        image: image, // may be undefined
        bitmap: bitmap, // may be undefined
        trigger: trigger, // may be undefined
        zIndex: object.zIndex || 0,
        tickFunction: object.tickFunction, // may be undefined
    };


    if(trigger)
    {
        dbg_assert(trigger instanceof Function, "trigger has to be a function");
        dbg_assert(shape, "objects that kill or have a trigger require a shape");

        this.triggeringObjects.push(newObject);
    }

    if(object.image)
    {
        this.drawableObjects.push(newObject);
    }

    if(object.blocking)
    {
        dbg_assert(shape, "objects that block require a shape");
        this.blockingObjects.push(newObject);
    }

    this.objects.push(newObject);

    if(object.id)
    {
        dbg_assert(!this.objectMap[object.id], "id used twice");
        this.objectMap[object.id] = newObject;
    }

    return newObject;
};

GameEngine.prototype.removeObject = function(obj)
{
    this.objects = this.objects.delete(obj);
    this.blockingObjects = this.blockingObjects.delete(obj);
    this.drawableObjects = this.drawableObjects.delete(obj);
    this.triggeringObjects = this.triggeringObjects.delete(obj);

    if(obj.id)
    {
        delete this.objectMap[obj.id];
    }
};

GameEngine.prototype.removeObjectById = function(id)
{
    var obj = this.objectMap[id];

    if(obj)
    {
        this.removeObject(obj);
    }
}

GameEngine.prototype.toggleMute = function()
{
    this.audio.toggleMute();

    if(this.audio.muted)
    {
        this.storage.removeItem(STORAGE_USE_AUDIO);
    }
    else
    {
        this.storage.setItem(STORAGE_USE_AUDIO, 1);
    }
};


GameEngine.prototype.die = function()
{
    if(!this.dead)
    {
        this.audio.stop(this.level.backgroundMusic);
        this.audio.play(this.level.deathMusic, false, true);
        this.dead = true;
    }
};


GameEngine.prototype.crush = function()
{
    // the character is inside of a block 
    console.log("death by crushing"); 
    this.die();
};



GameEngine.prototype.initLevel = function(level)
{
    var base = level.resourceDir,
        imageIds = Object.keys(level.images),
        fileCount = 0,
        self = this;

    this.audio.path = level.musicDir;

    this.level = level;

    this.audio.preload(this.level.jumpMusic1, fileLoaded(), loadFailed);
    this.audio.preload(this.level.jumpMusic2, fileLoaded(), loadFailed);

    imageIds.forEach(function(id)
    {
        var filename = level.images[id],
            image = new Image();

        self.images[id] = image;

        image.onload = fileLoaded();
        image.onerror = loadFailed;
        image.src = base + filename;
    });

    function fileLoaded()
    {
        fileCount++;

        return function()
        {
            fileCount--;

            if(fileCount === 0)
            {
                self.start();
            }
        };
    }

    function loadFailed()
    {
        throw "loading a resource failed. Will not start";
    }
};




GameEngine.prototype.doTick = function doTick(self)
{
    var level = self.level,
        now = Date.now(),
        delta = now - self.lastTick;

    //console.time(1);

    self.totalDelta += delta;
    self.lastTick = now;

    if(self.totalDelta >= 500)
    {
        // caused by going to another tab, screensavers, etc.
        // just skip game logic
        console.log("logic skip");
        self.totalDelta = 0;
    }

    while(self.totalDelta >= level.physics.timePerTick)
    {
        //var t = Date.now();
        self.tick(self);
        //if(Date.now() - t > 10) console.log(Date.now() - t);
        self.totalDelta -= level.physics.timePerTick;
    }
    //console.timeEnd(1);


    self.renderer.redraw();

    requestAnimationFrame(function() { doTick(self); });
};

GameEngine.prototype.tick = function(self)
{
    var physics = self.level.physics,
        keysPressed = self.keyboard.keyWasPressed;


    // TODO: tickFunction.call(something, self);
    self.level.tickFunction(self);


    self.triggeringObjects.forEach(testObjectTrigger);

    function testObjectTrigger(obj)
    {
        if(obj.bitmap && obj.trigger)
        {
            if(self.characterCollision(obj.bitmap, obj.x, obj.y))
            {
                obj.trigger.call(obj, self);
            }
        }
    }

    self.objects.forEach(doTick);

    function doTick(obj)
    {
        if(obj.tickFunction)
        {
            obj.tickFunction.call(obj, self);
        }
    }

    self.tickCount++;

    if(self.dead)
    {
        return;
    }

    if(!keysPressed[KEY_LEFT] !== !keysPressed[KEY_RIGHT])
    {
        var didMove;

        self.isMoving = true;

        if(keysPressed[KEY_LEFT])
        {
            didMove = !self.moveCharacterRight(-physics.moveSpeed);
            self.direction = LEFT;
        }
        else if(keysPressed[KEY_RIGHT])
        {
            didMove = !self.moveCharacterRight(physics.moveSpeed);
            self.direction = RIGHT;
        }
    }
    else
    {
        self.isMoving = false;
    }

    // current jump physics:
    // - Jump causes an instant speed upwards
    // - While the character is in the air, this speed decreases (aka gravity)
    // - While the character is in the air and space is still pressed, 
    //     gravity is reduced (for a limited amount of time)

    // Note: On top of that, fall speed is capped

    if(self.fallingState === NOT_FALLING)
    {
        if(keysPressed[KEY_JUMP])
        {
            self.audio.play(self.level.jumpMusic1, false, false, .6);

            self.fallingState = IN_JUMP;
            self.canJump = true;
            self.vspeed = physics.jumpInitialSpeed;
            self.jumpTicks = physics.jumpTicks;
        }

        // see if character fell off a platform:
        // try to move the character down. If it works, he fell
        // off a platform. Otherwise this does nothing
        if(!self.moveCharacterDown(1))
        {
            // player is falling (not jumping), but can jump once more
            self.fallingState = FALLING;
            self.canJump = true;
        }
    }
    else
    {
        if(self.fallingState === IN_JUMP)
        {
            // reduced gravity while space is pressed
            self.vspeed += physics.jumpGravity;
            self.jumpTicks--;
            
            if(!keysPressed[KEY_JUMP] || self.jumpTicks === 0)
            {
                self.fallingState = FALLING;
            }
        }
        else // FALLING
        {
            if(self.canJump && keysPressed[KEY_JUMP])
            {
                self.audio.play(self.level.jumpMusic2, false, false, .6);

                self.fallingState = IN_JUMP;
                self.canJump = false;
                self.vspeed = physics.jumpInitialSpeed / 1.5;
                self.jumpTicks = physics.jumpTicks;
            }
            else
            {
                //self.keysPressed[KEY_JUMP] = false;
            }

            if(self.vspeed < physics.fallSpeedCap)
            {
                // "normal" gravity
                self.vspeed += physics.fallGravity;
            }
            else
            {
                self.vspeed = physics.fallSpeedCap;
            }
        }


        // IN_JUMP or FALLING 
        var blocked = self.moveCharacterDown(Math.roundInfinity(self.vspeed));

        if(blocked)
        {
            if(self.vspeed > 0)
            {
                // landed on the ground
                self.fallingState = NOT_FALLING;
                self.vspeed = 0;

                // don't jump again if space is still pressed
                keysPressed[KEY_JUMP] = false;
            }
            else
            {
                // character hit his head under a platform
                self.vspeed = 0;
            }
        }
    }


    // debug
    //dbg_log(["NOT_FALLING", "IN_JUMP", "FALLING"][self.fallingState]);
};


// move the character n pixels, detecting collisions
// returns true if character has been blocked by something
GameEngine.prototype.moveCharacterRight = function(x)
{
    if(x === 0)
    {
        return false;
    }

    var dx = Math.sign(x),
        bitmap = this.charBitmap.slice(0, 0, 1, this.level.characterHeight),
        bitmapPosX = this.posX + (x < 0 ? x : 0),
        bitmapPosY = this.posY;

    while(x)
    {
        this.posX += dx;
        x -= dx;

        if(this.charBitmap.compareMany(this.blockingObjects, this.posX, this.posY))
        {
            // undo last movement if character is "inside" of something
            this.posX -= dx;

            return true;
        }
    }

    return false;
};

GameEngine.prototype.moveCharacterDown = function(y)
{
    if(y === 0)
    {
        return false;
    }

    var dy = Math.sign(y),
        //bitmap = new Bitmap(this.level.characterWidth, this.level.characterHeight + Math.abs(y)),
        bitmapPosX = this.posX,
        offset = y < 0 ? -1 : this.level.characterHeight;


    while(y)
    {
        this.posY += dy;
        y -= dy;

        if(this.charBitmap.compareMany(this.blockingObjects, this.posX, this.posY))
        {
            this.posY -= dy;

            return true;
        }
    }

    return false;
};

GameEngine.prototype.characterCollision = function(bitmap, bx, by)
{
    return this.charBitmap.compare(bitmap, Math.round(bx - this.posX), Math.round(by - this.posY));
};



// Move a blocking object vertically
// Things that can happen:
// - The character is next to the object -> Push the character
// - The character is standing on the object -> Move him vertically with the platform
GameEngine.prototype.moveObjectRight = function(object, x)
{
    var dx = Math.sign(x),
        characterIsOntop = false;

    // How to determine if the character is standing on an object:
    // Move the character down (or the object up), by 1px.
    // If they collide, he's standing on it
    if(this.characterCollision(object.bitmap, object.x, object.y - 1))
    {
        characterIsOntop = true;
    }

    while(x)
    {
        x -= dx;
        object.x += dx;

        if(characterIsOntop)
        {
            this.moveCharacterRight(dx);
        }
        else if(this.characterCollision(object.bitmap, object.x, object.y))
        {
            // push the character away
            if(this.moveCharacterRight(dx))
            {
                // the character has been blocked by an object on the other side
                // this should kill him
                console.log("crushed");
            }
        }
    }
};

// Move a blocking object down 
// Things that can happen: 
// - The player is standing on the object -> move the character up with it
GameEngine.prototype.moveObjectDown = function(object, y)
{

    if(y >= 0)
    {
        var characterIsOntop = false;

        // How to determine if the character is standing on an object:
        // Move the character down (or the object up), by 1px.
        // If they collide, he's standing on it
        if(this.characterCollision(object.bitmap, object.x, object.y - 1))
        {
            characterIsOntop = true;
        }

        // moving down is safe
        object.y += y;

        if(characterIsOntop)
        {
            this.moveCharacterDown(y);
        }
    }
    else
    {
        while(y)
        {
            y++;
            object.y--;

            if(this.characterCollision(object.bitmap, object.x, object.y))
            {
                // push the character up
                if(this.moveCharacterDown(-1))
                {
                    // the character has been blocked by an object on the other side
                    // this should kill him
                    console.log("crushed");
                }
            }
        }
    }
};

