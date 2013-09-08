"use strict";

if(!window.requestAnimationFrame)
{
    window.requestAnimationFrame = 
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;
}


/** @constructor */
function GameRenderer(game)
{
    var canvas = document.getElementById("canvas");
    this.context = canvas.getContext("2d");

    canvas.width = game.width;
    canvas.height = game.height;

    this.canvas = canvas;

    // a canvas with the whole background of the level
    // can be much bigger than the actual canvas
    this.backgroundCanvas = null;

    this.animationTick = 0;

    this.animations = {};

    this.game = game;
}


// draws all the static images on one huge canvas
GameRenderer.prototype.loadBackground = function(images)
{
    this.backgroundCanvas = this.imagesToCanvas(
        images, 
        this.game.level.width,
        this.game.level.height,
        this.game.level.backgroundColor
    );
};

GameRenderer.prototype.loadForeground = function(images)
{
    this.foregroundCanvas = this.imagesToCanvas(
        images, 
        this.game.level.width,
        this.game.level.height
    );
};


/** @param {string=} background */
GameRenderer.prototype.imagesToCanvas = function(images, width, height, background)
{
    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        level = this.game.level;

    canvas.width = width;
    canvas.height = height;


    if(background)
    {
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
    }

    images.forEach(drawOnBackground); 

    function drawOnBackground(obj)
    {
        context.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
    }


    return canvas;
};


GameRenderer.prototype.drawAnimation = function(id, x, y)
{
    var animation = this.game.level.animations[id],
        index = this.animationTick / animation.time | 0,
        imageId = animation.images[index % animation.images.length];

    this.context.drawImage(this.game.images[imageId], x, y);
};

GameRenderer.prototype.drawImageOrAnimation = function(id, x, y)
{
    if(this.game.level.animations[id])
    {
        this.drawAnimation(id, x, y);
    }
    else
    {
        this.context.drawImage(this.game.images[id], x, y);
    }
};


GameRenderer.prototype.redraw = function()
{
    var ctx = this.context,
        game = this.game,
        imgs = game.images;

    this.animationTick++;

    drawCanvas(this.backgroundCanvas);

    if(!game.dead)
    {
        var charImage = "char";

        if(game.fallingState === NOT_FALLING)
        {
            if(game.isMoving)
            {
                charImage += "Moving";
            }
        }
        else
        {
            if(game.vspeed > 0)
            {
                charImage += "Falling";
            }
            else
            {
                charImage += "Jumping";
            }
        }

        if(game.direction == LEFT)
        {
            charImage += "Left";
        }
        else
        {
            charImage += "Right";
        }
        
        this.drawImageOrAnimation(
            charImage, 
            game.posX - game.viewportX, 
            game.posY - game.viewportY
        );
    }


    //drawCanvas(this.foregroundCanvas);


    game.drawableObjects.forEach(drawObject);

    if(game.dead)
    {
        ctx.drawImage(imgs.gameOver, 0, 150);
    }

    function drawObject(obj)
    {
        if(
                obj.visible &&
                obj.x + obj.width >= game.viewportX && 
                obj.x < game.viewportX + game.width &&
                obj.y + obj.height >= game.viewportY &&
                obj.y < game.viewportY + game.height
          )
        {
            ctx.drawImage(
                obj.image, 
                Math.round(obj.x - game.viewportX), 
                Math.round(obj.y - game.viewportY), 
                obj.width, 
                obj.height
            );
        }
    }

    function drawCanvas(canvas)
    {
        ctx.drawImage(
            canvas,
            // from viewport:
            game.viewportX, game.viewportY, game.width, game.height, 
            // to this:
            0, 0, game.width, game.height
        );
    }


    //document.getElementById("fps").textContent = Math.round(1000 / delta) + "fps";
};

GameRenderer.prototype.drawLoadingScreen = function(filesLoaded, fileCount)
{
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.game.width, this.game.height);

    this.context.fillStyle = "#fff";
    this.context.font = "20px monospace";
    this.context.textAlign = "center";
    this.context.fillText("Loading resources. Please wait ...", this.game.width >> 1, 100);
    this.context.fillText(filesLoaded + " out of " + fileCount, this.game.width >> 1, 140);

};
