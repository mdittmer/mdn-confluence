// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatImporter',
  implements: ['org.mozilla.mdn.BaseImporter'],

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.MDAO',
    'org.mozilla.mdn.CompatClassGenerator',
  ],

  properties: [
    {
      name: 'mdnData_',
      factory: function() { return require('mdn-browser-compat-data'); },
    },
    {
      name: 'mdnApis_',
      factory: function() {
        return Object.assign(
            {}, this.mdnData_.api, this.mdnData_.javascript.builtins);
      },
    },
    {
      name: 'browserNameMap_',
      value: null,
    },
  ],

  methods: [
    {
      name: 'generateDataClass',
      code: (async function() {
        if (this.dataClass_) return this.dataClass_;

        const getBrowserName = this.CompatClassGenerator
              .getAxiomByName('browserNameFromMdnKey').code;
        const getPropName = this.CompatClassGenerator
              .getAxiomByName('propNameFromMdnKey').code;

        let browserInfoPropMap = {};
        for (const iface of Object.keys(this.mdnApis_)) {
          if (iface.indexOf('__') !== -1) continue;
          for (const api of Object.keys(this.mdnApis_[iface])) {
            if (/[^a-z]/i.test(api) ||
                !(this.mdnApis_[iface][api].__compat &&
                  this.mdnApis_[iface][api].__compat.support)) {
              continue;
            }
            const keys = Object.keys(
                this.mdnApis_[iface][api].__compat.support);
            for (const key of keys) {
              if (browserInfoPropMap[key]) continue;
              const browserName = getBrowserName(key);
              browserInfoPropMap[key] = {
                class: 'org.mozilla.mdn.BrowserInfoProperty',
                name: getPropName(key),
                label: browserName,
                browserName: browserName,
              };
            }
          }
        }
        let browserInfoProps = [];
        for (const key of Object.keys(browserInfoPropMap)) {
          browserInfoProps.push(browserInfoPropMap[key]);
        }
        const classGenerator =
              this.CompatClassGenerator.create();
        this.dataClassSpec_ = classGenerator.generateSpec(
            'org.mozilla.mdn.generated', 'CompatRow', browserInfoProps);
        return this.dataClass_ = classGenerator
            .generateClass(this.dataClassSpec_);
      }),
    },
    {
      name: 'getDAO',
      code: (async function() {
        if (this.dao_) return this.dao_;
        const Cls = await this.generateDataClass();
        return this.dao_ = this.MDAO.create({of: Cls});
      }),
    },
    {
      name: 'importClassAndData',
      code: (async function(pathToJsonOutput) {
        const browserNameMap = await this.getBrowserNameMap_();
        const Cls = await this.generateDataClass();
        const dao = await this.getDAO();
        let promises = [];
        for (const iface of Object.keys(this.mdnApis_)) {
          if (iface.indexOf('__') !== -1) continue;
          for (const api of Object.keys(this.mdnApis_[iface])) {
            if (/[^a-z]/i.test(api) ||
                !(this.mdnApis_[iface][api].__compat &&
                  this.mdnApis_[iface][api].__compat.support)) {
              continue;
            }
            promises.push(dao.put(Cls.create({
              id: `${iface}#${api}`,
            }).fromMdnData(this.mdnApis_[iface][api], browserNameMap)));
          }
        }
        await Promise.all(promises);

        const arraySink = await dao.orderBy(dao.of.ID).select(
            this.ArraySink.create({of: dao.of}));

        return Promise.all([
          this.generateDataClass().then(this.importClass_.bind(this)),
          this.importData_(arraySink),
        ]).then(() => arraySink);
      }),
    },
    {
      name: 'getBrowserNameMap_',
      code: (async function() {
        if (this.browserNameMap_) return this.browserNameMap_;

        const releases = await this.getReleases_();
        let browserNameMap = {};
        for (const release of releases) {
          browserNameMap[release.browserName.toLowerCase()] =
              release.browserName;
        }

        return this.browserNameMap_ = browserNameMap;
      }),
    },
  ],
});
