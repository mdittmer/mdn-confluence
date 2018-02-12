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

var NameRewriter = function(opts) {
  opts = opts || {};
  this.rewrites = opts.rewrites ||
      Object.getOwnPropertyNames(Object.prototype).map(function(name) {
        return [ name, '+' + name + '+' ];
      });
  this.browsers = opts.browsers || this.browsers.slice();
  this.platforms = opts.platforms || this.platforms.slice();
};

// Some user agents will match multiple patterns. The first match will be used,
// so the order is important. (Chromium-based browsers before Chrome, etc.)
NameRewriter.prototype.browsers = [
  {
    name: 'CocCoc',
    re: /(coc_coc_browser)\/([0-9_.]+)/,
  },
  {
    name: 'Edge',
    re: /(Edge)\/([0-9_.]+)/,
  },
  {
    name: 'QQ',
    re: /(M?QQBrowser)\/([0-9_.]+)/,
  },
  {
    name: 'UC',
    re: /(UC?Browser)\/([0-9_.]+)/,
  },
  {
    name: 'Yandex',
    re: /(YaBrowser)\/([0-9_.]+)/,
  },
  {
    name: 'Opera',
    re: /(OPR)\/([0-9_.]+)/,
  },
  {
    name: 'Samsung',
    re: /(SamsungBrowser)\/([0-9_.]+)/,
  },
  {
    name: 'Firefox',
    re: /(Firefox|FxiOS)\/([0-9_.]+)/,
  },
  {
    name: 'Chrome',
    re: /(Chrome|CriOS)\/([0-9_.]+)/,
  },
  {
    name: 'Safari',
    re: /(Version)\/([0-9_.]+).*(Safari)\/([0-9_.]+)/,
  },
  {
    name: 'IE',
    re: /(MSIE) ([0-9_.]+)/,
  },
  {
    name: 'IE',
    re: /(Trident).*rv:([0-9_.]+)/,
  },
];

NameRewriter.prototype.platforms = [
  {
    name: 'iPhone',
    re: /(iPhone) OS ([0-9_.]+)/,
  },
  {
    name: 'iPad',
    re: /(iPad)[^0-9]*([0-9_.]+)/,
  },
  {
    name: 'Android',
    re: /(Android) ([0-9_.]+)/,
  },
  {
    name: 'OSX',
    re: /(OS X) ([0-9_.]+)/,
  },
  {
    name: 'Windows',
    re: /(Windows) NT ([0-9_.]+)/,
  },
  {
    name: 'Linux',
    re: /(Linux) ([A-Za-z0-9_.]+)/,
  },
];

NameRewriter.prototype.rewriteName = function(name) {
  for ( var i = 0; i < this.rewrites.length; i++ ) {
    if ( name === this.rewrites[i][0] ) return this.rewrites[i][1];
  }
  return name;
};

NameRewriter.prototype.userAgentAsPlatformInfo = function(uaStr) {
  function findMatch(matchers) {
    for ( var i = 0; i < matchers.length; i++ ) {
      var matcher = matchers[i];
      var match;
      if ( ( match = uaStr.match(matcher.re) ) !== null )
      return {
        name: matcher.name,
        version: match[2].replace(/_/g, '.'),
      };
    }
    return null;
  }
  return {
    browser: findMatch(this.browsers),
    platform: findMatch(this.platforms),
  };
};

module.exports = NameRewriter;
