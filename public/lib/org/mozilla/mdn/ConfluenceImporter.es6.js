// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ConfluenceImporter',
  implements: ['org.mozilla.mdn.BaseImporter'],

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.MDAO',
    'org.chromium.apis.web.GridDAO',
    'org.chromium.apis.web.GridRow',
    'org.chromium.apis.web.SerializableHttpJsonDAO',
    'org.chromium.apis.web.SerializableLocalJsonDAO',
    'org.mozilla.mdn.ConfluenceClassGenerator',
  ],

  properties: [
    {
      name: 'gridRowsJsonUrl',
      factory: function() {
        return this.url_.parse(`https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.GridRow.json`);
      },
      adapt: function(_, nu) {
        if ( foam.String.isInstance(nu) ) return this.url_.parse(nu);
        return nu;
      },
    },
  ],

  methods: [
    {
      name: 'generateDataClass',
      code: (async function() {
        if (this.dataClass_) return this.dataClass_;
        const releases = await this.getReleases_();
        const classGenerator = this.ConfluenceClassGenerator.create();
        this.dataClassSpec_ = classGenerator.generateSpec(
            'org.mozilla.mdn.generated', 'ConfluenceRow', releases);
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
        const dao = await this.getDAO();
        const cols = await this.getReleases_();
        const gridDAO = this.GridDAO.create({
          cols,
          of: this.GridRow,
          delegate: this.gridRowsJsonUrl.protocol === 'file:' ?
              this.SerializableLocalJsonDAO.create({
                of: this.GridRow,
                path: this.gridRowsJsonUrl.pathname,
              }) : this.SerializableHttpJsonDAO.create({
                of: this.GridRow,
                url: this.url_.format(this.gridRowsJsonUrl),
              }),
        });
        const ctx = foam.createSubContext({gridDAO});

        const gridSink = await gridDAO.orderBy(gridDAO.of.ID).select();
        const confluenceApis = gridSink.array;

        await Promise.all(
            confluenceApis.map(api => dao.put(
                dao.of.create(null, ctx).fromGridRow(api))));

        const confluenceSink = await dao.orderBy(dao.of.ID)
            .select(this.ArraySink.create({of: dao.of}));

        return Promise.all([
          this.generateDataClass().then(this.importClass_.bind(this)),
          this.importData_(confluenceSink),
        ]).then(() => confluenceSink);
      }),
    },
  ],
});
