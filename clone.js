// Copyright © 2011-2013 Paul Vorbach <paul@vorb.de>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the “Software”), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// modified to not be require util.js
// will fail on regular expressions and dates


Object.deepcopy = function clone(parent) {

  var i;
    var circularParent = {};
    var circularResolved = {};
    var circularReplace = [];

    var cloned = _clone(parent, '*');

    // Now this object has been cloned. Let's check to see if there are any
    // circular references for it
    for(i in circularReplace) {
      var c = circularReplace[i];
      if (c && c.child && c.i in c.child) {
        c.child[c.i] = circularResolved[c.resolveTo];
      }
    }
    return cloned;

  /**
   * @param {*=} child
   * @param {*=} cIndex
   */
  function _clone(parent, context, child, cIndex) {
      var i; // Use local context within this function
      // Deep clone all properties of parent into child
      if (typeof parent == 'object') {
          if (parent == null)
              return parent;
          // Check for circular references
          for(i in circularParent)
              if (circularParent[i] === parent) {
                  // We found a circular reference
                  circularReplace.push({'resolveTo': i, 'child': child, 'i': cIndex});
                  return null; //Just return null for now...
                  // we will resolve circular references later
              }

          // Add to list of all parent objects
          circularParent[context] = parent;
          // Now continue cloning...
          if (isArray(parent)) {
              child = [];
              for(i in parent)
                  child[i] = _clone(parent[i], context + '[' + i + ']', child, i);
          }
          else {
              child = {};

              // Also copy prototype over to new cloned object
              child.__proto__ = parent.__proto__;
              for(i in parent)
                  child[i] = _clone(parent[i], context + '[' + i + ']', child, i);
          }

          // Add to list of all cloned objects
          circularResolved[context] = child;
      }
      else
          child = parent; //Just a simple shallow copy will do
      return child;
  }
}

