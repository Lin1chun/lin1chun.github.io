---
author: ["Lin1chun"]
title: "A note has to grow"
description: "The page bundles, growth stages, category pages, revision records, and full-screen layouts I use to keep unfinished ideas visible."
date: 2026-10-18T00:00:00+08:00
type: post
draft: false
translationKey: how-a-note-grows
cover: "/images/flowlines/27.svg"
coverAlt: "A flowline pattern widening from a thin stem into a fuller shape."
tags: ["authoring", "digital-garden", "workflow"]
categories: ["Making"]
stage: "evergreen"
history: [
    {date = "2026-10-13", stage = "seedling", note = "First outline."},
    {date = "2026-10-16", stage = "budding", note = "Added the translation and revision notes."},
    {date = "2026-10-18", stage = "evergreen", note = "Checked the examples against the site."}
]
coffee: 2
---

Most notes here begin as a folder with a half-finished sentence. Keeping the related files beside that sentence makes it easier to return later. A cover, an audio clip, a diagram, and the note itself can live under the same page bundle instead of being scattered through the site.

The folder shape is simple:

```text
content/en/post/a-note/
├── index.md
├── cover.webp
└── audio.ogg
```

A file named `cover.*` becomes the image used by the article card and social metadata. A file named `audio.*` can appear as the article's audio version. I add alt text in the note's front matter because the person reading with a screen reader needs the same reason for the image that a sighted reader gets.

## A stage is a promise

Not every note needs to arrive finished. The `stage` taxonomy gives me three honest positions: seedling, budding, and evergreen. The stage name appears at the top of the article and opens a page containing other notes in the same state.

The useful part is not the little indicator. It is the permission to publish a note before it has stopped changing. I can say that something is still forming, then update it when the idea has enough weight to stand on its own.

## Categories need a face

Category and tag pages can have their own titles, descriptions, covers, and translations. Without that, a category becomes a default page generated from a folder name. With a short introduction and a cover that matches the site, it becomes another place to browse.

The translation key matters here. An English category and its Chinese counterpart should share the same identity even when their titles and URLs differ. That key is what lets the language switch move between corresponding places instead of dropping the reader on a generic homepage.

## Leave the edit visible

The revision history is a small list in the front matter. Each entry can record a date, stage, author, editor, and a short note about what changed. It appears below the article rather than interrupting the reading.

I use it for articles that receive meaningful updates. A typo fix does not need a ceremony. A changed interpretation, a new source, or a section that moved because the older version was wrong should leave a trace.

## When a page needs the whole window

Full-screen pages are useful for maps, large diagrams, and visual indexes that would be cramped inside the normal article measure. They use a separate `fullscreen` type and keep the route back to the site in the footer.

Raw HTML is available for those pages, but I treat it as an exception. Markdown remains the default because it is easier to search, translate, and print. A full-screen page should earn the escape from the normal reading layout.

## Two versions, one note

The English and Chinese pages share a `translationKey`. That allows the language control to point to the same idea without pretending the translation is a separate article. Some older notes are still English-only; the site leaves them visible in English instead of placing an empty Chinese page beside them.

Unfinished notes stay visible here without being mistaken for final work.
