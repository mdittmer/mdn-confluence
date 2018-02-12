/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var installedIds = [];

// Provide a unique id for every object.
module.exports = function(opts) {
  opts = opts || {};

  var key = opts.key || '+UID';

  for (var i = 0; i < installedIds.length; i++) {
    if (installedIds[i].key === key) {
      if (!installedIds[i].data) throw new Error('Id install re-entry');
      return installedIds[i].data;
    }
  }
  var installedId = {key: key};
  installedIds.push(installedId);

  var key__ = key + '__';
  var start = typeof opts.start === 'number' ? opts.start : 10000;
  var isValidId = opts.isValidId || function(id) {
    return typeof id === 'number' && id >= start;
  };
  var nextId = opts.nextId || (function() {
    // Leave space for "reserved IDs". Useful when values may mean
    // "object id or [some other id]".
    var id = start;
    return function() { return id++; };
  })();

  // Some objects cannot be trusted to to store their id as an own property
  // without subsequent gets of the property delegating to their prototype.
  // This occurs in the  non-[OverrideBuiltins] case of platform objects with
  // a named property getter and setter.
  // It also occurs on some systems where special objects such as the "named
  // properties object" in Firefox do not support Object.defineProperty().
  // To deal with such cases, store a short list of (object, id) pairs.
  var objectIdPairs = [];
  function getPairedId(o) {
    for ( var i = 0; i < objectIdPairs.length; i++ ) {
      if ( o === objectIdPairs[i][0] ) return objectIdPairs[i][1];
    }

    var id = nextId();
    objectIdPairs.push([o, id]);
    return id;
  }

  var descriptor = {
    get: function() {
      if ( ! this.hasOwnProperty(key__) ) {
        try {
          var existingLocalId = this[key__];
          Object.defineProperty(this, key__, {
            value: nextId(),
            enumerable: false,
          });
          if ( existingLocalId === this[key__] ) return getPairedId(this);
        } catch (e) {
          return getPairedId(this);
        }
      }
      // Get paired Id if own property of this[key__] was not created.
      // For example: sessionStorage and localStorage are some
      // special objects shared among pages. The +UID will be stored
      // in the storage object if the browser or page is not closed.
      // This results to error in manual object graph collection.
      if (this.__proto__ && this.__proto__[key] === this[key__]) {
        return getPairedId(this);
      } else {
        return this[key__];
      }
    },
    enumerable: false,
  };

  Object.defineProperty(Object.prototype, key, descriptor);

  function getId(v) {
    // Usual case: property generates id.
    var id = v[key];
    if ( isValidId(id) ) return id;

    console.log('!!! Extra id property define');

    // Corner case: Object doesn't descend from Object.prototype. Define
    // property manually.
    Object.defineProperty(v, key, descriptor);
    id = v[key];
    if ( isValidId(id) ) return id;

    console.log('!!! Fallback on paired id');

    // Last ditch effort: Just store a paired id.
    return getPairedId(v);
  }

  installedId.data = {
    key: key,
    key__: key__,
    isValidId: isValidId,
    nextId: nextId,
    getId: getId,
  };

  return installedId.data;
};
