// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.ENUM({
  package: 'org.mozilla.mdn',
  name: 'DataEnv',

  imports: [
    'gcloudProjectId?',
    'window?'
  ],

  properties: [
    {
      class: 'Function',
      returns: 'String',
      name: 'getConfluenceReleaseUrl',
      value: function() {
        return `https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.Release.json`;
      },
    },
    {
      class: 'String',
      name: 'getConfluenceRowsUrl',
      value: function() {
        return `https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.GridRow.json`;
      },
    },
    {
      class: 'Function',
      name: 'getBaseUrl',
      args: ['opt_gcloudProjectId'],
      returns: 'String',
      transient: true,
    },
    {
      class: 'Function',
      name: 'getModelUrl',
      args: ['classId', 'opt_gcloudProjectId'],
      returns: 'String',
      transient: true,
      value: function(classId, opt_gcloudProjectId) {
        return `${this.getBaseUrl(opt_gcloudProjectId)}/class:${classId}.fon`;
      },
    },
    {
      class: 'Function',
      name: 'getModelHashUrl',
      args: ['classId', 'opt_gcloudProjectId'],
      returns: 'String',
      transient: true,
      value: function(classId, opt_gcloudProjectId) {
        return `${this.getModelUrl(classId, opt_gcloudProjectId)}.md5sum`;
      },
    },
    {
      class: 'Function',
      name: 'getDataUrl',
      args: ['classId', 'opt_gcloudProjectId'],
      returns: 'String',
      transient: true,
      value: function(classId, opt_gcloudProjectId) {
        return `${this.getBaseUrl(opt_gcloudProjectId)}/${classId}.json`;
      },
    },
    {
      class: 'Function',
      name: 'getDataHashUrl',
      args: ['classId', 'opt_gcloudProjectId'],
      returns: 'String',
      transient: true,
      value: function(classId, opt_gcloudProjectId) {
        return `${this.getDataUrl(classId, opt_gcloudProjectId)}.md5sum`;
      },
    },
    {
      name: 'path_',
      factory: function() { return require('path'); },
    },
  ],

  values: [
    {
      name: 'TEST',
      label: 'Testing',
      getBaseUrl: function(opt_gcloudProjectId) {
        return foam.isServer ?
            'file://' + this.path_.resolve(
                `${__dirname}/../../../../../test/data`) :
            `${this.window.location.origin}/data`;
      },
      getConfluenceReleaseUrl: function() {
        return `${this.getBaseUrl()}/org.chromium.apis.web.Release.json`;
      },
      getConfluenceRowsUrl: function() {
        return `${this.getBaseUrl()}/org.chromium.apis.web.GridRow.json`;
      },
    },
    {
      name: 'DEV',
      label: 'Development',
      getBaseUrl: function(opt_gcloudProjectId) {
        return foam.isServer ?
            'file://' + this.path_.resolve(
                `${__dirname}/../../../../../public/data`) :
            `${this.window.location.origin}/data`;
      },
    },
    {
      name: 'STAGE',
      label: 'Staging',
      getBaseUrl: function(opt_gcloudProjectId) {
        const projectId = opt_gcloudProjectId || this.gcloudProjectId;
        foam.assert(projectId,
                    'Attempt to get URL for unknown Google Cloud project');
        return `https://storage.googleapis.com/${projectId}-staging.appspot.com`;
      },
    },
    {
      name: 'PROD',
      label: 'Production',
      getBaseUrl: function(opt_gcloudProjectId) {
        const projectId = opt_gcloudProjectId || this.gcloudProjectId;
        foam.assert(projectId,
                    'Attempt to get URL for unknown Google Cloud project');
        return `https://storage.googleapis.com/${projectId}.appspot.com`;
      },
    },
  ],
});
