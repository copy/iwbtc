"use strict";

/**
 * a black/white 2d bitmap for collision detecting
 * @constructor
 */
function Bitmap(width, height)
{
    this.width = width;
    this.height = height;
    this.count = width * height;

    this.data = new Uint8Array(this.count);
}

// given an image, return a bitmap of pixels
// where 0 indicates a transparent pixel and 1 non-transparent one
Bitmap.fromImage = function(image)
{
    var
        width = image.width,
        height = image.height,
        bitmap = new Bitmap(width, height),
        canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        data;

    canvas.width = width;
    canvas.height = height;

    // make sure the canvas is transparent and not white
    context.clearRect(0, 0, width, height);

    context.drawImage(image, 0, 0);

    data = context.getImageData(0, 0, width, height).data;

    for(var i = 0; i < bitmap.count; i++)
    {
        bitmap.data[i] = data[i * 4 + 3] > 0 | 0;
    }

    return bitmap;
};


Bitmap.prototype.withOtherRect = function(width, height, dx, dy, f)
{
    var intersection = this.getIntersection(width, height, dx, dy),
        srcPointer = intersection.otherY * width + intersection.otherX,
        destPointer = intersection.thisY * this.width + intersection.thisX;

    for(var y = 0; y < intersection.height; y++)
    {
        for(var x = 0; x < intersection.width; x++)
        {
            f(intersection.otherX + x, intersection.otherY + y, this.data[destPointer]);

            srcPointer++;
            destPointer++;
        }

        srcPointer += width - intersection.width;
        destPointer += this.width - intersection.width;
    }
};


Bitmap.prototype.stringify = function()
{
    var field = "Bitmap  width=" + this.width + " height=" + this.height + "\n";

    for(var y = 0; y < this.height; y++)
    {
        for(var x = 0; x < this.width; x++)
        {
            field += String(this.data[y * this.width + x]);
        }

        field += "\n";
    }

    return field;
};


Bitmap.prototype.set = function(x, y, value)
{
    if(x >= 0 && y >= 0 && x < this.width && y < this.height)
    {
        this.data[y * this.width + x] = value;
    }
};

Bitmap.prototype.copy = function()
{
    // hacky, but whatever
    return {
        __proto__: Bitmap.prototype,

        width : this.width,
        height : this.height,
        count : this.count,

        data : new Uint8Array(this.data),
    };
};


/**
 * Calculate the intersection of this bitmap and an area with given size
 * and position
 */
Bitmap.prototype.getIntersection = function(width, height, dx, dy)
{
    dx = dx || 0;
    dy = dy || 0;

    var thisX = Math.max(0, dx),
        thisY = Math.max(0, dy),
        otherX = Math.max(0, -dx),
        otherY = Math.max(0, -dy);

    return {
        thisX : thisX,
        thisY : thisY,

        otherX : otherX,
        otherY : otherY,

        width :  Math.max(0, Math.min(this.width - thisX, width - otherX)),
        height : Math.max(0, Math.min(this.height - thisY, height - otherY)),
    };
};


/*
 * return a different bitmap that is a slice in the given area
 */
Bitmap.prototype.slice = function(width, height, dx, dy)
{
    var intersection = this.getIntersection(width, height, dx, dy),
        other = new Bitmap(width, height),
        srcPointer = intersection.thisY * this.width + intersection.thisX,
        destPointer = intersection.otherY * width + intersection.otherX;

    for(var y = 0; y < intersection.height; y++)
    {
        for(var x = 0; x < intersection.width; x++)
        {
            other.data[destPointer] = this.data[srcPointer];
            srcPointer++;
            destPointer++;
        }
        srcPointer += this.width - intersection.width;
        destPointer += width - intersection.width;
    }

    return other;
};

Bitmap.prototype.isZero = function()
{
    for(var i = 0; i < this.count; i++)
    {
        if(this.data[i])
        {
            return false;
        }
    }

    return true;
};


/**
 * @param {Bitmap} other
 * @param {number=} dx   an offset, by which the parameter bitmap is moved
 * @param {number=} dy   an offset, by which the parameter bitmap is moved
 */
Bitmap.prototype.or = function(other, dx, dy)
{
    var intersection = this.getIntersection(other.width, other.height, dx, dy),
        srcPointer = intersection.otherY * other.width + intersection.otherX,
        destPointer = intersection.thisY * this.width + intersection.thisX;

    for(var y = 0; y < intersection.height; y++)
    {
        for(var x = 0; x < intersection.width; x++)
        {
            this.data[destPointer] |= other.data[srcPointer];
            srcPointer++;
            destPointer++;
        }
        srcPointer += other.width - intersection.width;
        destPointer += this.width - intersection.width;
    }
};


// compare this bitmap with a given bitmap, moved by dx and dy,
// returning true if they have a bit in common
Bitmap.prototype.compare = function(other, dx, dy)
{
    var intersection = this.getIntersection(other.width, other.height, dx, dy),
        srcPointer = intersection.otherY * other.width + intersection.otherX,
        destPointer = intersection.thisY * this.width + intersection.thisX;

    for(var y = 0; y < intersection.height; y++)
    {
        for(var x = 0; x < intersection.width; x++)
        {
            if(this.data[destPointer] && other.data[srcPointer])
            {
                return true;
            }

            srcPointer++;
            destPointer++;
        }

        srcPointer += other.width - intersection.width;
        destPointer += this.width - intersection.width;
    }

    return false;
};

/**
 * Compare this bitmap to a list of bitmaps with x and y value
 * sx and sy indicate, how this bitmap is moved
 */
Bitmap.prototype.compareMany = function(bitmaps, sx, sy)
{
    var self = this;

    return bitmaps.some(function(obj)
    {
        if(obj.x > sx + self.width || 
            obj.y > sy + self.height ||
            obj.x + obj.bitmap.width < sx ||
            obj.y + obj.bitmap.height < sy)
        {
            // safes us some computations,
            // since this is often the case
            return false;
        }

        return self.compare(obj.bitmap, obj.x - sx, obj.y - sy);
    });
};


