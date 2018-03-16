foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'ViewSpec',
  refines: 'foam.u2.ViewSpec',

  properties: [
    {
      name: 'fromJSON',
      value: function(value, opt_ctx, prop, outputter) {
        if (!foam.isServer) return this.SUPER(value, opt_ctx, prop, outputter);
        // Do not instantiate U2 views in NodeJS.
        return Object.assign({}, value);
      },
    },
  ],
});
