// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require('./GridProperty.es6.js');

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ConfluenceClassGenerator',

  axioms: [foam.pattern.Singleton.create()],

  methods: [
    function generateSpec(pkg, name, releases) {
      const generator = this;
      let spec = {
        class: 'Model',
        package: pkg,
        name: name,

        requires: ['org.mozilla.mdn.GridProperty'],

        properties: [
          {
            class: 'String',
            name: 'id',
            required: true,
            rawTableCellFormatter: function(value, obj, axiom) {
              const textValue = value === undefined ? '&nbsp;' : value;
              return `
<div class="id">
  ${textValue}
  <span class="overlay">${textValue}</span>
</div>
`;
            },
          },
        ],

        methods: [
          {
            name: 'fromGridRow',
            code: function(gridRow) {
              this.id = gridRow.id;
              const data = gridRow.data;
              const props = this.cls_.getAxiomsByClass(this.GridProperty);
              foam.assert(props.length === data.length,
                          'Confluence data: Boolean array mismatch');
              for (let i = 0; i < data.length; i++) {
                props[i].set(this, data[i]);
              }
              return this;
            },
          },
        ],
      };

      let propSpecs = releases.map(release => {
        return {
          class: 'org.mozilla.mdn.GridProperty',
          name: this.propertyNameFromRelease(release),
          label: this.propertyLabelFromRelease(release),
          release,
        };
      });
      spec.properties = spec.properties.concat(propSpecs);

      return spec;
    },
    function generateClass(spec) {
      if (foam.core.Model.isInstance(spec)) {
        spec.validate();
        const cls = spec.buildClass();
        cls.validate();
        foam.register(cls);
        foam.package.registerClass(cls);
        return cls;
      } else {
        foam.CLASS(spec);
        return foam.lookup(`${spec.package}.${spec.name}`);
      }
    },
    function propertyNameFromRelease(release) {
      return release.browserName.charAt(0).toLowerCase() +
          release.browserName.substr(1).replace(/[^a-z]/ig, '_') +
          release.browserVersion.replace(/[^a-z0-9]/ig, '_') +
          release.osName.charAt(0).toLowerCase() +
          release.osName.substr(1).replace(/[^a-z]/ig, '_') +
          release.osVersion.replace(/[^a-z0-9]/ig, '_');
    },
    function propertyLabelFromRelease(release) {
      return release.browserName + ' ' +
          release.browserVersion + ' ' +
          release.osName + ' ' +
          release.osVersion;
    },
  ],
});
