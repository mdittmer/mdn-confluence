(async function() {
  mdnConfluenceBoot();

  const mdn = org.mozilla.mdn;
  const chr = org.chromium.apis.web;

  //
  // Confluence
  //

  let confluenceDAO = foam.dao.ProxyDAO.create();
  const confluenceMonitor = mdn.ModelDAOMonitor.create({
    classId: 'org.mozilla.mdn.generated.ConfluenceRow',
    dao$: confluenceDAO.delegate$,
    daoFactory: (args, ctx) => mdn.WebSocketDAOProvider.create({
      serviceName: 'confluence',
    }).createClientDAO(ctx).copyFrom(args),
  });
  // const confluenceRowSpecFetch = await fetch('data/confluence/class:org.mozilla.mdn.generated.ConfluenceRow.txt');
  // const confluenceRowSpecText = await confluenceRowSpecFetch.text();
  // const confluenceRowModel = foam.json.parseString(confluenceRowSpecText);
  // confluenceRowModel.validate();
  // const confluenceRowCls = confluenceRowModel.buildClass();
  // confluenceRowCls.validate();
  // foam.register(confluenceRowCls);
  // foam.package.registerClass(confluenceRowCls);


  // const ConfluenceRow = confluenceRowCls;
  // let confluenceDAO = com.google.firebase.AuthenticatedDAO.create({
  //   firebase,
  //   of: ConfluenceRow,
  //   delegate: com.google.firebase.FirestoreDAO.create({
  //     firestore: firebase.firestore(),
  //     collection: firebase.firestore().collection('confluence_2018-02-14T16:43:25.072Z'),
  //   }),
  // });

  // TODO(markdittmer): Shouldn't these already be in release date order?
  let confluenceCtx;
  debugger;
  await new Promise((resolve, reject) => confluenceMonitor.dao$.sub(
      () => {
        debugger;
      }));
  // (function() {
  //   const sortedColumns = [ConfluenceRow.ID].concat(
  //       ConfluenceRow.getAxiomsByClass(mdn.GridProperty)
  //         .filter(prop => !prop.release.isMobile)
  //         .sort((prop1, prop2) => prop1.release.releaseDate > prop2.release.releaseDate));
  //   const selectable = Array.from(sortedColumns);
  //   const chromes = selectable.filter(col => col.release && col.release.browserName === 'Chrome');
  //   const edges = selectable.filter(col => col.release && col.release.browserName === 'Edge');
  //   const firefoxes = selectable.filter(col => col.release && col.release.browserName === 'Firefox');
  //   const safaris = selectable.filter(col => col.release && col.release.browserName === 'Safari');
  //   const selected = [
  //     ConfluenceRow.ID,
  //     chromes[chromes.length - 1],
  //     edges[edges.length - 1],
  //     firefoxes[firefoxes.length - 1],
  //     safaris[safaris.length - 1],
  //   ];

  //   confluenceCtx = foam.createSubContext({
  //     selectable,
  //     selected,
  //     queryParserFactory: x => mdn.parse.ConfluenceQueryParser.create({
  //       of: ConfluenceRow,
  //       interpreter: mdn.parse.ReleaseApiConfluenceQueryInterpreter
  //           .create(null, x),
  //     }, x),
  //   });
  // })();

  // //
  // // MDN compat
  // //

  // const mdnRowSpecFetch = await fetch('data/mdn/class:org.mozilla.mdn.generated.CompatRow.txt');
  // const mdnRowSpecText = await mdnRowSpecFetch.text();
  // const compatRowModel = foam.json.parseString(mdnRowSpecText);
  // compatRowModel.validate();
  // const compatRowCls = compatRowModel.buildClass();
  // compatRowCls.validate();
  // foam.register(compatRowCls);
  // foam.package.registerClass(compatRowCls);

  // const CompatRow = compatRowCls;
  // const mdnDAO = foam.dao.PromisedDAO.create({
  //   of: CompatRow,
  //   promise: fetch('data/mdn/org.mozilla.mdn.generated.CompatRow.json').then(response => response.json())
  //     .then(json => foam.json.parse(json, CompatRow))
  //     .then(array => {
  //       const dao = foam.dao.MDAO.create({of: CompatRow});
  //       for (const row of array) {
  //         dao.put(row);
  //       }
  //       return dao;
  //     }),
  // });

  // let mdnCtx;
  // (function() {
  //   const selected = [CompatRow.ID].concat(
  //       CompatRow.getAxiomsByClass(mdn.BrowserInfoProperty)
  //         .filter(prop => {
  //           let pred = !/(mobile|android|ios)/i.test(prop.browserName);
  //           return pred;
  //         }));

  //   mdnCtx = foam.createSubContext({
  //     selected,
  //     queryParserFactory: x => mdn.parse.CompatQueryParser.create({
  //       of: CompatRow,
  //       interpreter: mdn.parse.BrowserInfoCompatQueryInterpreter
  //           .create(null, x),
  //     }, x),
  //   });
  // })();


  // //
  // // Issues
  // //

  // const issueDAO = foam.dao.PromisedDAO.create({
  //   of: mdn.Issue,
  //   promise: fetch('data/issues/org.mozilla.mdn.Issue.json')
  //     .then(response => response.json())
  //     .then(json => foam.json.parse(json, mdn.Issue))
  //     .then(array => {
  //       const dao = foam.dao.MDAO.create({of: mdn.Issue});
  //       for (const row of array) {
  //         dao.put(row);
  //       }
  //       return dao;
  //     }),
  // });

  // const issueCtx = foam.createSubContext({
  //   queryParserFactory: x => mdn.parse.IssueQueryParser.create({
  //     of: mdn.Issue,
  //     interpreter: mdn.parse.SimpleIssueQueryInterpreter
  //       .create(null, x),
  //   }, x),
  // });

  // //
  // // Render
  // //

  // let view = mdn.MultiDAOControllerView.create({
  //   data: mdn.MultiDAOController.create({
  //     data: [
  //       mdn.DAOController.create({
  //         label: 'Confluence',
  //         data: confluenceDAO,
  //       }, confluenceCtx),
  //       mdn.DAOController.create({
  //         label: 'MDN Compat',
  //         data: mdnDAO,
  //       }, mdnCtx),
  //       mdn.DAOController.create({
  //         label: 'Confluence/MDN Issues',
  //         data: issueDAO,
  //         stack: foam.u2.stack.Stack.create(),
  //       }, issueCtx),
  //     ],
  //     foreignPredicateProviders: [
  //       mdn.ConfluenceCompatPredicateProvider.create(),
  //       mdn.CompatConfluencePredicateProvider.create(),
  //       mdn.ConfluenceIssuePredicateProvider.create(),
  //       mdn.IssueConfluencePredicateProvider.create(),
  //       mdn.CompatIssuePredicateProvider.create(),
  //       mdn.IssueCompatPredicateProvider.create(),
  //     ],
  //   }),
  // });
  // view.write(document);
})();
