# Operations

## Branches and deployment

`main` is the production branch. A push to `main` starts
`.github/workflows/hugo.yaml`, builds the production site, and deploys the artifact
to GitHub Pages.

Pull requests run `.github/workflows/ci.yaml`. Do not force-push `main`; published
history and release tags are treated as immutable.

## Release

1. Run `npm run verify`.
2. Update `package.json`, `package-lock.json`, `CHANGELOG.md`, and
   `VERSIONING.md` when the version policy changes.
3. Commit with `chore: release vX.Y.Z`.
4. Create an annotated tag with `git tag -a vX.Y.Z -m "Release vX.Y.Z"`.
5. Push with `git push origin main --follow-tags`.

## Rollback

Prefer a reviewed revert commit:

```bash
git revert <bad-commit>
npm run verify
git push origin main
```

The next deployment then contains the repaired state. Avoid `git reset --hard` or
force-pushing a previously published branch. A tag can identify the last known
good state for comparison and recovery.

## Neuro-sama feed snapshot

The scheduled workflow refreshes `data/neuro_blog_feed.json`. A failed fetch keeps
the previous snapshot. To refresh manually:

```bash
npm run sync:neuro-feed
npm run verify
```

Commit the snapshot only when the workflow reports a real change.

## Incident checklist

1. Stop publishing further content changes.
2. Identify the last successful Pages deployment and matching commit or tag.
3. Reproduce locally with `npm run verify`.
4. Revert the offending commit rather than rewriting history.
5. Verify links, desktop layout, mobile layout, and the live deployment.
6. Record reader-visible incidents in the article history or changelog when
   their meaning changed.
