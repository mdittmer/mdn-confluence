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

function* objectGraphGenerator(graph) {
  for ( let id of graph.getAllIds() ) yield id;
}

function* objectOwnGenerator(graph, id) {
  for ( let key of graph.getObjectKeys(id) )
    yield { key: key, value: graph.lookup(key, id) };
}

// function* objectGenerator(graph, id) {
//   var keys = [];
//   var protoId = id;
//   while (!graph.isType(protoId)) {
//     keys = _.sortedUniq(keys.concat(graph.getObjectKeys(protoId)));
//     protoId = graph.getPrototype(protoId);
//   }
//   for (let key of keys)
//     yield {key: key, value: graph>.lookup(key, id)};
// }

function anyAnyGraphMatcher(id1, g1, g2) {
  return g1.getKeys(id1).some(key1 => g2.getAllKeysMap()[key1]);
}

function firstAnyGraphMatcher(id1, g1, g2) {
  return !!g2.getAllKeysMap()[g1.getShortestKey(id1)];
}

function intersectionIds1(g1, g2, match = anyAnyGraphMatcher) {
  let gen1 = objectGraphGenerator(g1);
  let ret = [];
  for ( let id1 of gen1 ) {
    if ( match(id1, g1, g2) ) ret.push(id1);
  }
  return ret;
}

function differenceIds1(g1, g2, match = anyAnyGraphMatcher) {
  var diffArray = [];
  var minuendArr = g1.getAllIds();
  var subtrahendArr = intersectionIds1(g1, g2, match);
  for ( var i = 0; i < minuendArr.length; i ++ ) {
    if ( subtrahendArr.indexOf(minuendArr[i]) === -1 ) {
      diffArray.push(minuendArr[i]);
    }
  }
  return diffArray;
}

function lookupEq(id1, key, g1, g2) {
  let value1 = g1.lookup(key, id1);
  let value2 = g2.lookup(g1.getShortestKey(id1) + '.' + key);
  return value1 === value2;
}

function lookupNeq(id1, key, g1, g2) {
  return !lookupEq(id1, key, g1, g2);
}

function matchPrimitives(g1, g2, match = lookupEq) {
  let primitives = [];
  for ( let id1 of objectGraphGenerator(g1) ) {
    for ( let { key, value } of objectOwnGenerator(g1, id1) ) {
      if ( g1.isType(value) && match(id1, key, g1, g2) ) {
        primitives.push({ id: id1, key });
      }
    }
  }
  return primitives;
}

function intersection(g1, g2, match = anyAnyGraphMatcher) {
  let g3 = g1.cloneWithout(differenceIds1(g1, g2, match));
  return g3.removePrimitives(matchPrimitives(g3, g2, lookupNeq));
}

function difference(g1, g2, match = anyAnyGraphMatcher) {
  let g3 = g1.cloneWithout(intersectionIds1(g1, g2, match));
  return g3.removePrimitives(matchPrimitives(g3, g2, lookupEq));
}

function intersectDifference(inGraphs, exGraphs, match = anyAnyGraphMatcher) {
  // Must start with some graph.
  console.assert(inGraphs.length > 0);
  // Edge case: Clone lone graph when no other graphs passed in.
  if ( inGraphs.length === 1 && exGraphs.length === 0 )
    return inGraphs[0].clone();

  return exGraphs.reduce((g1, g2) => difference(g1, g2, match),
    inGraphs.reduce((g1, g2)=> intersection(g1, g2, match)));
}

module.exports = {
  anyAnyGraphMatcher,
  firstAnyGraphMatcher,
  intersectDifference,
};
