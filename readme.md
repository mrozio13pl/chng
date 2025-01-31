# chng [![npm](https://img.shields.io/npm/v/chng?label=%20&color=E5D4B8)](https://www.npmjs.com/package/chng) [![bundle size](https://img.shields.io/bundlephobia/minzip/chng?label=%20&color=E5D4B8)](https://bundlephobia.com/result?p=chng)

Simple, opinionated tool to create changelog from git history using
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Installation

Run installation either globally:

```bash
npm i -g chng
```

or install it to your dev dependencies:

```bash
npm i -D chng
```

## Usage

Run `chng` to generate changelog in the root of your repo.
[conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser)
is used to parse commit messages. The changelog will be written to
`CHANGELOG.md` file.

## Configuration

There are two ways to configure `chng`:

### Config file

Create a file named `chng.config.js` in the root of your repo or specify path to
the config file using `--config` flag.

> Note that it has to be a `ESM` module. If you are using `CommonJS` rename your
> config file to `chng.config.mjs` and use `--config chng.config.mjs`.

```mjs
import { defineConfig } from 'chng';

export default defineConfig({
    outputPath: 'CHANGELOG.md',
    types: {
        feat: true,
        chore: false,
        /* ... other conventional commit types ... */
    },
});
```

#### Determining new version

By default, `chng` will determine new version based on the commit message if it
matches `x.x.x` pattern. You can override this behavior by specifying
`versionCommit` function in the config:

```mjs
import { defineConfig } from 'chng';

export default defineConfig({
    versionCommit: (commit) => {
        if (commit.startsWith('v')) {
            return commit.slice(1); // version string, `x.x.x`
        }

        return false;
    },
});
```

#### Determining breaking changes

`chng` will determine breaking changes based on the commit message if it
contains `BREAKING CHANGE` keyword or the commit message is prefixed with `!`,
for example `feat!: some breaking change`. You can override this behavior by
specifying `breakingPattern` regexp in the config:

```mjs
import { defineConfig } from 'chng';

export default defineConfig({
    breakingPattern: /BREAKING CHANGE/,
});
```

### CLI usage

You can also configure `chng` using CLI flags:

```bash
chng v0.0.0

Usage:
  chng [flags...]

Flags:
  -b, --breaking-pattern <string>        Regexp for breaking changes
      --build                            Show Build System in the changelog
      --chore                            Show Chores in the changelog
      --ci                               Show Continuous Integration in the changelog
  -c, --config <string>                  Path to config file (default: "chng.config.js")
      --docs                             Show Documentation in the changelog
      --feat                             Show Features in the changelog
      --fix                              Show Bug Fixes in the changelog
  -h, --help                             Show help
  -o, --output <string>                  Output path (default: "CHANGELOG.md")
      --perf                             Show Performance Improvements in the changelog
      --refactor                         Show Code Refactoring in the changelog
      --release                          Show Releases in the changelog
      --revert                           Show Reverts in the changelog
      --style                            Show Styles in the changelog
  -t, --template <string>                Template path
      --test                             Show Tests in the changelog
      --version                          Show version

# Generate changelog
chng

# Use a custom template
chng --template custom-template.eta
```

## Custom Templates

You can create a custom template with [eta](https://github.com/eta-dev/eta). Use
`--template` flag to specify path to your template file or specify the path in
the config file.

### Changelog type

Changelog is basically an array of releases. Each release has the following
properties:

```ts
import type { CommitParser, CommitMeta, CommitNote, CommitReference, ParserOptions } from 'conventional-commits-parser';
import type { DefaultLogFields, ListLogLine } from 'simple-git';

type ConventionalCommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'perf' | 'test' | 'chore' | 'revert' | 'build' | 'ci' | 'release';

type ParsedCommit = {
    id?: string;
    message?: string;
    href?: string;
    author?: string;
    merge?: string;
    revert?: CommitMeta;
    header?: string;
    body?: string;
    footer?: string;
    notes: CommitNote[];
    mentions: string[];
    references: CommitReference[];
    commit: DefaultLogFields & ListLogLine;
    breaking: boolean;
} & Record<string, any>;

type ChangelogSection = {
    [type in ConventionalCommitType]?: ParsedCommit[];
} & {
    breaking?: ParsedCommit[];
    repo?: string;
    date: Date;
    href: string;
    version: string;
    formattedDate: string;
};

type Changelog = ChangelogSection[];
```

Example template:

```md
# Changelog

Example of a custom changelog template using eta.

<% it.releases.forEach(release => { %>

Every release has a version <%= release.version %> and a
[commit difference](<%= release.href %>). It also comes with a formatted date
<%= release.formattedDate %>.

<% if (release.breaking && release.breaking.length) { %>

### BREAKING CHANGES

<% release.breaking.forEach(change => { %>

-   <%= change.subject %> [`<%= change.commit.hash.slice(0, 6) %>`](<%=
    release.repo %>/commit/<%= change.commit.hash %>) <% }) %> <% } %>

<% if (release.feat && release.feat.length) { %>

### Features

<% release.feat.forEach(feat => { %>

-   <%= feat.breaking ? "**Breaking change:** " : "" %><%= feat.subject %> [`<%=
    feat.commit.hash.slice(0, 6) %>`](<%= release.repo %>/commit/<%=
    feat.commit.hash %>) <% }) %> <% } %>

<% if (release.fix && release.fix.length) { %>

### Fixes

<% release.fix.forEach(fix => { %>

-   <%= fix.breaking ? "**Breaking change:** " : "" %><%= fix.subject %> [`<%=
    fix.commit.hash.slice(0, 6) %>`](<%= release.repo %>/commit/<%=
    fix.commit.hash %>) <% }) %> <% } %>

<% }) %>
```

Checkout [eta](https://github.com/eta-dev/eta) docs for more information.

## License

MIT 💖
