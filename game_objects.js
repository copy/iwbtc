"use strict";

/** @constructor */
function Line(x1, y1, x2, y2)
{
    this.p1 = { x: x1, y: y1 };
    this.p2 = { x: x2, y: y2 };

    // it has to include the last point, so + 1
    this.width = Math.abs(this.p1.x - this.p2.x) + 1,
    this.height = Math.abs(this.p1.y - this.p2.y) + 1;

    this.bitmap = null;

    //console.log(this.getPixels());
}

Line.prototype.getBitmap = function()
{
    if(this.bitmap)
    {
        return this.bitmap;
    }

    var 

        // may be infinity, be careful with it
        m =  (this.height - 1) / (this.width - 1);

    this.bitmap = new Bitmap(this.width, this.height);

    // current strategy:
    // if slope is > 1, walk from y1 to y2, 
    // otherwise, walk from x1 to x2

    if(m > 1)
    {
        for(var i = 0; i < this.height; i++)
        {
            this.bitmap.set(
                Math.round(i / m),
                i,
                1
            );
        }
    }
    else
    {
        for(var i = 0; i < this.width; i++)
        {
            this.bitmap.set(
                i,
                Math.round(i * m),
                1
            );
        }
    }

    return this.bitmap;
};

/** @constructor */
function Rectangle(x1, y1, x2, y2)
{
    this.width = x2 - x1;
    this.height = y2 - y1;
    
    //this.p1 = { x: x1, y: y1 };
    //this.p2 = { x: x2, y: y2 };

    this.l1 = new Line(x1, y1, x2, y1);
    this.l2 = new Line(x2, y1, x2, y2);
    this.l3 = new Line(x2, y2, x1, y2);
    this.l4 = new Line(x1, y2, x1, y1);

    this.bitmap = null;
}


Rectangle.prototype.getBitmap = function()
{
    dbg_assert(0, "TODO");
};


/** @constructor */
function AutoShape(image)
{
    this.width = image.width;
    this.height = image.height;

    this.image = image;
    this.bitmap = null;
}

AutoShape.prototype.getBitmap = function()
{
    if(!this.bitmap)
    {
        this.bitmap = Bitmap.fromImage(this.image);
    }

    return this.bitmap;
};

