// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator that throws errors on read operations.',

  methods: [
    function where() {
      return Promise.reject('Cannot filter WriteOnlyDAO');
    },
    function orderBy() {
      return Promise.reject('Cannot order WriteOnlyDAO');
    },
    function skip() {
      return Promise.reject('Cannot skip over WriteOnlyDAO');
    },
    function limit() {
      return Promise.reject('Cannot limit over WriteOnlyDAO');
    },
    function pipe() {
      return Promise.reject('Cannot pipe over WriteOnlyDAO');
    },
    function pipe_() {
      return Promise.reject('Cannot pipe over WriteOnlyDAO');
    },
    function select() {
      return Promise.reject('Cannot select over WriteOnlyDAO');
    },
    function select_() {
      return Promise.reject('Cannot select over WriteOnlyDAO');
    },
    function listen() {
      return Promise.reject('Cannot listen over WriteOnlyDAO');
    },
    function listen_() {
      return Promise.reject('Cannot listen over WriteOnlyDAO');
    },
  ],
});
