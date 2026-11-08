# Contributing

This is primarily a personal publication repository. Corrections, accessibility
reports, and focused maintenance contributions are welcome.

## Local setup

1. Use the Node.js version in `.nvmrc` and the Hugo Extended version in
   `.hugo-version`.
2. Initialize the pinned theme with
   `git submodule update --init --recursive`.
3. Install dependencies with `npm ci`.
4. Start the site with `npm run dev`.

## Before submitting a change

Run the complete verification gate:

```bash
npm run verify
```

For reader-visible changes, also inspect the affected pages at desktop and
mobile widths. Keep article media inside the relevant page bundle and preserve
the source and licensing information for third-party material.

## Pull requests

- Use a short, descriptive title in conventional-commit form.
- Keep one logical change per commit.
- Explain reader-visible changes and any deployment risk.
- Update `CHANGELOG.md` for release-worthy additions, changes, or fixes.
- Do not force-push the published `main` branch.

Changes to CI, deployment, licensing, shared layouts, or security-sensitive
code should be reviewed before merging. See [SECURITY.md](SECURITY.md) for
private vulnerability reporting.

Shortcode copy follows the repository instructions in [AGENTS.md](AGENTS.md).
Versioning and release steps are documented in [VERSIONING.md](VERSIONING.md).
