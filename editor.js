function LevelEditor(game)
{
    this.saveButton = document.getElementById("save");
    this.editor = document.getElementById("editor");

    this.showInvisibles = document.getElementById("show_invisibles");

    this.editor.value = "Loading ...";
    this.editor.disabled = true;

    this.showInvisibleElements = false;
    
    http_get(LEVEL_DIR + game.levelFile, this.loaded.bind(this));

    this.game = game;

    Function.hook(game.renderer, "redraw", this.redrawHook.bind(this));
    // TODO:
    //game.addDrawHook(this.redrawHook.bind(this));

    game.renderer.canvas.addEventListener("mousemove", 
            this.updateCoords.bind(this), false);

    this.showInvisibles.addEventListener("change",
            this.setShowInvisibles.bind(this), false);

    var autoreload_box = document.getElementById("autoreload");

    if(location.search.indexOf("reload=1") >= 0)
    {
        autoreload_box.checked = true;
        autoreload_box.onclick = function()
        {
            location.search = location.search.replace("reload=1", "");
        }

        timeout = setTimeout(function()
        {
            location.reload();
        }, 2000);
    }
    else
    {
        autoreload_box.onclick = function()
        {
            location.search += "&reload=1";
        }
    }

    // debugging help
    window.ge = game;   
}

LevelEditor.prototype.redrawHook = function()
{
    var game = this.game,
        renderer = game.renderer,
        ctx = renderer.context,
        level = game.level;

    if(this.showInvisibleElements)
    {
        ctx.fillStyle = "rgba(0, 0, 0, .5)";

        game.objects.forEach(function(obj)
        {
            if(!obj.visible || !obj.image)
            {
                if(obj.image)
                {
                    ctx.drawImage(
                        obj.image, 
                        Math.round(obj.x - game.viewportX), 
                        Math.round(obj.y - game.viewportY), 
                        obj.width, 
                        obj.height
                    );
                }
                else if(obj.bitmap)
                {
                    obj.bitmap.withOtherRect(level.width, level.height, -obj.x, -obj.y, putOnImage);
                }

            }
        });

        function putOnImage(x, y, bit)
        {
            if(bit)
            {
                ctx.fillRect(x - game.viewportX, y - game.viewportY, 1, 1);
            }
        }
    }

};

LevelEditor.prototype.updateCoords = function(e)
{
    var x = e.offsetX + this.game.viewportX,
        y = e.offsetY + this.game.viewportY;

    document.getElementById("coords").textContent = x + " " + y;
};

LevelEditor.prototype.setShowInvisibles = function(e)
{
    this.showInvisibleElements = this.showInvisibles.checked;
};

LevelEditor.prototype.updateCoords = function(e)
{
    var x = e.offsetX + this.game.viewportX,
        y = e.offsetY + this.game.viewportY;

    document.getElementById("coords").textContent = x + " " + y;
};

LevelEditor.prototype.loaded = function(text)
{
    this.editor.value = text;
    this.editor.disabled = false;

    this.saveButton.addEventListener("click", this.save.bind(this), false);
};

LevelEditor.prototype.save = function()
{
    try 
    {
        var level = eval(this.editor.value + "; level;");
    } 
    catch(e)
    {
        console.log("syntax error");
        return;
    }

    if(!level)
    {
        console.log("no level");
        return;
    }

    this.game.initLevel(level);
};
