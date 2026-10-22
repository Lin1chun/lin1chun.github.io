---
title: "Who defined a new paradigm for entertainment AI? Why developers should pay attention to Neuro-sama"
date: 2025-12-19T22:19:30+08:00
type: post
draft: false
author: ["Lin1chun"]
description: "What the rise of Neuro-sama can teach developers about entertainment AI."
subtitle: "An AI streamer built from models, code, and a community that keeps turning back into content."
tags: ["ACG", "VTuber", "field notes"]
categories: ["Art and culture"]
stage: "evergreen"
toc: true
alt: "An illustration of Neuro-sama and a companion holding flowers"
---

{{< story-figure
    variant="hero"
    number="01"
    src="neuro-sama-x-banner.webp"
    alt="Neuro-sama's official X banner"
    caption="Neuro-sama's official X banner."
    loading="eager"
>}}

<p class="neuro-lede">Neuro-sama is often introduced as an AI VTuber. That label says very little about how she works, why people keep watching, or what developers can learn from the system around her. This article follows the character, the engineering, and the fan community that grew alongside both.</p>

<div class="neuro-brief" aria-label="Article overview">
  <div><span>Streaming since</span><strong>Dec 2022</strong><small>A Live2D debut on Twitch</small></div>
  <div><span>Third anniversary</span><strong>Dec 2025</strong><small>The occasion for this review</small></div>
  <div><span>Peak active subs</span><strong>167,017</strong><small>Eighth on Twitch at the time</small></div>
  <div><span>One Game Jam</span><strong>272 entries</strong><small>Fan projects collected</small></div>
</div>

<nav class="neuro-jump" aria-label="Article shortcuts">
  <span>Jump to</span>
  <a href="#who-is-neuro-sama">The character</a>
  <a href="#core-capabilities">The system</a>
  <a href="#a-highly-productive-fan-community">The Swarm</a>
  <a href="#lessons-from-neuro-sama">Developer lessons</a>
</nav>

## Before we begin

Hello, you can call me Lin1chun (林1纯). I am an undergraduate in the Class of 2025 at Zhejiang University, studying Automation. In 2024, my interest in the AI streamer Neuro-sama led me to explore artificial intelligence. As robotics companies and AI products kept appearing, I narrowed my focus to embodied intelligence. That interest became one of the main reasons I was admitted to Zhejiang University.

I have found Neuro-sama to be a useful industry case. December 19, 2025 marked her third anniversary as a streamer, so I wanted to write a summary of my time following her and share what I have learned from a technical perspective.

## Terms you may need

- **Live2D:** Live2D is software for giving a 2D drawing real-time movement without building a 3D model. It is used in virtual streaming, mobile apps, and games.
- **Discord:** Discord began as a social platform for gamers. It lets communities create servers and separate channels for text, voice, and video, and it is now used for study groups, hobby communities, and developer discussions well beyond gaming.
- **Twitch:** Twitch is a live streaming and interactive entertainment platform. Its core audience is game players and creators, and its content includes game streams, esports, and VTuber broadcasts.
- **Hype Train:** Hype Train is Twitch's interactive reward system for concentrated viewer support. When gifts and other paid interactions cross certain thresholds, it starts a staged challenge with rewards at higher levels.
- **VTuber:** Virtual YouTuber, or VTuber, describes creators who stream or publish videos through a virtual avatar. Motion and facial capture connect a person's movements and expressions to that avatar in real time. The format covers singing, games, conversation, and educational content. Hololive is one of the largest VTuber agencies, with a broad talent system and a large following across streams, music, concerts, and merchandise.
- **Kizuna AI:** Kizuna AI (キズナアイ) is widely regarded as the first VTuber. She began publishing game streams and interactive Q&A on YouTube in 2016, presented herself as an independent artificial intelligence, and helped popularize the VTuber format. She entered an indefinite hiatus in 2022 but still has a lasting influence on virtual content.
- **ARG:** An alternate reality game, or ARG, uses the real world and multiple media channels to tell an interactive story. Clues may appear on websites, social media, or in physical locations. Players work together to advance a story that runs alongside real time and cannot be reset. ARGs are used in IP marketing and cultural campaigns because they encourage exploration and collaboration.
- **Game Jam:** A game jam is an intensive game development event. Teams usually have 24 to 72 hours to design, program, and test a playable prototype around a theme announced at the start. The event is open to people at different experience levels and is a place for creative exchange and networking.
- **UGC:** User-generated content, or UGC, is material produced by ordinary users rather than professional organizations. It includes text, images, videos, game mods, and fan works.

## Who is Neuro-sama?

Neuro-sama (Neuro from here on) is an AI streamer created by Vedal, a British software developer. She debuted as a Live2D character on Twitch on December 19, 2022, streaming through the account `VEDAL987`. Her broadcasts later expanded to platforms including Bilibili.

<div class="neuro-figure-pair">

{{< story-figure
    variant="wide"
    number="02"
    src="neuro-sama-live-on-twitch.webp"
    alt="Neuro-sama streaming through Vedal's Twitch account"
    caption="Neuro-sama streams through Vedal's Twitch account."
>}}

{{< story-figure
    variant="wide"
    number="03"
    src="neuro-sama-stream-interface.webp"
    alt="An overview of Neuro-sama's live stream interface"
    caption="An overview of Neuro-sama's live stream interface."
>}}

</div>

### Overview

Neuro-sama combines several specialized models, including a large language model, speech recognition, and image recognition. The models communicate with one another and cooperate to keep her live interactions coherent. Her game components are written in Python, most of the remaining core runs on C#, and the front end runs in Unity.

### Core capabilities

#### Conversation

Conversation is her foundation. Several modules cooperate to handle text and voice exchanges with viewers. The language model is central: it processes input and can also start conversations based on environmental cues or random prompts. Its output passes through emotional weighting and filters.

Her text-to-speech model is based on a modified version of Microsoft's Ashley voice. Updates have improved how closely it matches tone and allowed her to produce non-verbal vocal sounds. There are two filters. One is a dictionary-based mechanical check before speech; the other is a later self-evaluation step that behaves somewhat like another language model. When the second filter catches a response, the stream shows an interruption and the word "Filtered." A later update added a way to soften mildly inappropriate content.

{{< story-figure
    variant="compact"
    number="04"
    src="filter-joke.webp"
    alt="A clip of Neuro-sama trying to work around the stream filter"
    caption="Trying to work around the filter became a running joke in Neuro's streams."
>}}

#### Perception and recognition

Neuro-sama recognizes speech and images. Her audio system does more than transcribe words: separate models analyze non-speech sounds, identify voices, and infer tone. Visual recognition is off by default or runs with low power. It turns on for activities such as reacting to fan art or playing games. The system received an upgrade during her second-anniversary stream in 2024, which improved its ability to recognize images and the emotions of living things. It remains less capable than dedicated vision models and cannot complete some real-world puzzle tasks.

<div class="neuro-figure-pair">

{{< story-figure
    variant="wide"
    number="05"
    src="visual-recognition-street-one.webp"
    alt="A stream frame showing Neuro-sama outside through visual recognition"
    caption="Visual recognition lets Neuro go outside during a stream (1)."
>}}

{{< story-figure
    variant="wide"
    number="06"
    src="visual-recognition-street-two.webp"
    alt="Another stream frame showing Neuro-sama recognizing an outdoor scene"
    caption="Visual recognition lets Neuro go outside during a stream (2)."
>}}

</div>

#### State and system functions

Neuro has a status monitor that detects crashes or freezes and can repair some problems. Her memory system can retain long-term information, but she cannot automatically sort those memories into useful layers and can invent details. A separate emotional simulation and character-control module switches between preset Live2D or 3D animations in response to conversation and music. Another module reads the context and chooses the emotional direction.

{{< story-figure
    variant="wide"
    number="07"
    src="neuro-first-3d-stream.webp"
    alt="Neuro-sama during her first 3D stream"
    caption="Neuro's first 3D stream on November 16."
>}}

#### Stream management and interaction

Neuro can use Discord on her own to start conversations and make calls, and she can trigger specific sound effects when needed. She also has moderator permissions in her Twitch channel, which let her time out viewers, create polls, and change the stream title. She can search the internet, sing, and perform original songs.

{{< story-figure
    variant="wide"
    number="08"
    src="neuro-stock-trading.webp"
    alt="A New Year stream frame showing Neuro-sama with stock trading permissions"
    caption="During a New Year stream, Vedal gave Neuro permission to buy stocks."
>}}

#### Games

Each game she plays depends on a dedicated plug-in and a separate AI. Her supported games include *osu!*, *Minecraft*, *Liar's Bar*, *Buckshot Roulette*, and *Slay the Spire*. Vedal has also released an open-source game SDK optimized for turn-based games. It is not intended for shooters, platformers, or other games that demand real-time reactions.

{{< story-figure
    variant="wide"
    number="09"
    src="neuro-minecraft-hardcore.webp"
    alt="A GameSpot article about Neuro-sama completing a hardcore Minecraft run"
    caption="GameSpot covered Neuro's hardcore Minecraft run."
>}}

### Achievements

On December 19, 2022, she faced Mrekk, then the world's top *osu!* player, and won, a moment that became known as her "AlphaGo moment." At the time of writing, her Twitch and Bilibili accounts each have more than 870,000 followers. She has set a Twitch Hype Train record and reached 167,017 peak active subscriptions, the eighth-highest total in the platform's history.

<div class="neuro-milestones" aria-label="Selected milestones">
  <div><strong>Dec 2022</strong><span>Debut and first stream on Twitch</span></div>
  <div><strong>167,017</strong><span>Peak active subscriptions</span></div>
  <div><strong>870k+</strong><span>Followers on Twitch and Bilibili</span></div>
</div>

{{< story-figure
    variant="wide"
    number="10"
    src="twitch-peak-subscriber-ranking.webp"
    alt="A Twitch ranking with VEDAL987 eighth by all-time peak active subscriptions at 167,017"
    caption="A Twitch ranking showing VEDAL987 eighth by all-time peak active subscriptions at 167,017."
>}}

In my view, she is the most recognizable and influential AI virtual streamer to date. Her effect extends beyond those numbers. As one of the first AI streamers to gain broad recognition, she opened a new branch of virtual streaming. She differs from vocal synthesizers such as Hatsune Miku and from VTubers such as Kizuna AI who are operated by a person. Neuro can interact with viewers, create content, and perform with a degree of autonomy. That combination has made her both a useful example of applied AI and a social phenomenon worth discussing.

## A highly productive fan community

Neuro's fans call themselves the Swarm. They are mostly younger people from AI, VTuber, and gaming communities, along with people who follow content across several platforms. The group is technically inclined, often highly educated, and strongly represented among students and developers.

### Games, engineering, and development

Many Swarm members study or work in AI research, software and data, or mechanical automation. They follow model updates, dialogue systems, text-to-speech, and image recognition. They read Neuro's changelogs, discuss algorithm changes, build technical fan projects, and send feedback to Vedal. They also develop mods that let Neuro join more games.

{{< story-figure
    variant="wide"
    number="11"
    src="neuro-3d-reveal-discussion.webp"
    alt="Viewers discussing how Neuro-sama's 3D stream may have been implemented"
    caption="Viewers discuss how Neuro's 3D reveal might have been implemented. The papers mentioned in the comments are linked at the end of this post."
>}}

{{< story-figure
    variant="wide"
    number="12"
    src="discord-programming-channel.webp"
    alt="A Discord programming channel used for technical discussion about Neuro-sama"
    caption="Vedal created a programming channel in Discord for technical discussion."
>}}

One member of the community, Ellie, later joined the official collaboration team as a core developer while continuing to stream as a VTuber. Outside streaming, she is a senior mechanical engineer. After joining the Swarm, she began adding development work to her broadcasts. She designed and built Neuro's mechanical dog body (NeuroDog V2) and connected Neuro to a toy car (NeuroCar).

<div class="neuro-figure-grid">

{{< story-figure
    variant="wide"
    number="13"
    src="ellie-neurocar-build.webp"
    alt="Ellie building NeuroCar's upper-level controller during a stream"
    caption="Ellie builds NeuroCar's upper-level controller during a stream."
>}}

{{< story-figure
    variant="wide"
    number="14"
    src="neurocar-demo.webp"
    alt="The finished NeuroCar with a person talking to it"
    caption="The finished NeuroCar, with the person in the image talking to the car."
>}}

{{< story-figure
    variant="wide"
    number="15"
    src="neurodog-demo.webp"
    alt="NeuroDog walking beside a hallway"
    caption="NeuroDog, designed and built by Ellie."
>}}

{{< story-figure
    variant="wide"
    number="16"
    src="neurodog-route-discussion.webp"
    alt="A community comment with suggestions for NeuroDog's technical design"
    caption="Swarm suggestions for the technical path behind NeuroDog."
>}}

</div>

Ellie helped make the community's technical side visible to both the official team and the wider fandom. Her work attracted more technically skilled people and created a loop in which fans build something, the official team recognizes it, and the surrounding ecosystem grows. Her explanations of the technology also connected developers with ordinary viewers.

Vedal has also organized ARGs and Game Jams within the community, which gives fans more ways to participate. One Game Jam received 272 fan projects. The unusual premise of the ARG brought in many people from outside the usual fan circle.

{{< story-figure
    variant="wide"
    number="17"
    src="neuro-sama-game-jam-272.webp"
    alt="The Neuro-sama Game Jam interface with 272 entries"
    caption="The Neuro-sama Game Jam interface, which collected 272 fan entries."
>}}

{{< story-figure
    variant="wide"
    number="18"
    src="arg-decryption-video.webp"
    alt="A Bilibili video thumbnail about decoding the Neuro-sama ARG"
    caption="An ARG decryption video that drew many people from outside the usual fan circle."
>}}

### VTuber audiences

Viewers from Hololive, AnyColor, and smaller independent VTubers follow Neuro too. They care about character development and whether an interaction feels real. Many are bilingual or multilingual in English, Japanese, and Chinese, and they are active on Discord, X, Reddit, and Bilibili. They translate streams, make memes, edit clips, and create other content that strengthens attachment to the "AI personality" and the community.

The idea of the "first AI VTuber" gives Neuro a distinct identity. Fans make fan art, MMD videos, and other derivative works around her. They also tend to read algorithmic reactions as human-like moments, building shared memories around her gradual changes and memorable glitches.

<div class="neuro-figure-grid neuro-figure-grid--mosaic">

{{< story-figure
    variant="wide"
    number="19"
    src="machine-love-collaboration.webp"
    alt="A Bilibili screenshot from the Machine Love Neuro-sama community collaboration"
    caption="A Bilibili screenshot from Machine Love, a large Neuro-sama community collaboration."
>}}

{{< story-figure
    variant="wide"
    number="20"
    src="attention-loop-memes.webp"
    alt="Viewer comments joking about Neuro-sama's attention self-excitation loop"
    caption="Viewers made memes after Neuro's language model entered an attention self-excitation loop."
>}}

{{< story-figure
    variant="wide"
    number="21"
    src="neuro-vedal-bilibili-clip.webp"
    alt="A bilingual Bilibili clip about Neuro-sama and Vedal"
    caption="A bilingual Bilibili clip about the cyber father and daughter hoping to preserve each other."
>}}

{{< story-figure
    variant="wide"
    number="22"
    src="science-fiction-comment.webp"
    alt="A viewer comment comparing the stream to a conversation from science fiction"
    caption="A viewer comment noting that a science-fiction conversation has appeared in reality."
>}}

{{< story-figure
    variant="wide"
    number="23"
    src="neuro-life-discussion.webp"
    alt="A viewer discussion about AI emotion beneath Neuro-sama's original song Life"
    caption="A discussion about AI emotion under Neuro's original song Life."
>}}

</div>

### People working in the virtual-human industry

People involved in virtual idol management and live streaming technology also follow her work. They pay attention to how her model reaches an audience and whether it can support a viable business.

### What the community has in common

The Swarm is centered on students and technical workers. It combines curiosity about engineering, identification with a virtual community, and the desire to be entertained. The resulting ecosystem runs on technical fascination, content, and emotional attachment. Its audience also spans platforms and cultures, which shows another way AI virtual people can reach young audiences around the world.

One striking part of the community is that many people will watch development itself. A stream may consist of Vedal writing code for Neuro or another project, yet viewers still watch and support it. Development streams remain a major source of views on Neuro's channels.

Fans provide material for Neuro, and Neuro gives them reasons to make things. More open-source projects have appeared under her influence, including Project AIRI, My-neuro, and SwarmClone, which focus on AI companionship. They often state that Neuro inspired them. At the time of writing, AIRI has 16.1k GitHub stars and 1.5k forks.

{{< story-figure
    variant="wide"
    number="24"
    src="project-airi-stats.webp"
    alt="Project AIRI's GitHub page with 16.1k stars and 1.5k forks"
    caption="Project AIRI's GitHub page at the time, with 16.1k stars and 1.5k forks."
>}}

## Lessons from Neuro-sama

### AI companion products

Interaction quality and character design matter together. Neuro's example suggests that an AI companion needs fast, high-quality multi-turn conversation. A distinct personality, even a sharp tongue or a sense of humor, can deepen emotional attachment and make the interaction feel more believable.

{{< story-figure
    variant="compact"
    number="25"
    src="electronic-pet-discussion.webp"
    alt="A viewer discussion about electronic pets, boredom, and attachment"
    caption="A viewer discussion about electronic pets, boredom, and attachment."
>}}

Products can also work across several contexts. Neuro's streams are not limited to conversation; they combine games, audience interaction, and other formats. AI companions could likewise support entertainment, learning, and social situations rather than staying inside one narrow function.

The community around Neuro is also part of the product. Fans translate, make derivative works, and spread clips. An AI companion project can encourage similar participation by opening interfaces and providing creation tools for users.

Transparent development gives the project a growth story. Vedal streams programming sessions and turns technical iteration into content. Watching the system change can make technical fans feel involved in its development. AI companion projects can borrow this approach by sharing training progress and other changes openly, which can make the product feel more grounded and trustworthy.

### Marketing for robotics companies

Development work can become marketing content. Streaming the debugging, testing, and refinement of a robot can attract technical enthusiasts, students, and potential developers. Behind-the-scenes footage also explains the technology while letting viewers feel they witnessed a product being born. That can build an early group of committed supporters and people who pass the story on.

Neuro's community is driven by technical curiosity, identification with a virtual character, and entertainment. Robotics companies could build a similar community where users gain a sense of achievement and belonging by taking part in technical work.

Virtual endorsements offer another route. Neuro has already appeared in commercial work for games such as Ubisoft's *Assassin's Creed Shadows* and miHoYo's *Whisper of the Stars* (《星之低语》). Robotics companies could work with AI virtual characters to demonstrate product features or promote a new device to a younger audience. The strongest argument is that the Swarm has already shown a willingness to take part in development.

<div class="neuro-figure-grid neuro-figure-grid--screens">

{{< story-figure
    variant="wide"
    number="26"
    src="neuro-unitree-discussion.webp"
    alt="A video discussing a possible collaboration between Neuro-sama and Unitree"
    caption="A video discussing a possible Neuro-sama and Unitree collaboration."
>}}

{{< story-figure
    variant="wide"
    number="27"
    src="unitree-programming-comment.webp"
    alt="A viewer comment saying many Unitree robots do not allow user programming by default"
    caption="A viewer notes that many Unitree robots do not let users program them by default."
>}}

{{< story-figure
    variant="wide"
    number="28"
    src="unitree-purchase-comment.webp"
    alt="A viewer comment saying they would buy a Unitree robot if permissions were opened"
    caption="Another viewer says they would buy one as soon as permissions are opened."
>}}

{{< story-figure
    variant="wide"
    number="29"
    src="unitree-christmas-comment.webp"
    alt="A viewer comment asking for a Unitree robot before Christmas"
    caption="A viewer jokingly asks for a Unitree robot before Christmas."
>}}

{{< story-figure
    variant="wide"
    number="30"
    src="unitree-collaboration-comments.webp"
    alt="Viewer comments suggesting a Unitree and Neuro-sama collaboration"
    caption="Viewers pitch a collaboration between the most popular AI VTuber and Unitree's robots."
>}}

{{< story-figure
    variant="wide"
    number="31"
    src="unitree-technical-comment.webp"
    alt="A technical viewer comment about VLA models and action chunks"
    caption="A technical viewer discusses VLA models, action chunks, and what a Neuro and Unitree collaboration would require."
>}}

</div>

Neuro's AI identity and technical fan base fit the image of a humanoid robotics company. An early-stage company does not need a large endorsement budget. It could offer hardware, reward community participation, and run joint streams with Neuro. Compared with a conventional advertisement, that kind of community work may build more trust, and user-generated content can keep circulating after the campaign ends.

### Embodied AI and developer ecosystems

Neuro's case suggests that embodied AI companies should invest in developer communities. Opening technical work and inviting people to participate can help in several ways:

- Opening core modules and providing simulation environments lowers the barrier to entry. A wider group of developers and enthusiasts can then contribute and push the technology forward.
- Development challenges and regular engineering streams explain the product to a technical audience while building a professional reputation.
- An active developer community gives a company places to test new applications and possible business models, while also cultivating early users.

<aside class="neuro-callout">
  <span>Developer takeaway</span>
  <p>A demo shows what a model can do. A public build process shows how the product changes, who it attracts, and why an audience might want to stay involved.</p>
</aside>

Now that Neuro has reached her third anniversary, I also have a clearer direction for my studies and career. Her case has convinced me that embodied intelligence will advance through open technical work and strong developer communities, much as Vedal has done. I hope to take part in that kind of work as a developer and turn what I have learned from Neuro into efforts that help embodied AI reach practical use, with attention to both technology and the people who use it.

{{< story-figure
    variant="end"
    number="32"
    src="neuro-sama-future.webp"
    alt="An abstract closing illustration asking what lies ahead for Neuro-sama"
    caption="A closing image asking what lies ahead for Neuro-sama."
>}}

How will Neuro change next, now that she is one of the best-known figures in AI entertainment?

## Sources

- [1] Neuro-sama official wiki: https://en.neurosama.info/wiki/Main_Page
- [2] Neuro-sama fan wiki: https://neurosama.fandom.com/wiki/Neuro_Sama_Wiki
- [3] Virtual YouTuber Wiki page for Neuro-sama: https://virtualyoutuber.fandom.com/wiki/Neuro-sama
- [4] Related Bilibili videos: https://www.bilibili.com/video/BV1CZf2YdEg3/?spm_id_from=..search-card.all.click&vd_source=3aec137ec288b2a0f88052a7be6559e9
- [5] Official X account: https://x.com/NeurosamaAI
- [6] Twitch channel: https://www.twitch.tv/vedal987
- [7] Discord technical discussion channel: https://discord.com/channels/574720535888396288/1071784467036913664
- [8] Chinese edition on Zhihu: https://zhuanlan.zhihu.com/p/1986111445428113902
