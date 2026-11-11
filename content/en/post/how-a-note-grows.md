---
author: ["Lin1chun"]
title: "Hugo page bundles, stages, and revision history"
description: "How this site uses page bundles for article assets, the stage taxonomy for draft maturity, category metadata, revision history, and fullscreen layouts."
date: 2026-09-18T00:00:00+08:00
type: post
draft: false
translationKey: how-a-note-grows
cover: "/images/flowlines/27.svg"
coverAlt: "A flowline pattern widening from a thin stem into a fuller shape."
tags: ["hugo"]
categories: ["Making"]
stage: "evergreen"
history: [
    {date = "2026-10-13", stage = "seedling", note = "First outline."},
    {date = "2026-10-16", stage = "budding", note = "Added the page bundle and revision notes."},
    {date = "2026-10-18", stage = "evergreen", note = "Checked the examples against the site."}
]
coffee: 2
---

Articles use Hugo page bundles so the text and its supporting files stay in one directory. This makes it possible to move or archive a complete article without tracking assets in several locations.

## Page bundle layout

A basic article bundle has this structure:

```text
content/en/post/a-note/
├── index.md
├── cover.webp
└── audio.ogg
```

The site uses three conventions:

- `index.md` contains the article text and front matter.
- `cover.*` supplies the article card image and social metadata image.
- `audio.*` optionally supplies an audio version of the article.

The cover description belongs in the page's `coverAlt` field. A screen reader user needs the same explanation of the image that a sighted reader receives.

## Draft stages

The `stage` taxonomy records how complete an article is. This site defines three terms:

- `seedling`
- `budding`
- `evergreen`

The active stage appears near the article header and links to a page listing other articles in the same stage. A note can be published while it is still changing, and its stage can be updated when the text becomes more stable.

## Category pages

Category and tag pages can define their own title, description, and cover. Without that metadata, the taxonomy page only reflects its folder name.

## Revision history

The `history` list in front matter records meaningful revisions. Each entry can include:

- `date`
- `stage`
- `author`
- `editor`
- `reviewer`
- `note`

The article template renders these entries below the main text. Use the history for changes that affect the content, such as a new source, a corrected explanation, or a reorganized section. Typo fixes and formatting-only changes do not need an entry.

## Fullscreen pages

Pages that need the full window use `type: fullscreen`. This layout suits maps, large diagrams, and visual indexes that would be too small inside the normal article column.

Markdown remains the default for article content. Raw HTML is reserved for structures that Markdown cannot express, such as fullscreen embeds and complex figures. Keeping that exception narrow makes those pages easier to find and review.

## Publishing checklist

Before publishing a page bundle:

1. Put `index.md` and its media files in the same directory.
2. Set `coverAlt` when the page has a cover image.
3. Set the `stage` value to the current maturity of the article.
4. Add a `history` entry when the revision changes the article's meaning.
5. Run `npm run check` and verify the generated page.
