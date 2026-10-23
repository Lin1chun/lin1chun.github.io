---
title: "My second Bilibili stream: 60,000 people and one night of building the wall"
subtitle: "What started as two comment counts on a screen turned into a full-day livestream, several forced restarts, and 934.3 yuan."
date: 2026-02-21T00:00:00+08:00
type: post
draft: false
author: ["Lin1chun"]
description: "A first-person account of my second Bilibili livestream, from a sudden wave of comments and a DeepSeek-generated tracker to Bilibili's site-wide top 10, repeated shutdowns, and a more general version of the code."
tags: ["Bilibili", "livestreaming", "Arknights", "Honkai: Star Rail", "DeepSeek"]
categories: ["Life and culture"]
toc: true
secnum: true
---

{{< story-figure
    variant="hero"
    number="00"
    src="cover.jpg"
    alt="Live comment counter with two Bilibili videos and a live audience"
    caption="Once the recommendation feed picked up the stream, the middle of the screen still held only two comment counts."
    loading="eager"
>}}

<p class="live-lede">My first Bilibili livestream was me playing <em>Tiny Bunny</em> and trying not to mess up the controls. By the second one, I had stopped waiting for a perfect setup. I saw a burst of activity in a comment section, wrote a small program, and went live with two numbers on a screen.</p>

<div class="live-brief" aria-label="Stream overview">
  <div><span>Stream dates</span><strong>02.20-02.21</strong><small>Afternoon through early morning</small></div>
  <div><span>Single-stream views</span><strong>60,000+</strong><small>Split streams are not deduplicated</small></div>
  <div><span>Peak placement</span><strong>TOP 10</strong><small>Popularity chart: No. 61</small></div>
  <div><span>Final payout</span><strong>¥934.3</strong><small>Best split showed ¥906.9</small></div>
</div>

## At 01:54, the comment section woke up

The story began in the early hours of February 20, 2026. I refreshed the most-commented video on Arknights' official Bilibili account, the Summer Carnival limited-time event promotional PV for the SideStory "Dossoles Holiday." New comments were arriving faster than I had ever seen on that page.

Earlier that night and into the morning, comments tied to a controversy around the Honkai: Star Rail character Phainon's PV "Corona" began spilling into the video. I never found a complete and reliable account of what set off the controversy. There were too many versions online, and most of them carried a side. So I am only describing what I saw: a PV from 2021 suddenly received waves of new replies.

{{< story-figure
    variant="wide"
    number="01"
    src="01-before-stream.jpg"
    alt="Arknights Summer Carnival promotional PV open at 01:54"
    caption="At 01:54, a PV published in 2021 was still collecting new comments."
>}}

Another refresh and the discussion had turned into a relay. People kept repeating jokes about "repairing the Great Wall," "reinforcing the wall," and "building a cyber wall." Some treated it as a fandom fight. Others just found it funny that a crowd of strangers was awake and posting together. For me, the change on screen was simpler: an old event page was becoming a live event again.

{{< story-figure
    variant="wide"
    number="02"
    src="02-comment-wave.jpg"
    alt="Arknights comment section filled with repeated wall-building comments"
    caption="The same lines were copied and passed along. The comment section had stopped discussing the event and started acting like a construction site."
>}}

I had no plan for a livestream yet. I posted a short update saying, roughly, "I can't stop laughing, so many people are repairing the wall." In hindsight, that was the first draft of the stream.

{{< story-figure
    variant="compact"
    number="03"
    src="03-first-post.jpg"
    alt="Early update about Arknights players repairing the wall"
    caption="The first related post went up in the early hours of February 20 and reached 2,457 views."
>}}

## Turn the commotion into a screen

I remembered seeing YouTube streams that put subscriber, view, or like counts side by side whenever two creators were close in a ranking. People could watch the numbers move without refreshing several pages. Bilibili viewers were already jumping between videos to follow the comment race, and I had not seen a stream built around that comparison in my recommendations.

That gave me a clear job. I would not explain the drama or take a side. I would show the numbers.

I asked DeepSeek for a first version of the code. It polled the reply counts for two BV IDs, stored a short history, and sent the result to a page that refreshed on its own. The program was not elegant. The page was little more than a large readout, but it was enough to start.

{{< story-figure
    variant="wide"
    number="04"
    src="04-day-setup.jpg"
    alt="Comment count comparison for the Phainon and Dossoles PVs"
    caption="The daytime setup compared the reply counts for Phainon's PV 'Corona' and the Dossoles Holiday PV."
>}}

The gap between deciding to do it and going live was short. A trend does not wait for a polished product. By the time I had designed a complete interface, the comment section would probably have moved on. The second stream still made me nervous, but at least I knew where the browser window should go.

## Ten viewers, then a recommendation loop

The start was awkward. My account was small, the page mostly showed numbers, and only about ten people were watching. A stream like this needs viewers to comment, return, and bring other people in. Ten was almost nothing.

I went to the Dossoles Holiday PV and left a comment. I did not ask people to watch another channel. I told them the stream put both reply counts in one place, so they could skip the back-and-forth and keep "repairing the wall."

That matched what the comment section was already doing. People who had been spread across different videos now had one page where they could watch the numbers change. Some called friends after they arrived. More people brought faster chat, which made the stream easier to recommend, which brought more people. The loop finally started.

{{< story-figure
    variant="wide"
    number="05"
    src="05-live-1232.jpg"
    alt="Livestream with 1,232 concurrent viewers and 26,000 total views"
    caption="Around 14:52, 1,232 people were watching at once. The interaction earnings shown on the right were 63 yuan at that point."
>}}

{{< story-figure
    variant="compact"
    number="06"
    src="06-shared-in-comments.jpg"
    alt="Screenshots of the livestream appearing in other Bilibili comment sections"
    caption="Later, screenshots of the tracker started appearing under other videos too. Some viewers used the room as a quick way to check the race."
>}}

Then the stream moved much faster than I expected. It reached No. 10 across all of Bilibili and No. 61 on the popularity chart. One stream page showed more than 60,000 total views, and the recommendation page briefly placed my room next to top streamer Yongchu Taffy. For someone on his second livestream, those screenshots did not feel real.

{{< story-figure
    variant="compact"
    number="07"
    src="07-newcomer-24.jpg"
    alt="Livestream ranked 24th on the Bilibili newcomer chart"
    caption="The room also reached No. 24 on the newcomer chart that afternoon."
>}}

{{< story-figure
    variant="wide"
    number="08"
    src="08-bilibili-top10.jpg"
    alt="Tracker ranked 10th across Bilibili and 61st by popularity"
    caption="The stream page showed No. 10 site-wide, No. 61 by popularity, and 60,000 total views."
>}}

Those numbers measure different things. The 1,232 figure was concurrent viewers at one moment. The 60,000 figure was the total for one stream session. The site-wide rank and popularity rank also came from different charts. When Bilibili cut the broadcast into several sessions, each session started counting again. Adding the session totals would not give an accurate count of unique viewers.

{{< story-figure
    variant="compact"
    number="09"
    src="09-taffe.jpg"
    alt="Comment tracker next to Yongchu Taffy in the Bilibili recommendation feed"
    caption="For one moment, my tiny number board sat beside Yongchu Taffy in the recommendation feed."
>}}

Within a few hours, the question changed from "Will anyone watch?" to "How long before the next shutdown?"

## When Bilibili thought the stream was idle

A comment counter creates an awkward problem for a live platform. Viewers see the numbers moving. Bilibili may see a mostly static page. During the day, the platform repeatedly flagged the stream for "idle or prerecorded behavior," cut the broadcast, and removed recommendation access for a period.

{{< story-figure
    variant="wide"
    number="10"
    src="10-blocked.jpg"
    alt="Bilibili live moderation notices for idle and prerecorded behavior"
    caption="The backend recorded warnings, broadcast cuts, and temporary loss of recommendation access."
>}}

I reopened the stream, wrote another update to explain what had happened, and waited for viewers to find the room again. Some assumed I had ended on purpose. Others noticed the page return and called their friends back. That is also why the final traffic figures are messy: the demand stayed, but the session kept restarting.

## Song requests, a hot patch, and dark mode

Once the room filled up, people began requesting songs. I did not know Bilibili's request tools well and did not want to speak on mic, so I handled everything by hand. I read chat, wrote down titles, changed tracks, and kept checking the reply counts.

That was the most tiring part of the day. Requests arrived faster than I could process them. Music still carried much of the interaction. In a room without a face or a continuous voice, chat, songs, and the two numbers had to hold the attention together.

Later in the evening, the Arknights PV's reply count moved close to the count for Genshin Impact's Natlan Symphony Live. I added the third video to the page as a hot patch. The display changed from a two-way race to three lines moving toward one another.

{{< story-figure
    variant="wide"
    number="11"
    src="12-pass-genshin.jpg"
    alt="Dossoles PV reply count approaching and passing the Natlan Symphony count"
    caption="After the hot patch added Natlan Symphony Live, the Dossoles Holiday PV passed it."
>}}

As the night went on, traffic fell and my eyes started to hurt. The screen was too bright for a dark room, so I switched the tracker to a dark theme and shared the updated code. That small change got a warm response. Anyone who stares at a counter until dawn will appreciate a screen that hurts less.

{{< story-figure
    variant="compact"
    number="12"
    src="11-night-mode.jpg"
    alt="Post sharing the dark mode version of the comment tracker source code"
    caption="I shared the dark mode source code after 02:15. The screenshot shows the post, not a full recording of the stream."
>}}

## The 934.3 yuan

At one point overnight, the Arknights reply count dropped sharply. I kept watching the line and wondered whether the stream would have a clean ending. If the number stopped moving, what would be left of the room? The count recovered, and I finally closed the stream at a quieter moment.

The backend recorded 954.5 yuan in gift revenue. After platform settlement and tax deductions, 934.3 yuan reached my withdrawal account. One split showed 906.9 yuan. Most of the money came from Super Chats around midday.

Some of those paid messages were designed to provoke fights between anime and game communities. They brought more attention to the room and made up a large share of the earnings. I benefited from that traffic. I also got a clearer look at how easily a public ranking can turn group resentment into money and heat.

<div class="live-figure-grid">

{{< story-figure
    variant="wide"
    number="13"
    src="13-session-earnings.jpg"
    alt="Split stream earnings with one session at 906.9 yuan"
    caption="One of the forced splits showed 906.9 yuan in earnings."
>}}

{{< story-figure
    variant="wide"
    number="14"
    src="14-total-earnings.jpg"
    alt="Bilibili earnings backend showing gift revenue"
    caption="The backend showed 954.5 yuan in gifts. The final withdrawal after deductions was 934.3 yuan."
>}}

</div>

{{< story-figure
    variant="compact"
    number="15"
    src="15-withdraw.jpg"
    alt="Successful withdrawal of 934.3 yuan"
    caption="The 934.3 yuan withdrawal completed early on February 21."
>}}

## The code that ran that night

The version below is the final code I used during the stream. I copied it from the file I have now without changing the two BV IDs, the Chinese interface text, or the parts that only worked because I was in a hurry.

It is a single Flask application. A background thread fetches the reply counts, keeps the last 30 samples, and exposes them at `/api/comment-counts`. The browser polls that endpoint and redraws an ECharts line chart. The program assumes there are exactly two videos and uses shared dictionaries for its state.

Install its dependencies and run it with:

```bash
pip install flask flask-cors bilibili-api-python aiohttp
python original-monitor.py
```

The same dependencies are listed in [requirements.txt](requirements.txt).

{{< source-file
    src="original-monitor.py"
    language="python"
    label="Show the exact code that ran during the stream"
>}}

This code did its job, but it belongs to that night. The BVs are hardcoded, the UI has two fixed cards, every poll reads the same comment field, and concurrent reads and writes to the shared data are not protected by a lock. I would not start a new tracker from this file.

## What I would build now

The useful part of the original idea was not the interface. It was the shape of the problem: collect one public metric from several videos, keep a short history, and make the changes easy to compare.

A more general version should let me add videos by editing a config file instead of touching Python. It should also work for views, likes, favorites, coins, shares, and danmaku, not only comments. If one fetch fails, the other videos should continue updating, and the page should keep the last good values instead of falling to zero.

The version below does that. I wrote it from the original code rather than trying to make every line backward compatible.

It makes five changes:

1. A `videos` list replaces the two fixed BV variables. You can track any number of videos.
2. A `metric` setting supports replies, views, danmaku, likes, favorites, coins, and shares.
3. Each video has its own state and error field. One failed API call does not erase the others.
4. A lock protects the history while the polling thread and Flask requests access it.
5. The browser builds cards and chart series from the API response, so adding a video does not require editing the HTML.

The minimum polling interval is five seconds. Bilibili can rate-limit anonymous clients, and polling faster does not make the comparison more useful. The example defaults to ten seconds.

Create `config.json` from the included example:

```bash
cp monitor-config.example.json config.json
pip install flask flask-cors bilibili-api-python aiohttp
python generic-monitor.py
```

The server binds to `127.0.0.1:5000` by default. Set `MONITOR_HOST` only when you deliberately want the page reachable from another machine on your network.

{{< source-file
    src="monitor-config.example.json"
    language="json"
    label="Show the general version's example config"
>}}

{{< source-file
    src="generic-monitor.py"
    language="python"
    label="Show the general-purpose tracker"
>}}

This is still a small local tool. History lives in memory and disappears when the process restarts. There is no login or database, and the program cannot send alerts. The page also loads ECharts from a CDN. Those limits are fine for a livestream counter, and they keep the program short enough to understand.

## After the stream

I posted a summary just after 05:00 on February 21, shared the requested song list, and recommended other people who had started their own comparison streams. What began as a temporary page had picked up its own audience, memes, and follow-up conversations.

{{< story-figure
    variant="wide"
    number="16"
    src="16-summary-post.jpg"
    alt="Post-stream summary with the song playlist and links to other comparison streams"
    caption="The summary thanked everyone who helped 'build the wall,' shared the playlist, and pointed viewers toward other comment trackers."
>}}

One viewer sent me a meme they had made. Others asked the next day when I would go live again. Those replies were the first time I understood that the stream had become a gathering place. Two integers did not explain why everyone had stayed.

{{< story-figure
    variant="wide"
    number="17"
    src="17-meme.png"
    alt="Viewer-made meme about the two comment counts"
    caption="A viewer's meme turned the two climbing numbers into cartoon characters shouting at each other."
>}}

{{< story-figure
    variant="compact"
    number="18"
    src="18-next-day.jpg"
    alt="Viewers asking for another stream the following day"
    caption="The request for another stream stayed in the replies. That post received 772 views."
>}}

## I would still hit Go Live first

The first stream taught me how to start. The second taught me how much of a livestream happens after you press the button. I had to watch chat, correct the display, explain shutdowns, handle song requests, and decide what to change while people were already watching.

I cannot turn that day into a formula. The stream depended on a controversy I did not understand, comment counts that had built up for years, and enough people refreshing Bilibili at the right time. Luck did most of the work.

Luck still needs someone to act while it is there. My best decision may have been the least polished one: I stopped planning, ran the first version, and opened the stream.

If another opportunity appears, I will prepare song requests, moderation, and a better way to keep the tracker from looking idle. I will probably still open the stream first and fix the rest while it runs.

<div class="live-sources">

The screenshots come from my Bilibili dashboard, posts, and livestream. View counts from separate sessions were not deduplicated. Concurrent viewers, cumulative views, and chart rankings use different definitions. I did not find a reliable single account of the controversy around the Phainon PV "Corona," so this post records the visible comment activity without presenting an unverified explanation as fact.

DeepSeek conversations from the period: [record one](https://chat.deepseek.com/a/chat/s/83656d2a-4d66-4bbe-81ea-8cb2d0018384) and [record two](https://chat.deepseek.com/share/u56bln7ih1evjihcax).

</div>
