// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

const assert = require('assert');

function arrayMatcher(array) {
  for (let i = 0; i < array.length; i++) {
    if (!array[i].notes) return i;
  }
  return -1;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function hasOwnProperty(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName);
}

class CompatJsonAdapter {
  confluenceRowToCompatJsonFragment(row, releases) {
    const support = {};

    // Scan through the row once, interleaving which browser is being updated.
    // This is equivalent to processing each browser in turn because the state
    // for each browser is contained in |support[browser]|.
    for (const release of releases) {
      const { browser, version } = release;

      // Decide a single support value from potentially multiple conflicting
      // releases in Confluence. Assume true if any are true.
      let value = false;
      for (const confluenceRelease of release.confluence) {
        const confluenceValue = row.data[confluenceRelease.columnIndex];
        assert.equal(
          typeof confluenceValue,
          'boolean',
          `Expected boolean value, got ${value} for ${JSON.stringify(
            confluenceRelease
          )}`
        );
        value = value || confluenceValue;
      }

      if (!support[browser]) {
        // This is the first release in Confluence.
        support[browser] = {};
        if (value) {
          // Use ≤ except for Edge 12 which is the first release.
          // (This could be generalized by consulting |opts.mdnBrowsers|.)
          if (browser === 'edge' && version === '12') {
            support[browser].version_added = version;
          } else {
            support[browser].version_added = '≤' + version;
          }
        } else {
          support[browser].version_added = false;
        }
        continue;
      }

      if (value && !support[browser].version_added) {
        if (!support[browser].version_removed) {
          support[browser].version_added = version;
        }
      } else if (support[browser].version_added && !value) {
        if (!support[browser].version_removed) {
          support[browser].version_removed = version;
        }
      } else if (value && support[browser].version_removed) {
        // This is the case of an API being added, removed, and then added
        // again. Put the information in `maintainer_notes` for now.
        if (!support[browser].maintainer_notes) {
          support[browser].maintainer_notes = [];
        }
        support[browser].maintainer_notes.push(
          `Removed in ${support[browser].version_removed}`
        );
        support[browser].maintainer_notes.push(`Added in ${version}`);
        delete support[browser].version_removed;
      }
    }

    return support;
  }

  patch(base, patch, opts) {
    if (opts && opts.patchFilter) {
      // Apply patch filter which may drop or modify the patch.
      patch = opts.patchFilter(base, patch);
      if (!patch) {
        return;
      }
    }

    for (const key of Object.keys(patch)) {
      const value = patch[key];

      if (Array.isArray(base[key])) {
        this.patchOntoArray(base[key], value, opts);
      } else if (Array.isArray(value)) {
        this.patchArrayOnto(base, value, key, opts);
      } else if (isObject(value)) {
        if (!hasOwnProperty(base, key)) base[key] = {};
        this.patch(base[key], value, opts);
      } else {
        base[key] = value;
      }
    }
  }

  patchOntoArray(base, patch, opts) {
    if (Array.isArray(patch)) {
      for (let i = 0; i < patch.length; i++) {
        if (patch[i] === undefined) continue;
        if (isObject(base[i]) && isObject(patch[i])) {
          this.patch(base[i], patch[i], opts);
        } else {
          base[i] = patch[i];
        }
      }
    } else {
      const idx = arrayMatcher(base);
      if (idx === -1) base.unshift(patch);
      else this.patch(base[idx], patch, opts);
    }
  }

  patchArrayOnto(base, patch, key, opts) {
    if (base[key] === undefined) {
      base[key] = [];
      this.patchOntoArray(base[key], patch);
      return;
    }

    const idx = arrayMatcher(patch);
    if (idx === -1) {
      patch.unshift(base[key]);
    } else {
      this.patch(base[key], patch[idx], opts);
    }
    base[key] = [];
    this.patchOntoArray(base[key], patch);
  }
}

module.exports = { CompatJsonAdapter };
