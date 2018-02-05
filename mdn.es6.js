var mdnDAO;
(async function() {
  const chr = org.chromium.apis.web;
  const mdn = org.mozilla.mdn;

  const rowSpecFetch = await fetch('data/mdn/class:org.mozilla.mdn.generated.CompatRow.json');
  const rowSpecText = await rowSpecFetch.text();
  const compatRowModel = foam.json.parseString(rowSpecText);
  compatRowModel.validate();
  const compatRowCls = compatRowModel.buildClass();
  compatRowCls.validate();
  foam.register(compatRowCls);
  foam.package.registerClass(compatRowCls);

  const CompatRow = compatRowCls;
  mdnDAO = foam.dao.PromisedDAO.create({
    of: CompatRow,
    promise: fetch('data/mdn/org.mozilla.mdn.generated.CompatRow.json').then(response => response.json())
      .then(json => foam.json.parse(json, CompatRow))
      .then(array => {
        const dao = foam.dao.MDAO.create({of: CompatRow});
        for (const row of array) {
          dao.put(row);
        }
        return dao;
      }),
  });

  const selected = [CompatRow.ID].concat(
    CompatRow.getAxiomsByClass(mdn.BrowserInfoProperty)
      .filter(prop => {
        let pred = !/(mobile|android|ios)/i.test(prop.browserName);
        return pred;
      }));

  const ctx = foam.createSubContext({
    queryParserFactory: x => mdn.parse.CompatQueryParser.create({
      of: CompatRow,
      interpreter: mdn.parse.BrowserInfoCompatQueryInterpreter
	.create(null, x),
    }, x),
  });
  mdn.DAOControllerView.create({
    selected,
  }, mdn.DAOController.create({
    data: mdnDAO,
  }, ctx)).write(document);
})();
