# Contributing

## Local setup

1. Use the Node.js version in `.nvmrc` and the Hugo version in `.hugo-version`.
2. Initialize the pinned theme:

   ```bash
   git submodule update --init --recursive
   ```

3. Install dependencies with `npm ci`.
4. Start the site with `npm run dev`.

## Before submitting a change

Run:

```bash
npm run verify
```

Also inspect reader-visible changes at desktop and mobile widths. Keep content and
its page-specific assets inside the same page bundle.

## Commit and review

- Follow the commit format in [VERSIONING.md](VERSIONING.md).
- Keep one logical change per commit.
- Use a pull request for changes that affect CI, deployment, licensing, or shared
  layout.
- Do not force-push `main`.

Shortcode copy follows [AGENTS.md](AGENTS.md).
