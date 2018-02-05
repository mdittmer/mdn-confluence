(async function() {
  const chr = org.chromium.apis.web;
  const mdn = org.mozilla.mdn;

  const rowSpecFetch = await fetch('data/confluence/class:org.mozilla.mdn.generated.ConfluenceRow.json');
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

  // foam.CLASS({
  //   package: 'org.mozilla.mdn',
  //   name: 'ConfluenceRowFormatter',
  //   implements: ['foam.u2.RowFormatter'],

  //   methods: [
  //     function format(data) {
  //       return `<span>${data ? data.id : ''}</span>`;
  //     },
  //   ],
  // });


  /* foam.u2.view.TableView.create({
   *   of: ConfluenceRow,
   *   data: confluenceDAO,
   * }).write(document);*/


  /* mdn.ScrollDAOView.create({
   *   data: confluenceDAO,
   *   rowFormatter: mdn.ConfluenceRowFormatter.create(),
   * }).write(document);*/


  // TODO(markdittmer): Shouldn't these already be in release date order?
  const sortedColumns = [ConfluenceRow.ID].concat(
    ConfluenceRow.getAxiomsByClass(mdn.GridProperty)
      .filter(prop => !prop.release.isMobile)
      .sort((prop1, prop2) => prop1.release.releaseDate > prop2.release.releaseDate));
  const selectableColumns = Array.from(sortedColumns);
  const chromes = selectableColumns.filter(col => col.release && col.release.browserName === 'Chrome');
  const edges = selectableColumns.filter(col => col.release && col.release.browserName === 'Edge');
  const firefoxes = selectableColumns.filter(col => col.release && col.release.browserName === 'Firefox');
  const safaris = selectableColumns.filter(col => col.release && col.release.browserName === 'Safari');
  const selectedColumns = [
    ConfluenceRow.ID,
    chromes[chromes.length - 1],
    edges[edges.length - 1],
    firefoxes[firefoxes.length - 1],
    safaris[safaris.length - 1],
  ];
  /* const selectedColumns = [sortedColumns[0]].concat(sortedColumns.slice(-4));*/
  const ctx = foam.createSubContext({
    queryParserFactory: x => mdn.parse.ConfluenceQueryParser.create({
      of: ConfluenceRow,
      interpreter: mdn.parse.ReleaseApiConfluenceQueryInterpreter
	.create(null, x),
    }, x),
  });
  mdn.DAOControllerView.create({
    selectableColumns,
    selectedColumns,
  }, mdn.DAOController.create({
    data: confluenceDAO,
  }, ctx)).write(document);

  // TODO(markdittmer): Shouldn't these already be in release date order?
  /* const columns = [ConfluenceRow.ID].concat(
   *   ConfluenceRow.getAxiomsByClass(mdn.GridProperty)
   *                .filter(prop => !prop.release.isMobile)
   *                .sort((prop1, prop2) => prop1.release.releaseDate > prop2.release.releaseDate)
   *                .slice(-4));
   * mdn.ScrollDAOTable.create({
   *   of: ConfluenceRow,
   *   data: confluenceDAO,
   *   columns_: cols,
   *   // data: confluenceDAO,
   *   // rowFormatter: mdn.ConfluenceRowFormatter.create(),
   * }).write(document);*/
})();
/* var gridDAO = org.chromium.apis.web.GridDAO.create();
 * var dao = foam.dao.PromisedDAO.create({
 *   of: org.mozilla.mdn.GridRow,
 * });
 * var ctlr = org.mozilla.mdn.DAOController.create({
 *   data: dao,
 *   editEnabled: true,
 *   selectEnabled: true,
 *   createEnabled: false,
 *   addEnabled: false,
 * });
 * var ctx = foam.createSubContext({
 *   gridDAO,
 *   data: ctlr,
 *   stack: foam.u2.stack.Stack.create(),
 *   selectedCols: [],
 * });
 * dao.promise = Promise.all([
 *   fetch('data/confluence/org.chromium.apis.web.Release.json')
 *     .then(response => response.json())
 *     .then(json => foam.json.parse(json, org.chromium.apis.web.Release, ctx))
 *     .then(cols => gridDAO.cols = cols),
 *   fetch('data/confluence/org.chromium.apis.web.GridRow.json')
 *     .then(response => response.json())
 *     .then(json => foam.json.parse(json, org.mozilla.mdn.GridRow, ctx))
 *     .then(arr => {
 *       for (const row of arr) {
 *         gridDAO.put(row);
 *       }
 *     })
 * ]).then(() => gridDAO);
 * var view = foam.comics.BrowserView.create({
 *   data: dao,
 *   controller: ctlr,
 *   title: 'GridRows',
 * }, ctx);
 * view.write(document);*/
