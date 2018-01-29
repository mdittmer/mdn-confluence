foam.CLASS({
  package: 'org.mozilla.mdn.mlang',
  name: 'Seq',
  extends: 'foam.mlang.predicate.Nary',

  properties: [
    {
      name: 'f',
      value: function f(o) {
        return this.args.map(arg => arg.f(o));
      },
    },
  ],
});
