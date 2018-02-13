var issueDAO;
(async function() {
  const chr = org.chromium.apis.web;
  const mdn = org.mozilla.mdn;

  issueDAO = foam.dao.PromisedDAO.create({
    of: mdn.Issue,
    promise: fetch('data/issues/org.mozilla.mdn.Issue.json')
      .then(response => response.json())
      .then(json => foam.json.parse(json, mdn.Issue))
      .then(array => {
        const dao = foam.dao.MDAO.create({of: mdn.Issue});
        for (const row of array) {
          dao.put(row);
        }
        return dao;
      }),
  });

  const ctx = foam.createSubContext({
    queryParserFactory: x => mdn.parse.IssueQueryParser.create({
      of: mdn.Issue,
      interpreter: mdn.parse.SimpleIssueQueryInterpreter
	.create(null, x),
    }, x),
  });
  mdn.DAOControllerView.create({
  }, mdn.DAOController.create({
    data: issueDAO,
  }, ctx)).write(document);
})();
