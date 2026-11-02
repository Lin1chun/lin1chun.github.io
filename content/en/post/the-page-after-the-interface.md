---
author: ["Lin1chun"]
title: "Accessible page structure and progressive enhancement"
description: "How the site uses Markdown semantics, margin notes, native MathML, responsive code blocks, accessibility checks, and progressive enhancement to keep article content readable without JavaScript."
date: 2026-10-27T00:00:00+08:00
type: post
draft: false
translationKey: the-page-after-the-interface
cover: "/images/flowlines/34.svg"
coverAlt: "An open flowline structure with clear routes crossing the page."
tags: ["typography", "accessibility", "markdown"]
categories: ["Notes"]
stage: "evergreen"
coffee: 1
---

Article content should remain readable when JavaScript, external scripts, or advanced layout features are unavailable. The site therefore starts with semantic HTML and adds interactive behavior only where it provides a concrete benefit.

## Markdown as the document structure

Most articles use Markdown. The generated HTML carries the structure that navigation and assistive technology depend on:

- headings produce the table of contents.
- blockquotes identify quotations.
- code fences preserve indentation and language metadata.
- tables keep small comparisons in a fixed structure.

These elements can be searched, translated, and printed without custom rendering logic.

Raw HTML is available when Markdown cannot express the required structure. This site limits that exception to figures, disclosure blocks, and pages that need a fullscreen embed. Keeping raw HTML uncommon makes those sections easier to inspect.

Inline code uses a distinct visual style. Long code blocks remain inside their own container and scroll horizontally at narrow widths instead of widening the page.

## Margin notes

Tufte-style margin notes hold short additions that would interrupt the main paragraph. The note should be optional: a reader can skip it and still follow the article. If the note changes the argument, it belongs in the main text.

Use `marginpar` for short additions. Use `epigraph` when a quotation needs an author and source. Both remain part of the document typography rather than opening a separate interactive panel.

## Native math and optional renderers

Some equations use MathML, so the formula remains in the HTML when no math renderer loads. KaTeX and MathJax are available for pages that need their layout and typography, but each renderer adds CSS or JavaScript to that page.

The loading order is:

1. Use native HTML where it is sufficient.
2. Use a shortcode when the document structure needs one.
3. Load KaTeX or MathJax only when native HTML cannot represent the formula clearly.

## Responsive behavior

The site preserves the reading order at narrow widths. Headings and body text remain in one column, navigation moves into the existing menu control, and images do not force horizontal scrolling. Code blocks scroll within their own containers when a line is too long.

## Accessibility and print checks

Before publishing a page, check it in both a wide browser window and a 390-pixel viewport. The current checklist covers:

- light and dark color schemes
- lower, default, and higher contrast settings
- font size changes
- keyboard navigation through headings and controls
- link text without surrounding context
- alt text for informative images
- removal of decorative images from the accessibility tree
- document order with JavaScript disabled
- print layout for headings, captions, code, and margin notes

These checks do not prove that every browser or assistive technology will render the page identically. They catch regressions in the content model, reading order, and layout that affect the published article.

## Build checks

Run the complete local checks before publishing:

```bash
npm run check
npm run build
npm run check:links
```

The first command validates scripts and the Hugo build. The remaining commands generate the production site, create the search index, and check internal links.
