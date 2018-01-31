/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'EditColumnsView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.md.CheckBox'
  ],
  exports: [
    'selectableColumns',
    'selectedColumns',
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
^item {
  display: flex;
}

^ .foam-u2-md-CheckBox {
  flex-shrink: 0;
}

^ .foam-u2-md-CheckBox-label {
  position: static;
}
`
    }),
  ],

  classes: [
    {
      name: 'ColumnSlot',
      extends: 'foam.core.Slot',

      imports: [
        'selectableColumns',
        'selectedColumns',
      ],

      properties: [
        {
          class: 'Int',
          name: 'selectableIdx',
        },
      ],

      methods: [
        function get() {
          const col = this.selectableColumns[this.selectableIdx];
          return this.selectedColumns.some(c => c.name === col.name);
        },
        function set(value) {
          if (value) {
            this.addColumn_();
          } else {
            this.removeColumn_();
          }
        },
        function addColumn_() {
          const col = this.selectableColumns[this.selectableIdx];
          const able = this.selectableColumns;
          const ed = this.selectedColumns;
          let iAble = 0;
          let iEd = 0;
          while (iAble <= this.selectableIdx) {
            if (iAble === this.selectableIdx) {
              ed.splice(iEd, 0, col);
              break;
            }

            if (able[iAble].name === ed[iEd].name) iEd++;
            iAble++;
          }
          this.selectedColumns = Array.from(ed);
        },
        function removeColumn_() {
          const col = this.selectableColumns[this.selectableIdx];
          const ed = this.selectedColumns;
          for (let i = 0; i < ed.length; i++) {
            if (ed[i].name === col.name) {
              ed.splice(i, 1);
            }
          }
          this.selectedColumns = Array.from(ed);
        },
      ],
    },
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'selectableColumns',
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'selectedColumns',
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.md.CheckBox',
      name: 'cbs_',
    },
  ],

  methods: [
    function init() {
      this.SUPER();
      this.selectableColumns$.sub(this.onSelectableChanged);
    },
    function initE() {
      this.addClass(this.myClass());
      this.renderCbs_();
    },
    function clearCbs_() {
      for (const cb of this.cbs_) {
        this.removeChild(cb);
      }
      this.cbs_ = [];
    },
    function populateCbs_() {
      console.log('populateCbs_');
      for (let i = 0; i < this.selectableColumns.length; i++) {
        const col = this.selectableColumns[i];
        const cb = this.CheckBox.create({
          label: col.label,
          data$: this.ColumnSlot.create({selectableIdx: i}),
        });
        const wrapper = this.E('div').addClass(this.myClass('item')).add(cb);
        this.cbs_.push(wrapper);
        this.add(wrapper);
      }
    },
    function renderCbs_() {
      if (this.cbs_.length !== 0) this.clearCbs_();
      this.populateCbs_();
    },
  ],

  listeners: [
    {
      name: 'onSelectableChanged',
      code: function() { this.renderCbs_(); },
    },
  ],
});
