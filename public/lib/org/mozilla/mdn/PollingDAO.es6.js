// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'PollingDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'Int',
      name: 'pollingFrequency',
      value: 60 * 1000,
    },
    {
      class: 'Int',
      name: 'intervalId_',
    },
    {
      class: 'Boolean',
      name: 'updating_',
    },
  ],

  methods: [
    {
      name: 'init',
      code: function() {
        this.SUPER();
        this.pollingFrequency$.sub(this.onPollingFrequencyUpdate);
        this.onPollingFrequencyUpdate();
        this.onUpdate();
      },
    },
    {
      name: 'needsUpdate',
      return: 'Promise',
      code: (async function() { return true; }),
    },
    {
      name: 'delegateFactory',
      return: 'Promise',
      code: (async function() {
        throw new Error('Invocation of PollingDAO.delegateFactory()');
      }),
    },
  ],

  listeners: [
    {
      name: 'onPollingFrequencyUpdate',
      code: function() {
        if (this.intervalId_) clearInterval(this.intervalId_);
        this.intervalId_ = setInterval(this.onUpdate, this.pollingFrequency);
      },
    },
    {
      name: 'onUpdate',
      code: (async function() {
        if (this.updating_) return;
        this.updating_ = true;
        try {
          const needsUpdate = await this.needsUpdate();
          if (needsUpdate) {
            const oldDelegate = this.delegate;
            const newDelegate = await this.delegateFactory();
            this.delegate = newDelegate;
            oldDelegate && oldDelegate.detach();
          }
          this.updating_ = false;
        } catch (error) {
          this.updating_ = false;
          throw error;
        }
      }),
    },
  ],
});
