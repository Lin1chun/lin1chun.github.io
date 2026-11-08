# Operations

## Branches and deployment

`main` is the production branch. A push to `main` starts
`.github/workflows/hugo.yaml`, verifies the site, and deploys the generated
artifact to GitHub Pages.

Pull requests run `.github/workflows/ci.yaml`. Keep the default branch
protected, require the CI check before merging, and delete short-lived branches
after merge.

## Release

1. Run `npm run verify`.
2. Update `package.json`, `package-lock.json`, and `CHANGELOG.md`.
3. Commit with `chore: release vX.Y.Z`.
4. Create an annotated tag with
   `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
5. Push with `git push origin main --follow-tags`.

The tag workflow creates a GitHub release from generated release notes.

## Rollback

Prefer a reviewed revert commit:

```bash
git revert <bad-commit>
npm run verify
git push origin main
```

The next deployment then contains the repaired state. Use a release tag to
identify the last known good state for comparison and recovery.

## Neuro-sama feed snapshot

The scheduled workflow refreshes `data/neuro_blog_feed.json`. A failed fetch
keeps the previous snapshot. Refresh manually with:

```bash
npm run sync:neuro-feed
npm run verify
```

Commit the snapshot only when the workflow reports a real change.

## Incident checklist

1. Stop publishing unrelated content changes.
2. Identify the last successful Pages deployment and matching commit or tag.
3. Reproduce the problem locally with `npm run verify`.
4. Revert the offending commit.
5. Check links and affected pages at desktop and mobile widths.
6. Record reader-visible incidents in the article history or changelog when
   their meaning changed.
