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
  imports: ['bcd'],

  properties: [
    {
      name: 'mdnApis_',
      factory: function() { return this.bcd.api; },
    },
    {
      name: 'mdnBuiltins_',
      factory: function() { return this.bcd.javascript.builtins; },
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
        const ifaces = Object.assign(
            {}, this.mdnApis_, this.mdnBuiltins_);
        for (const iface of Object.keys(ifaces)) {
          if (iface.indexOf('__') !== -1) continue;
          for (const api of Object.keys(ifaces[iface])) {
            if (/[^a-z]/i.test(api) ||
                !(ifaces[iface][api].__compat &&
                  ifaces[iface][api].__compat.support)) {
              continue;
            }
            const keys = Object.keys(
                ifaces[iface][api].__compat.support);
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
        const loadApis = (compatDir, ifaces) => {
          for (const interfaceName of Object.keys(ifaces)) {
            if (interfaceName.indexOf('__') !== -1) continue;
            for (const apiName of Object.keys(ifaces[interfaceName])) {
              if (/[^a-z]/i.test(apiName) ||
                  !(ifaces[interfaceName][apiName].__compat &&
                    ifaces[interfaceName][apiName].__compat.support)) {
                continue;
              }
              promises.push(dao.put(Cls.create({
                compatDir,
                interfaceName,
                apiName,
              }).fromMdnData(ifaces[interfaceName][apiName])));
            }
          }
        };
        loadApis('api', this.mdnApis_);
        loadApis('javascript/builtins', this.mdnBuiltins_);
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
