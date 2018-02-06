/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ToggleListElementsView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.md.CheckBox'
  ],
  imports: ['error'],
  exports: [
    'selectable',
    'selected',
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
      name: 'ElementSlot',
      extends: 'foam.core.Slot',

      imports: [
        'selectable',
        'selected',
      ],

      properties: [
        {
          class: 'Int',
          name: 'selectableIdx',
        },
      ],

      methods: [
        function get() {
          const elem = this.selectable[this.selectableIdx];
          return this.selected.some(c => c.name === elem.name);
        },
        function set(value) {
          if (value) {
            this.addElement_();
          } else {
            this.removeElement_();
          }
        },
        function addElement_() {
          const elem = this.selectable[this.selectableIdx];
          const able = this.selectable;
          const ed = this.selected;
          let iAble = 0;
          let iEd = 0;
          while (iAble <= this.selectableIdx) {
            if (iEd >= ed.length) {
              ed.push(elem);
              break;
            }
            if (iAble === this.selectableIdx) {
              ed.splice(iEd, 0, elem);
              break;
            }

            if (able[iAble].name === ed[iEd].name) iEd++;
            iAble++;
          }
          console.log('start set', this.selected$);
          this.selected = Array.from(ed);
          console.log('finish set', this.selected$);
        },
        function removeElement_() {
          const elem = this.selectable[this.selectableIdx];
          const ed = this.selected;
          for (let i = 0; i < ed.length; i++) {
            if (ed[i].name === elem.name) {
              ed.splice(i, 1);
            }
          }
          console.log('start set', this.selected$);
          this.selected = Array.from(ed);
          console.log('finish set', this.selected$);
        },
      ],
    },
  ],

  properties: [
    {
      class: 'Array',
      name: 'selectable',
      postSet: function(_, nu) {
        for (const elem of this.selectable) {
          if (!elem || !elem.name || !elem.label) {
            this.error(`${this.cls_.id}: Selectable element must have name and
                            label`);
          }
        }
      },
    },
    {
      class: 'Array',
      name: 'selected',
      postSet: function(_, nu) {
        for (const elem of this.selectable) {
          if (!elem || !elem.name || !elem.label) {
            this.error(`${this.cls_.id}: Selected element must have name and
                            label`);
          }
        }
      },
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
      this.selectable$.sub(this.onSelectableChanged);
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
      for (let i = 0; i < this.selectable.length; i++) {
        const elem = this.selectable[i];
        const cb = this.CheckBox.create({
          label: elem.label,
          data$: this.ElementSlot.create({selectableIdx: i}),
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
