"use strict";

Math.sign = function(x)
{
    return (x > 0) - (x < 0);
};

// round away from zero, opposite of truncation
Math.roundInfinity = function(x)
{
    return x > 0 ? Math.ceil(x) : Math.floor(x);
};

Math.floatToRandom = function(x)
{
    var floor = Math.floor(x)

    return floor + (Math.random() > x - floor);
}

/**
 * Return the triangle wave function between -1 and 1 with the given frequency a
 */
Math.triangle = function(a)
{
    return function(t)
    {
        var r = t / a;
        return -1 + 4 * Math.abs(r + .25 - Math.floor(r + .75));
    }
};

/**
 * Return a rectangle wave function between -1 and 1 (can also yield 0) with the
 * given frequency a
 */
Math.rectangle = function(a)
{
    var triangle = Math.triangle(a);

    return function(t)
    {
        return Math.sign(triangle(t));
    };
};

// return 1 if x > y, -1 if y > x, 0 otherwise
Math.compare = function(x, y)
{
    return Math.sign(x - y);
};

/**
 * index, n.:
 *         Alphabetical list of words of no possible interest where an
 *         alphabetical list of subjects with references ought to be.
 */
Array.prototype.findIndex = function(f)
{
    var result;

    this.some(function(value, index)
    {
        if(f(value))
        {
            result = index;
            return true;
        }
    });

    return result;
};

Array.prototype.find = function(f)
{
    var index = this.findIndex(f);

    if(index === undefined)
    {
        return undefined;
    }
    else
    {
        return this[index];
    }
};

// delete one element by value
Array.prototype.delete = function(v)
{
    var index = this.indexOf(v);

    if(index !== -1)
    {
        return this.slice(0, index).concat(this.slice(index + 1));
    }

    return this;
};

// concatMap :: (a -> [b]) -> [a] -> [b]
// Map a function over a list and concatenate the results. 
Array.prototype.concatMap = function(f)
{
    var result = [];

    this.forEach(function(x)
    {
        result = result.concat(f(x));
    });

    return result;
};

Array.prototype.deleteList = function(xs)
{
    return this.filter(function(x)
    {
        return xs.indexOf(x) === -1;
    });
};

Array.replicate = function(n, x)
{
    var xs = [];

    for(var i = 0; i < n; i++)
    {
        xs[i] = x;
    }

    return xs;
}


// partition :: (a -> Bool) -> [a] -> ([a], [a])
// The partition function takes a predicate a list and returns the pair of lists
// of elements which do and do not satisfy the predicate, respectively
Array.prototype.partition = function(f)
{
    return this.reduce(function(result, x)
        {
            if(f(x))
            {
                result[0].push(x);
            }
            else
            {
                result[1].push(x);
            }

            return result;
        }, [[], []]);
};


Array.toArray = function(xs)
{
    return [].slice.call(xs);
};


Function.byIndex = function(index, value)
{
    return function(obj)
    {
        return obj[index] === value;
    };
}

// not well tested, works for everything that we need
Object.deepcopy = function clone(obj)
{
    if(typeof obj === "object")
    {
        if(obj instanceof Array)
        {
            return obj.map(clone);
        }
        else if(obj.__proto__)
        {
            var result = {
                __proto__: obj.__proto__
            },
            keys = Object.keys(obj);

            for(var i = 0; i < keys.length; i++)
            {
                result[keys[i]] = obj[keys[i]];
            }
        }
        else
        {
            var result = {};

            for(var k in obj)
            {
                result[k] = clone(obj[k]);
            }
        }

        return result;
    }
    else
    {
        return obj;
    }
};

Object.isArray = function(x)
{
    return x instanceof Array;
}

Function.not = function(f)
{
    return function(x) { return !f(x); };
}

function range(min, max, step)
{
    var result = [];

    step = step || 1;
    dbg_assert(step > 0);

    if(max === undefined)
    {
        max = min;
        min = 0;
    }

    for(var i = min; i < max; i += step)
    {
        //yield i; // fuck you
        result.push(i);
    }

    return result;
}


/**
 * Hook obj[name], so when it gets called, func will get called too
 */
Function.hook = function(obj, name, func)
{
    var old = obj[name];

    obj[name] = function()
    {
        old.apply(this, arguments);
        func.apply(this, arguments);
    };
}


Object.extend = function(o1, o2)
{
    var keys = Object.keys(o2),
        key;

    for(var i = 0; i < keys.length; i++)
    {
        key = keys[i];
        o1[key] = o2[key];
    }

    return o1;
};

Object.deleteByValue = function(obj, value)
{
    var keys = Object.keys(obj),
        key

    for(var i = 0; i < keys.length; i++)
    {
        key = keys[i];

        if(obj[keys[i]] === value)
        {
            delete obj[keys[i]];
        }
    }
}

Object.merge = function(o1, o2)
{
    return Object.extend(Object.extend({}, o1), o2);
};


Object.values = function(obj)
{
    var keys = Object.keys(obj),
        result = [];

    for(var i = 0; i < keys.length; i++)
    {
        result.push(obj[keys[i]]);
    }

    return result;
};


function dbg_log(str)
{
    document.getElementById("debug").textContent = str;
}

function dbg_warn(str)
{
    document.getElementById("warn").textContent += str + "\n";
}

/**
 * @param {string=} msg
 */
function dbg_assert(cond, msg)
{
    if(!cond)
    {
        //console.log("assert failed");
        //console.log(msg || "");
        console.trace();
        throw "Assert failed: " + msg;
    }
}

/** 
 * @param {function(string,number)=} onerror
 */
function http_get(url, onready, onerror)
{
    var http = new XMLHttpRequest();

    http.onreadystatechange = function()
    {
        if(http.readyState === 4)
        {
            if(http.status === 200)
            {
                onready(http.responseText, url);
            }
            else
            {
                if(onerror)
                {
                    onerror(http.responseText, http.status);
                }
            }
        }
    };
            
    http.open("get", url, true);
    http.send("");

    return {
        cancel : function()
        {
            http.abort();
        }
    };
}

// Given a list of objects and a list of keys that should exist on the objects,
// get the cartesian product of the values and return objects with the result of
// each product
function cartesianProductOnObjects(list, keys)
{
    if(!Object.isArray(list))
    {
        list = [list];
    }

    return keys.reduce(singleProduct, list);

    function singleProduct(list, key)
    {
        return list.concatMap(function(obj)
        {
            var values = obj[key];

            if(!Object.isArray(values))
            {
                return [obj];
            }
            else
            {
                return values.map(function(val)
                {
                    var x = Object.deepcopy(obj);

                    x[key] = val;

                    return x;
                });
            }
        });
    }
}

