// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatDetailView',
  extends: 'foam.u2.tag.TextArea',

  requires: ['foam.net.HTTPRequest'],
  imports: ['requestAnimationFrame'],

  properties: [
    {
      name: 'nodeName',
      value: 'textarea',
    },
    {
      name: 'data',
      value: '',
    },
    {
      // class: 'FObjectProperty',
      // of: 'org.mozilla.mdn.generated.CompatRow',
      name: 'compatRow',
    },
    {
      class: 'Int',
      name: 'lineHeight',
      value: 20,
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.removeAttribute('rows');
      this.removeAttribute('cols');

      this.compatRow$.sub(this.onCompatRowChange);
      this.data$.sub(this.onDataChange);
      this.compatRow && this.onCompatRowChange(
          undefined, undefined, undefined, this.compatRow$);

      this.style({
        resize: 'none',
        'flex-grow': 1,
        'font-size': Math.floor(0.7 * this.lineHeight) + 'px',
        'line-height': this.lineHeight + 'px',
      });
    },
    function getRawCompatJsonUrl_(compatRow) {
      return `https://raw.githubusercontent.com/mdn/browser-compat-data/master/${compatRow.compatDir}/${compatRow.interfaceName}.json`;
    },
  ],

  listeners: [
    function onCompatRowChange(_, __, ___, compatRow$) {
      const compatRow = compatRow$.get();
      if ( ! compatRow ) return Promise.resolve(this.data);
      const url = this.getRawCompatJsonUrl_(compatRow);

      return this.HTTPRequest.create({url}).send()
          .then(resp => {
            if ( resp.status !== 200 ) throw resp;
            return resp.payload;
          }).then(json => this.data = json);
    },
    function onDataChange(_, __, ___, data$) {
      const el = this.el();
      if (data$.oldValue || !el) return;
      el.focus();

      const data = data$.get();
      const offset = data.indexOf(`"${this.compatRow.apiName}":`);
      if (offset === -1) return;
      el.selectionEnd = offset;

      this.requestAnimationFrame(() => {
        const prefix = data.substr(0, offset);
        const lines = (prefix.match(/\n/g) || []).length;
        console.log(this.lineHeight, lines);
        el.scrollTop = this.lineHeight * lines;
      });
    },
  ],
});
