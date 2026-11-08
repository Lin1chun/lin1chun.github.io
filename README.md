# Lin1chun's basement

A personal site for notes on code, internet culture, drawing, and the things I
find below the surface.

**Website:** <https://lin1chun.github.io/>

The site is built with Hugo and the
[hugo-brewm](https://github.com/foxihd/hugo-brewm) theme. Hugo, Node.js, and the
theme version are pinned in `.hugo-version`, `.nvmrc`, and `.gitmodules`.

## Local preview

```bash
git clone --recurse-submodules https://github.com/Lin1chun/lin1chun.github.io.git
cd lin1chun.github.io
npm ci
npm run dev
```

The preview runs at <http://localhost:1313/>. If the theme submodule is missing:

```bash
git submodule update --init --recursive
```

## Writing

```bash
hugo new content/en/post/my-post.md
```

Posts belong in `content/en/post/`. Put post-specific images and downloads in
the same page bundle. Site configuration lives in `config/_default/`, local
styles and scripts in `assets/`, and overrides in `layouts/`.

Useful maintenance commands:

```bash
npm run verify               # Build and check the site
npm run build                # Build the site and search index
npm run sync:neuro-feed      # Refresh the Neuro-sama feed snapshot
npm run generate:zju-growth  # Regenerate the ZJU Growth pages
```

## Deployment

Pushing to `main` runs `.github/workflows/hugo.yaml`, builds the site, checks
internal links, and deploys it to GitHub Pages.

## License

Original build code is available under the [MIT License](LICENSE). Original
writing, images, video, and artwork remain all rights reserved unless a page
says otherwise. Third-party components keep their own licenses; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
