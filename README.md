# Tools for Cross-Referencing MDN Compat Data and Web API Confluence Data

These tools are intended for
[MDN Compat Data](https://github.com/mdn/browser-compat-data) curators to
leverage [Web API Confluence](https://web-confluence.appspot.com/) data.

## Installing, building, running locally

    npm install && npm run build

This will install the NPM package `firebase-tools` globally and build static
assets needed for deploying the web server. Next, generate local data to back
the dev server with:

    node \
      main/import.es6.js \
      --data-env=DEV \
      --confluence-release-url=https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.Release.json \
      --confluence-data-url=https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.GridRow.json \
      --update-issues=true

This will generate data in `data/` based on data at the supplied URLs and the
current version of MDN compat data insalled in `node_modules/`.

To start the web assets (firebase) server, use:

    firebase serve

This will serve `localhost:5000`. To start the data server, use:

    node main/server.es6.js --data-env=DEV

This will load data from your local `data/` directory. To view the
multi-collection cross-referencing page, point your browser at
`http://localhost:5000/multi`.

## [Demo](https://mdittmer.github.io/mdn-confluence/multi.html)

## Contributing

If you've got a great idea to make this better, please feel free to file issues
and/or submit pull requests.
