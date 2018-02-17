// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require('./BrowserInfo.es6.js');
// require('./GridProperty.es6.js');
// require('./Issue.es6.js');
// require('./IssueStatus.es6.js');
// require('./IssueType.es6.js');

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'VersionIssueGenerator',

  axioms: [foam.pattern.Singleton.create()],

  requires: [
    'org.mozilla.mdn.BrowserInfo',
    'org.mozilla.mdn.BrowserInfoProperty',
    'org.mozilla.mdn.GridProperty',
    'org.mozilla.mdn.Issue',
    'org.mozilla.mdn.IssueStatus',
    'org.mozilla.mdn.IssueType',
    'org.mozilla.mdn.generated.ConfluenceRow',
  ],

  constants: {
    NEVER: '?',
    NEVER_VERSION: [Infinity],
  },

  properties: [
    {
      class: 'Boolean',
      name: 'clobberIssues',
      documentation: `Whether or not issue generation should clobber existing
          issues.`,
    },
  ],

  methods: [
    function generateIssues(confluenceDAO, mdnDAO, issueDAO) {
      return (async function() {
        let versions = {};
        const mdnApisSink = await mdnDAO.select();
        const mdnApis = mdnApisSink.array;

        if (mdnApis.length === 0) return issueDAO;
        const browserInfoProps = mdnApis[0].cls_
              .getAxiomsByClass(this.BrowserInfoProperty);
        const gridProps = this.ConfluenceRow
              .getAxiomsByClass(this.GridProperty);

        for (const mdnApi of mdnApis) {
          const confluenceApi = await confluenceDAO.find(mdnApi.id);
          if (!confluenceApi) continue;
          if (!gridProps.some(prop => prop.f(confluenceApi))) continue;

          let issues = {};
          for (const browserInfoProp of browserInfoProps) {
            const mdnBrowserInfo = browserInfoProp.f(mdnApi);
            const browserName = browserInfoProp.browserName;
            const gridProps = confluenceApi.cls_
                  .getAxiomsByClass(this.GridProperty)
                  .filter(p => p.release.browserName === browserName);
            for (const gridProp of gridProps) {
              const release = gridProp.release;
              const versionAdded = mdnBrowserInfo &&
                    mdnBrowserInfo.versionAdded !== Infinity ?
                    mdnBrowserInfo.versionAdded.toString() : this.NEVER;
              const versionRemoved = mdnBrowserInfo &&
                    mdnBrowserInfo.versionRemoved !== Infinity ?
                    mdnBrowserInfo.versionRemoved.toString() : this.NEVER;
              const addedCmp = this.compareVersions(
                  release.browserVersion, versionAdded, versions);
              const removedCmp = this.compareVersions(
                  release.browserVersion, versionRemoved, versions);
              const value = gridProp.f(confluenceApi);
              if (value && addedCmp < 0) {
                this.createIssueOrAddRelease_(issues, {
                  release,
                  apiId: confluenceApi.id,
                  type: this.IssueType.VERSION_BEFORE_ADDED,
                  description: `In Confluence ${release.browserName} before MDN ${browserName} version added ${versionAdded} (${confluenceApi.id})`,
                });
              } else if (!value && addedCmp >= 0 && removedCmp < 0) {
                this.createIssueOrAddRelease_(issues, {
                  release,
                  apiId: confluenceApi.id,
                  type: this.IssueType.VERSION_WITHIN_RANGE,
                  description: `Some versions not in Confluence ${release.browserName} between MDN ${browserName} version added ${versionAdded} and version removed ${versionRemoved} (${confluenceApi.id})`,
                });
              } else if (value && removedCmp >= 0) {
                this.createIssueOrAddRelease_(issues, {
                  release,
                  apiId: confluenceApi.id,
                  type: this.IssueType.VERSION_AFTER_REMOVED,
                  description: `In Confluence ${release.browserName} after MDN ${browserName} version removed ${versionRemoved} (${confluenceApi.id})`,
                });
              }
            }
          }
          for (const key of Object.keys(issues)) {
            if (issues[key]) {
              const issue = issues[key];
              if (this.clobberIssues) {
                issueDAO.put(issue);
              } else {
                const foundIssue = await issueDAO.find(issue.id);
                if (!foundIssue) {
                  issueDAO.put(issue);
                }
              }
            }
          }
        }

        return issueDAO;
      }).call(this);
    },
    function compareVersions(l, r, versions) {
      l = versions[l] || (versions[l] = this.extractVersion(l));
      r = versions[r] || (versions[r] = this.extractVersion(r));
      var lim = Math.min(l.length, r.length);
      for (let i = 0; i < lim; i++) {
        if (l[i] < r[i]) return -1;
        else if (l[i] > r[i]) return 1;
      }
      return 0;
    },
    function extractVersion(v) {
      if (v === this.NEVER) return this.NEVER_VERSION;
      return v.split('.').map(num => {
        foam.assert(!Number.isNaN(num), 'Invalid version number');
        return parseInt(num);
      });
    },
    function createIssueOrAddRelease_(issues, data) {
      const key = `${data.release.browserName}:${data.type.name}`;
      if (issues[key]) {
        issues[key].releases.push(data.release);
      } else {
        const release = data.release;
        delete data.release;
        data.releases = [release];
        issues[key] = this.Issue.create(data);
      }
    }
  ],
});
