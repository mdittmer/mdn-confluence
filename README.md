# Tools for Cross-Referencing MDN Compat Data and Web API Confluence Data

These tools are intended for
[MDN Compat Data](https://github.com/mdn/browser-compat-data) curators to
leverage [Web API Confluence](https://web-confluence.appspot.com/) data.

## Installing, building, running locally

First, run:

    npm install

This will prepare an environment for the CLI.

### CLI

The CLI is meant for generating JSON files to produce candidate PRs for
[mdn/browser-compat-data](https://github.com/mdn/browser-compat-data). It can
be run using:

    node main/generate.es6.js [options/flags]

or

    npm run generate -- [options/flags]

Passing no `[options/flags]` will use the latest online Confluence data to
patch interfaces that already exist in `node_modules/browser-compat-data` and
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

## Contributing

If you've got a great idea to make this better, please feel free to file
issues and/or submit pull requests.
