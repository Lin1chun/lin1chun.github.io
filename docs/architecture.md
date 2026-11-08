# Architecture

## Build pipeline

```mermaid
flowchart LR
  content["content/en"] --> hugo["Hugo Extended"]
  layouts["layouts + theme"] --> hugo
  assets["assets"] --> hugo
  data["data"] --> hugo
  hugo --> public["public/"]
  public --> pagefind["Pagefind index"]
  pagefind --> artifact["GitHub Pages artifact"]
  artifact --> deploy["GitHub Pages"]
```

`static/` is copied without processing. Page resources and image transforms
belong inside page bundles so Hugo can fingerprint, resize, or minify them
during the production build.

## Source boundaries

| Path | Responsibility |
| --- | --- |
| `content/en/` | Pages, page bundles, taxonomy metadata, and front matter |
| `layouts/` | Local shortcodes and overrides for hugo-brewm |
| `assets/` | JavaScript and CSS processed by Hugo |
| `static/` | Runtime assets that need stable public URLs |
| `data/` | Local snapshots consumed during the build |
| `themes/hugo-brewm/` | Pinned theme submodule |
| `scripts/` | Repository validation and maintenance automation |
| `docs/` | Architecture, operations, and historical records |

Local files under `layouts/`, `assets/`, and `content/en/` take precedence over
the theme. Update the theme submodule as a dedicated change.

## Quality gates

`npm run verify` is the release gate. It checks:

1. syntax for local JavaScript and module files;
2. JSON used by owned data and runtime assets;
3. repository structure, tracked files, and version consistency;
4. a production Hugo build;
5. Pagefind index generation;
6. internal links in generated HTML.

Pull requests run the full gate in CI. Deployment repeats the relevant checks
before uploading the Pages artifact.

## Content invariants

- Article front matter keeps `type: post`.
- Page-specific media stays in the article's page bundle.
- Shared runtime assets stay under `static/` with stable paths.
- Draft pages remain excluded from production output.
- Shortcodes follow the copy rules in `AGENTS.md`.
- Third-party source and licensing information stays with the asset.
