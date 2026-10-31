---
author: ["Lin1chun"]
title: "A quieter front door"
description: "How I reduced the site's visual noise, rebuilt the navigation, and kept the technical parts close to the text."
date: 2026-10-11T00:00:00+08:00
type: post
draft: false
translationKey: building-the-basement
cover: "/images/flowlines/12.svg"
coverAlt: "A sparse flowline drawing moving toward a narrow opening."
tags: ["hugo", "design", "site"]
categories: ["Making"]
stage: "evergreen"
coffee: 2
---

The first version of this site inherited a whole display cabinet from the theme. Every part worked, but the homepage asked for attention in several directions at once. A carousel, a category wall, a theme introduction, and the latest posts were all competing for the first screen.

What I wanted was a doorway.

## A smaller front door

I kept the text logo because it carries the name without introducing another image that needs light and dark versions. The menu now has three jobs: open the writing, open the About page, and leave for GitHub. Everything else belongs inside the room.

The homepage no longer uses the slide carousel. The first slide was useful while the site had three unrelated starting points. After the About page and article index existed, the same links were already in the header. The carousel was repeating the navigation and taking up space that could hold a clear introduction.

The layout is now one opening statement, three selected articles, and the usual recent-posts feed. I left the recent feed in place because returning readers should be able to see what changed without opening another index. New visitors get a smaller set of choices first.

## One set of clothes

The theme's colour variables were enough for the whole site. Light and dark backgrounds have separate accent colours, and the higher and lower contrast modes adjust those values instead of adding a new visual system. I did not add gradients or cards to make the interface look busier. The flowlines already provide the texture.

The main typography is also left alone. The catalogue numbers, dates, labels, and code blocks have their own rhythm, and changing one of those styles tends to pull the rest out of place. A personal site can have a strong visual identity while using fewer kinds of visual language.

On small screens, the page collapses into a single reading column. The title stays visible, the menu folds behind the existing control, and the decorative image stops competing with the text. That behaviour was already in the theme, so the best change was to stop filling the mobile first screen with things that only made sense on a wide display.

## What the footer is for

I use the footer for the two places a reader is likely to go after finishing an article: the wider Neuro-sama archive and my own profiles. Footer sections are separate `type: footer` files with `headless: true`, so their bodies are available to the footer without becoming ordinary pages.

The navigation menu is deliberately shorter. A menu that lists every classification turns a visit into a filing exercise. The post index already has filters and the search box can handle the rest.

## Search in the room

Search is built with Pagefind after Hugo writes the site. Posts opt into the index with `type: post`; the About page and small utility pages stay out. This keeps results tied to pages a reader can actually use.

The search control belongs to the navigation, not the content. That matters on long articles where a reader may decide halfway through that they want something else. They do not have to scroll back to the top to find the search button.

## Leaving the discussion closed

The theme can connect comments to Giscus or a Fediverse post. I have left that door closed for now. There is no configured discussion provider, and showing an empty comment area would suggest a conversation that does not exist.

If discussions return, each article will get a real link rather than a generic form. The archive can stay readable on its own until then.

The rebuilt homepage is less impressive in a screenshot. It is easier to enter, and that is the part I care about.
