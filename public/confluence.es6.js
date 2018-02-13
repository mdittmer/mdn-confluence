(async function() {
  const chr = org.chromium.apis.web;
  const mdn = org.mozilla.mdn;

  const rowSpecFetch = await fetch('data/confluence/class:org.mozilla.mdn.generated.ConfluenceRow.txt');
  const rowSpecText = await rowSpecFetch.text();
  const confluenceRowModel = foam.json.parseString(rowSpecText);
  confluenceRowModel.validate();
  const confluenceRowCls = confluenceRowModel.buildClass();
  confluenceRowCls.validate();
  foam.register(confluenceRowCls);
  foam.package.registerClass(confluenceRowCls);

  const ConfluenceRow = confluenceRowCls;
  let confluenceDAO = foam.dao.PromisedDAO.create({
    of: ConfluenceRow,
    promise: fetch('data/confluence/org.mozilla.mdn.generated.ConfluenceRow.json')
      .then(response => response.json())
      .then(json => foam.json.parse(json, ConfluenceRow))
      .then(array => {
        const dao = foam.dao.MDAO.create({of: ConfluenceRow});
        for (const row of array) {
          dao.put(row);
        }
        return dao;
      }),
  });

  // TODO(markdittmer): Shouldn't these already be in release date order?
  const sortedColumns = [ConfluenceRow.ID].concat(
    ConfluenceRow.getAxiomsByClass(mdn.GridProperty)
      .filter(prop => !prop.release.isMobile)
      .sort((prop1, prop2) => prop1.release.releaseDate > prop2.release.releaseDate));
  const selectable = Array.from(sortedColumns);
  const chromes = selectable.filter(col => col.release && col.release.browserName === 'Chrome');
  const edges = selectable.filter(col => col.release && col.release.browserName === 'Edge');
  const firefoxes = selectable.filter(col => col.release && col.release.browserName === 'Firefox');
  const safaris = selectable.filter(col => col.release && col.release.browserName === 'Safari');
  const selected = [
    ConfluenceRow.ID,
    chromes[chromes.length - 1],
    edges[edges.length - 1],
    firefoxes[firefoxes.length - 1],
    safaris[safaris.length - 1],
  ];
  /* const selected = [sortedColumns[0]].concat(sortedColumns.slice(-4));*/

  const stackView = foam.u2.stack.StackView.create({
    data: foam.u2.stack.Stack.create(),
  }, foam.createSubContext({
    queryParserFactory: x => mdn.parse.ConfluenceQueryParser.create({
      of: ConfluenceRow,
      interpreter: mdn.parse.ReleaseApiConfluenceQueryInterpreter
	  .create(null, x),
    }, x),
  }));

  stackView.write(document);

  stackView.data.push({
    class: 'org.mozilla.mdn.DAOControllerView',
    selectable,
    selected,
  }, mdn.DAOController.create({
    data: confluenceDAO,
  }, stackView));
})();
