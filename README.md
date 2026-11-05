# Lin1chun's Website

A personal site for notes on code, internet culture, drawing, and the ideas
that gather around them. Built with [Hugo](https://gohugo.io/) and
[hugo-brewm](https://github.com/foxihd/hugo-brewm), and published on GitHub Pages.

- Website: <https://lin1chun.github.io/>
- Repository: <https://github.com/Lin1chun/lin1chun.github.io>

## Stack

- Hugo Extended
- hugo-brewm, pinned as a Git submodule
- Pagefind for search
- GitHub Actions for checks and deployment

## Local development

Use the versions recorded in `.hugo-version` and `.nvmrc`, then install the site
and theme:

```bash
git clone --recurse-submodules https://github.com/Lin1chun/lin1chun.github.io.git
cd lin1chun.github.io
npm ci
npm run dev
```

The local site is available at <http://localhost:1313/>. If the repository was
cloned without submodules, run `git submodule update --init --recursive`.

## Common commands

```bash
npm run dev              # Start the local preview
npm run build            # Build the site and search index
npm run verify           # Check, build, and test internal links
npm run check:links      # Check links in an existing build
npm run sync:neuro-feed  # Refresh the Neuro-sama post snapshot
npm run generate:zju-growth  # Regenerate the ZJU Growth reading pages
```

## Writing

Create a post with:

```bash
hugo new content/en/post/my-post.md
```

Posts live in `content/en/post/` and must keep `type: post` in their front
matter. Put page-specific images and files in the same post bundle. Draft
articles, theme examples, and tests are excluded from the production site.

Site settings are in `config/_default/`, local styles and scripts are in
`assets/`, and local shortcodes are in `layouts/shortcodes/`. The theme remains
in `themes/hugo-brewm/` as a version-pinned submodule.

## ZJU Growth archive

The complete CC98 archive stays in `.local/cc98/6266766/`. The reading pages
under `content/en/life/zju-growth/` are generated from that archive and remain
drafts until reviewed for privacy:

```bash
npm run generate:zju-growth
npm run dev
```

After review, regenerate and publish the pages with:

```bash
npm run generate:zju-growth -- --publish
```

## Deployment

Pushing to `main` runs the Hugo build, checks internal links, and deploys the
result to GitHub Pages. Generated files such as `public/` and `resources/` are
not committed.

## Credits and licensing

Original source code is available under the [MIT License](LICENSE). Original
articles, drawings, photographs, video, and other personal work remain all
rights reserved unless a page says otherwise.

Third-party components and assets keep their own licenses. Local license files
are preserved for the theme, Flowline illustrations, Live2D Widget, and Hiyori
sample model. Pagefind is installed through npm and is distributed under the
MIT License. Source links and model terms are documented in the relevant
component directories.
