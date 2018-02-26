(async function() {
  const mdn = org.mozilla.mdn;
  const chr = org.chromium.apis.web;

  mdn.WebClientContextProvider.create().install();
  const modelDAOProvider = foam.__context__.modelDAOProvider;
  const DAOProvider = foam.dao.WebSocketDAOProvider;
  //
  // Confluence
  //

  let confluenceDAO = foam.dao.ProxyDAO.create();
  const confluenceMonitor = mdn.ModelDAOMonitor.create({
    classId: 'org.mozilla.mdn.generated.ConfluenceRow',
    dao$: confluenceDAO.delegate$,
    daoFactory: (args, ctx) => DAOProvider.create({
      serviceName: 'confluence',
      port: mdn.ContextProvider.WEB_SOCKET_DATA_PORT,
    }).copyFrom(args).createClientDAO(ctx),
  });

  let confluenceCtx = await new Promise(
      (resolve, reject) => confluenceMonitor.dao$.sub(
          foam.events.oneTime((_, __, ___, $) => {
            try {
              resolve($.get().__subContext__);
            } catch (err) {
              reject(err);
            }
          })));
  const ConfluenceRow =
        confluenceCtx.lookup('org.mozilla.mdn.generated.ConfluenceRow');

  (function() {
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

    confluenceCtx = foam.createSubContext({
      selectable,
      selected,
      queryParserFactory: x => mdn.parse.ConfluenceQueryParser.create({
        of: ConfluenceRow,
        interpreter: mdn.parse.ReleaseApiConfluenceQueryInterpreter
            .create(null, x),
      }, x),
    });
  })();

  //
  // MDN compat
  //

  let mdnDAO = foam.dao.ProxyDAO.create();
  const compatMonitor = mdn.ModelDAOMonitor.create({
    classId: 'org.mozilla.mdn.generated.CompatRow',
    dao$: mdnDAO.delegate$,
    daoFactory: (args, ctx) => DAOProvider.create({
      serviceName: 'compat',
      port: mdn.ContextProvider.WEB_SOCKET_DATA_PORT,
    }).copyFrom(args).createClientDAO(ctx),
  });

  let mdnCtx = await new Promise(
      (resolve, reject) => compatMonitor.dao$.sub(
          foam.events.oneTime((_, __, ___, $) => {
            try {
              resolve($.get().__subContext__);
            } catch (err) {
              reject(err);
            }
          })));
  const CompatRow = mdnCtx.lookup('org.mozilla.mdn.generated.CompatRow');
  (function() {
    const selected = [CompatRow.ID].concat(
        CompatRow.getAxiomsByClass(mdn.BrowserInfoProperty)
          .filter(prop => {
            let pred = !/(mobile|android|ios)/i.test(prop.browserName);
            return pred;
          }));

    mdnCtx = foam.createSubContext({
      selected,
      queryParserFactory: x => mdn.parse.CompatQueryParser.create({
        of: CompatRow,
        interpreter: mdn.parse.BrowserInfoCompatQueryInterpreter
            .create(null, x),
      }, x),
    });
  })();

  //
  // Issues
  //

  const issueDAO = foam.dao.ReadWriteSplitDAO.create({
    reader: foam.dao.WebSocketDAOProvider.create({
      of: mdn.Issue,
      serviceName: 'issues',
      port: mdn.ContextProvider.WEB_SOCKET_DATA_PORT,
    }).createClientDAO(),
    writer: com.google.firebase.AwaitAuthenticationDAO.create({
      delegate: com.google.firebase.FirestoreDAO.create({
        collectionPath: 'issues',
      }),
    }),
  });
  const issueCtx = foam.createSubContext({
    selectionEnabled: true,
    queryParserFactory: x => mdn.parse.IssueQueryParser.create({
      of: mdn.Issue,
      interpreter: mdn.parse.SimpleIssueQueryInterpreter
        .create(null, x),
    }, x),
  });

  //
  // Render
  //

  let view = mdn.MultiDAOControllerView.create({
    data: mdn.MultiDAOController.create({
      data: [
        mdn.DAOController.create({
          label: 'Confluence',
          data: confluenceDAO,
        }, confluenceCtx),
        mdn.DAOController.create({
          label: 'MDN Compat',
          data: mdnDAO,
        }, mdnCtx),
        mdn.DAOController.create({
          label: 'Confluence/MDN Issues',
          data: issueDAO,
          stack: foam.u2.stack.Stack.create(),
        }, issueCtx),
      ],
      foreignPredicateProviders: [
        mdn.ConfluenceCompatPredicateProvider.create(),
        mdn.CompatConfluencePredicateProvider.create(),
        mdn.ConfluenceIssuePredicateProvider.create(),
        mdn.IssueConfluencePredicateProvider.create(),
        mdn.CompatIssuePredicateProvider.create(),
        mdn.IssueCompatPredicateProvider.create(),
      ],
    }),
  });
  view.write(document);
})();
