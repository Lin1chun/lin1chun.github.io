# Lin1chun's Website

[![CI](https://github.com/Lin1chun/lin1chun.github.io/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/Lin1chun/lin1chun.github.io/actions/workflows/ci.yaml)
[![Pages](https://github.com/Lin1chun/lin1chun.github.io/actions/workflows/hugo.yaml/badge.svg?branch=main)](https://github.com/Lin1chun/lin1chun.github.io/actions/workflows/hugo.yaml)
[![License](https://img.shields.io/badge/license-split%20by%20scope-blue)](LICENSING.md)

A personal site for notes on code, internet culture, drawing, and the ideas
that gather around them. Built with [Hugo](https://gohugo.io/) and
[hugo-brewm](https://github.com/foxihd/hugo-brewm), then published to GitHub
Pages from the `main` branch.

**[Visit the website](https://lin1chun.github.io/)**

## Stack

- Hugo Extended `0.168.0`, pinned in `.hugo-version`
- Node.js `24`, pinned in `.nvmrc`
- hugo-brewm `v2.11.1`, pinned as a Git submodule
- Pagefind for local search
- GitHub Actions for pull-request checks and deployment
- Dependabot for npm, Actions, and submodule maintenance

## Local development

Clone with the pinned theme, install dependencies, and start the preview:

```bash
git clone --recurse-submodules https://github.com/Lin1chun/lin1chun.github.io.git
cd lin1chun.github.io
npm ci
npm run dev
```

The preview is available at <http://localhost:1313/>. If the repository was
cloned without submodules, run:

```bash
git submodule update --init --recursive
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Hugo preview |
| `npm run check` | Validate JavaScript, JSON, repository structure, and Hugo |
| `npm run verify` | Run the complete release gate |
| `npm run build` | Build the production site and Pagefind index |
| `npm run check:links` | Audit internal links in an existing build |
| `npm run sync:neuro-feed` | Refresh the Neuro-sama post snapshot |
| `npm run generate:zju-growth` | Regenerate the ZJU Growth reading pages |

## Content workflow

Create a post with:

```bash
hugo new content/en/post/my-post.md
```

Posts live in `content/en/post/` and keep `type: post` in their front matter.
Keep page-specific images and files in the same page bundle. Drafts, theme
examples, and test pages are excluded from the production site.

The complete ZJU Growth source archive stays outside version control under
`.local/cc98/6266766/`. Generated reading pages are reviewed for privacy before
publication:

```bash
npm run generate:zju-growth
npm run dev
npm run generate:zju-growth -- --publish
```

## Repository map

| Path | Responsibility |
| --- | --- |
| `content/en/` | Pages, post bundles, taxonomies, and front matter |
| `layouts/` | Site-specific layouts and shortcodes |
| `assets/` | CSS and JavaScript processed by Hugo |
| `static/` | Runtime assets with stable public URLs |
| `data/` | Build-time snapshots |
| `scripts/` | Validation and content-maintenance tooling |
| `themes/hugo-brewm/` | Version-pinned theme submodule |
| `docs/` | Architecture, operations, and history notes |
| `.github/` | CI, deployment, templates, and repository ownership |

More detail is available in [Architecture](docs/architecture.md) and
[Operations](docs/operations.md).

## Quality and deployment

`npm run verify` is the release gate. Every pull request runs it through
`.github/workflows/ci.yaml`; a push to `main` repeats the checks before
deploying through `.github/workflows/hugo.yaml`. Generated directories such as
`public/` and `resources/` are not committed.

## Maintenance

The repository uses conventional commits, semantic version tags, a maintained
[changelog](CHANGELOG.md), and the release process in [VERSIONING.md](VERSIONING.md).
Reader-facing changes are checked at desktop and mobile widths.

Contributions and corrections follow [CONTRIBUTING.md](CONTRIBUTING.md). Report
security issues privately using [SECURITY.md](SECURITY.md).

## Licensing

Original build code is available under the [MIT License](LICENSE). Original
articles, drawings, photographs, video, and other personal work remain all
rights reserved. Third-party components retain their own licenses.

The exact boundaries are documented in [LICENSING.md](LICENSING.md),
[CONTENT_LICENSE.md](CONTENT_LICENSE.md), and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
