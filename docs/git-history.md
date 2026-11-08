# Git History

## Maintenance record

Before 2026-11-08, the repository contained two unrelated lineages: the current
Hugo site and an imported first-generation blog. The imported lineage included
many checkpoint commits with temporary subjects such as `init`, `NEWPOST`, and
repeated workflow changes.

The current `main` history preserves the modern site history and condenses the
first-generation work into eleven conventional commits. The content tree was
verified as identical before and after the cleanup. The original history is
retained in a local backup branch before the published migration is replaced.

## Policy

The cleanup was a one-time migration. Future published history is append-only:

- use conventional commit subjects;
- keep each commit focused on one logical change;
- use a branch and pull request for larger changes;
- revert production problems instead of rewriting `main`;
- create annotated release tags from the release commit.

This keeps the timeline understandable without preserving intermediate
work-in-progress commits in published history.
