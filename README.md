# Tools for Cross-Referencing MDN Compat Data and Web API Confluence Data

These tools are intended for
[MDN Compat Data](https://github.com/mdn/browser-compat-data) curators to
leverage [Web API Confluence](https://web-confluence.appspot.com/) data.

## Installing, building, running locally

First, run:

    npm install && npm run build

This will prepare an environment for the CLI and web environments.

### CLI

The CLI is meant for generating JSON files to produce candidate PRs for
[mdn/browser-compat-data](https://github.com/mdn/browser-compat-data). It can
be run using:

    node main/generate.es6.js [options/flags]

or

    npm run generate -- [options/flags]

Passing no `[options/flags]` will use the latest online Confluence data to
patch intefaces that already exist in `node_modules/browser-compat-data` and
output them to `data/browser-compat-data`. The resulting files follow the
same directory structure as the `browser-compat-data` repository. To see
documentation for all `[options/flags]`, pass the `--help` flag.

The easiest way to prepare a PR is to obtain a clone of
`mdn/browser-compat-data`, ensure that both the clone and the copy in
`node_modules` are up to date, and send the output of the generate script to
your clone of `mdn/browser-compat-data`.

Here's a recipe for preparing a PR for the fictional `Foo` and `Bar`
interfaces, already documented in `mdn/browser-compat-data`:

    git clone https://github.com/mdn/browser-compat-data.git /path/to/mdn/browser-compat-data
    cd /path/to/mdn/browser-compat-data
    git checkout -b my-pr-branch
    cd /path/to/mdittmer/mdn-confluence
    npm update
    npm run generate -- --interfaces=Foo,Bar --output-dir=/path/to/mdn/browser-compat-data
    cd /path/to/mdn/browser-compat-data
    git diff

If the diff is empty, then Confluence and MDN agree on browser versioning
information for `Foo` and `Bar`. If not, you can make any manual adjustments,
commit and the change, and submit a pull request.

#### Cross-referencing data for pull requests

Updates based on Confluence data can be cross-referenced by linking to a view
of the [API Catalog](https://web-confluence.appspot.com/#!/catalog) that
shows relevant browser releases. Discovering such a view can be done
manually, but there is also a tool that generates a URL based on browsers and
an interface of interest. The URL generator is run with:

    node main/confluence.es6.js [options/flags]

or

    npm run confluence -- [options/flags]

To see documentation for all `[options/flags]`, pass the `--help`
flag. Here are some examples:

```bash
# HTMLDocument interface for all versions of Safari
npm run confluence -- -q HTMLDocument -b safari
# Sometimes the list of browsers is long (and slow to load). Specify just a few
# that highlight version info
npm run confluence -- -q AnimationEffectReadOnly -b firefox51,firefox52,firefox53,firefox54
# Browsers prefix match on browser and OS [name][version], so...
# As above, only Windows 10:
npm run confluence -- -q AnimationEffectReadOnly -b f51w10,f52w10,f53w10,f54w10
```

### Web UI

The web UI is for interactively cross-referencing Confluence and MDN compat
data. The UI has special dependencies that are installed via a BASH
script. To set up the dependencies in a UNIX-like environment, use:

    npm run uiBuild

To run the service locally, you need to generate local data for the dev
server:

    node \
      main/import.es6.js \
      --data-env=DEV \
      --confluence-release-url=https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.Release.json \
      --confluence-data-url=https://storage.googleapis.com/web-api-confluence-data-cache/latest/json/org.chromium.apis.web.GridRow.json \
      --update-issues=true

This will generate data in `data/` based on data at the supplied URLs and the
current version of MDN compat data installed in `node_modules/`.

To start the web assets (firebase) server, use:

    firebase serve

This will serve `localhost:5000`. To start the data server, use:

    node main/server.es6.js --data-env=DEV

This will load data from your local `data/` directory. To view the
multi-collection cross-referencing page, point your browser at
`http://localhost:5000/multi.html`.

- [Out-of-Date-but-Functional Demo](https://mdittmer.github.io/mdn-confluence/multi.html)

## Contributing

If you've got a great idea to make this better, please feel free to file
issues and/or submit pull requests.
