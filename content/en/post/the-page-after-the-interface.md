---
author: ["Lin1chun"]
title: "The page after the interface"
description: "Markdown, margin notes, native math, and the parts of a page that still need to work when the decoration leaves."
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

The test page that came with this theme was full of headings, lists, code blocks, tables, and mathematical notation. It was useful while I was setting up the site, but it read like a checklist. The question underneath those examples was more interesting: what remains when the interface, the network, and the extra scripts are removed?

A page still needs a clear title, readable paragraphs, enough contrast, and a way to move through the document with a keyboard. It should print without losing the argument. It should make sense when JavaScript fails.

## Markdown for the document structure

Most posts use Markdown. Headings form the table of contents, blockquotes carry quotations, code fences preserve indentation, and tables keep small comparisons in one place. These structures are easy to search and easy to translate.

I use raw HTML only when Markdown cannot express the shape of the content. The site allows it for figures, details, and the small number of pages that need a full-screen embed. Keeping that permission narrow makes the exceptions easier to find.

Inline code looks different from surrounding prose, and a long code block gets its own background and horizontal scroll. At narrow widths, the code moves inside its own container instead of forcing the whole page wider.

## Notes in the margin

The Tufte-inspired pieces use margin notes for an aside that would interrupt the main sentence. A margin note works when the reader can ignore it and still follow the article. If the note changes the argument, it belongs in the text.

I use the `marginpar` shortcode for short additions, and the `epigraph` shortcode when a quotation needs an author and source. Both are small enough to remain part of the typography rather than becoming separate interface panels.

## Math without a renderer

Some equations are written in MathML so they remain part of the document when no math renderer loads. KaTeX and MathJax are available when a formula needs their formatting, but they bring stylesheets and scripts with them. That cost should be paid by the page that needs it.

I make the same choice elsewhere: start with native HTML, use a shortcode when the structure needs help, and load a larger tool only when the content cannot be written clearly without it.

## What I check before publishing

I check a new page at a wide window and at 390 pixels. I switch the colour scheme, increase the font size, and open the accessibility panel. I follow the headings with a keyboard and read the link text without the surrounding paragraph. When an image carries meaning, it gets a description. When it is decoration, it stays out of the accessibility tree.

These checks do not guarantee that every reader will have the same experience. They catch the obvious places where the page stops being a page and becomes a container for scripts.

The final test is the print view. If the margins, captions, and code blocks still make sense on paper, the structure is usually sound.
