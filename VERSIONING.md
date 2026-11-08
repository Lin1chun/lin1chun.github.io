# Versioning

## Version format

The site uses semantic versioning in the form `MAJOR.MINOR.PATCH`, marked with
annotated Git tags such as `v0.6.0`.

- `MAJOR`: incompatible permanent URLs, content-model changes, or a site
  architecture replacement.
- `MINOR`: new pages, content series, or reader-visible functionality.
- `PATCH`: fixes, accessibility improvements, content corrections, and
  performance work.

The version in `package.json` and `package-lock.json` must have a matching
section in `CHANGELOG.md`.

## Commit format

Use conventional commit subjects:

```text
type(scope): imperative summary
```

Common types:

- `feat`: a new capability or reader-visible feature.
- `fix`: a bug or regression fix.
- `refactor`: an internal change without a behavior change.
- `content`: articles, metadata, and editorial organization.
- `style`: visual or formatting changes.
- `docs`: documentation and policy changes.
- `build`: dependencies and local tooling.
- `ci`: GitHub Actions and repository automation.
- `chore`: other maintenance work.
- `perf`: performance work.

Use a scope when it adds useful context. Keep one logical change per commit.

## Release process

1. Run `npm run verify`.
2. Update `package.json`, `package-lock.json`, and `CHANGELOG.md`.
3. Commit with `chore: release vX.Y.Z`.
4. Create an annotated tag:
   `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
5. Push the commit and tag with
   `git push origin main --follow-tags`.

The tag workflow creates a GitHub release from the generated release notes.
Published releases and tags are treated as immutable.

## History policy

Future shared history is append-only. Use a revert commit for a production
problem and a feature branch plus pull request for larger changes. The
2026-11-08 history cleanup is recorded in [docs/git-history.md](docs/git-history.md).
