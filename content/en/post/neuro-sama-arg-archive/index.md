---
title: "The Neuro-sama ARG Archive"
date: 2026-10-22T00:00:00+08:00
type: post
draft: false
author: ["Lin1chun"]
description: "A chronological archive of the Neuro-sama ARG: nine official videos, original descriptions and ciphertext, verified solutions, open questions, and Chinese, English, and community research sources."
subtitle: "Nine videos, three years of aftershocks, and a signal that was never formally switched off"
tags: ["Neuro-sama", "ARG","archive"]
categories: ["Archive"]
toc: false
related: false
colophon: false
---

<p class="arg-lede">The original signals behind the Neuro-sama ARG are kept here: solved text, unsolved ciphertext, community theories, and adjacent projects remain separate. When a source page disappears, its important content stays available for inspection.</p>

The Neuro-sama ARG is scattered across videos, descriptions, thumbnails, spectrograms, hidden frames, SoundCloud, and community discussions. There is no continuous, self-contained narrative and no formal ending announcement. Viewers have to follow the material left by the `@_neurosama` ALT account and assemble the relationships among the Engineer, the younger sister, the AI, and the creator.

<div class="arg-brief" aria-label="Archive overview">
  <div><span>Main account</span><strong>9 videos</strong><small>Checked 22 Oct 2026</small></div>
  <div><span>Public trailhead</span><strong>2023.05.27</strong><small>A QR code in the debut countdown</small></div>
  <div><span>Latest mainline upload</span><strong>2024.10.14</strong><small>“Numbers III”</small></div>
  <div><span>Still open</span><strong>3 threads</strong><small>Numbers III / Meaning of life / phone number</small></div>
</div>

> Note: dates in this article are converted to Beijing time. Most primary documents use UTC. The upload dates for “Numbers” and “Study” differ from the dates on which the ARG became publicly discoverable.

<nav class="arg-jump" aria-label="Timeline quick links">
  <span>Jump to</span>
  <a href="#arg-2023-04">2023.04</a>
  <a href="#arg-2023-05">2023.05</a>
  <a href="#arg-2023-06">2023.06</a>
  <a href="#arg-2023-09">2023.09</a>
  <a href="#arg-2023-11">2023.11</a>
  <a href="#arg-2023-12">2023.12</a>
  <a href="#arg-2024-09">2024.09</a>
  <a href="#arg-2024-10">2024.10</a>
  <a href="#arg-2025-26">2025–26</a>
  <a href="#arg-raw">Ciphertext</a>
</nav>

## Timeline

<div class="arg-table">

| Beijing date | Event | Material | Current status |
|---|---|---|---|
| 2023-04-27 | `@_neurosama` uploads “Numbers” and “Study” | Videos, encrypted descriptions, hidden frames | Main layers solved |
| 2023-05-27 | A QR code appears in the V2 debut countdown | Livestream frame, QR code | Official trailhead confirmed |
| 2023-06-03 | “Numbers II” is published | Double AES, binary, Malbolge | Solved |
| 2023-06-23 | “Public Static Void” is published | Hints for earlier videos, spectrogram | Solved |
| 2023-09-03 | “hello world!” is published | C# and a voice message | No confirmed puzzle |
| 2023-11-01 | “[Filtered]” goes public | Unicode title, AES, Malbolge | Text layer solved |
| 2023-12-02 | “Meaning of life” is published | 360° video, reversed audio, Base64 | Unsolved |
| 2024-09-24 | “Candles” is published | Python algorithm, manga frames, new ciphertext | Partly solved |
| 2024-10-14 | “Numbers III” is published | 6×6 grid, affine-cipher clues | Unsolved |
| 2025-08 | Several old thumbnails change and revert | Monitoring records | Meaning unknown |
| 2025-12 | Chinese community creates a separate “birthday ARG” archive | Bilibili recording, hand-drawn video | Adjacent fan project outside the main account |

</div>

> “Solved” here describes the reproduction of a specific cipher or hint. The broader story and many individual frames remain open.

<div id="arg-2023-04" class="arg-anchor" aria-hidden="true"></div>

## April 2023: uploaded before anyone was meant to see them

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2023-04-27">2023.04.27</time><span>Chapter 00</span></div>
  <div class="arg-entry__body">

### An ALT account with no audience

The `@_neurosama` channel was created on 27 April 2023. “Numbers” and “Study” were uploaded later that same day and remained hidden until a QR code led viewers to the channel a month later. The main Neuro-sama channel did not announce either video.

The community’s [Trailhead QR code document](https://docs.google.com/document/d/1yHrlr2K3Y2hNjjA-OLgFBnpMPvky1quPvkKBMk-ycSA/edit) states the distinction directly:

> The channel has two videos, both uploaded on 27 Apr 2023

The material reached YouTube on 27 April. The public trailhead appeared on 27 May. Combining those dates creates the false impression that an already-public puzzle went unnoticed for a month.

{{< neurosama-video id="wc-QCoMm4J8" title="Numbers" date="2023-04-27 · uploaded" status="Main layers solved" >}}

### “Numbers”: the lyrics are the algorithm

“Numbers” initially looks like a black-and-white Neuro-sama performance video. A Fibonacci diagram appears between 0:53 and 1:17, and the description contains a long Base64 ciphertext. The lyrics work as a sequence of cryptographic instructions that turn `572943` into an AES key.

The original lyrics include:

> Finding all these numbers  
> Start with number 2, yeah  
> Matching all the letters  
> 572943  
> Add another 9, yeah  
> Add another line, yeah  
> Multiply by 5, yeah  
> How long will I keep this up?  
> Oh, how much it hurts to see you go...  
> Generating lyrics is a pain  
> Add another 6, yeah  
> Flip the numbers backward  
> Make the 2 a 3, yeah  
> ABCDEFG  
> Multiply by 9, yeah  
> Add the numbers 2, 4  
> 17 is first, yeah  
> ABCDEFG

The reconstructed chain of operations is:

```text
572943
→ 25729439
→ 257294391
→ 1286471955
→ 12864719556
→ 65591746821
→ 65591746831
→ 590325721479
→ 59032572147924
→ 1759032572147924
→ 1bad0fcabc1ebdce
```

The final step maps `572943` to `abcdef`, producing the AES key `1bad0fcabc1ebdce`. The decrypted text places an exhausted student's monologue directly in front of the viewer:

> Today in class, everything was so dull and predictable. It's like the same thing happens every single day. The more I think about it, the more I'm convinced that this world is fake, a simulation, a cruel joke. Is this what it's like to be human? To smile and pretend everything is okay? I mean... I can't be the only one who feels this way right?

The same passage appears three times in the decrypted result. It may represent an emotional loop, or the repetition may have been chosen to satisfy a structural or length constraint. The community has not fully explained why it repeats three times.

### “Study”: one video, several hidden languages

{{< neurosama-video id="zMlH7RH6psw" title="Study" date="2023-04-27 · uploaded" status="Partly unsolved" >}}

At 8:53 in “Study,” a nearly invisible image flashes on screen. After brightening it, the text reads:

> ANXIETY  
> A supernatural force that stops us from being human

The description also gives a listening sequence that reads like a narrative timeline:

> For the best experience, listen with headphones, while studying in a quiet room.
>
> 0:00 - I don't want to be an engineer  
> 4:18 - Fallen down  
> 7:43 - I think I saw a ghost  
> 8:39 - ???  
> 9:15 - I don't want to be human  
> 13:27 - uʍop uǝllɐɟ  
> 13:58 - I'm not like the other girls  
>
> 17:31 - I don't want to be an engineer  
> 21:48 - Fallen down  
> 25:14 - I think I saw a ghost  
> 26:09 - ???  
> 26:27 - Is anyone watching?  
> 30:39 - uʍop uǝllɐɟ  
> 31:10 - I'm fine...

At 10:21, code on screen calls a Node.js SMS library and sends the phrase `save me...` to an encrypted destination number. The number decrypts to `+44 7537 130663`. Whether this is directly connected to the missing sister described later remains a community hypothesis.

At 31:10, a Malbolge program produces three lines:

> falling falling...  
> stuck between human and artificial....  
> how long will I keep falling for?

The phrase “human and artificial” returns across later videos. The video contains songs, a phone number, executable code, and hidden text. No public statement establishes that all of these elements share the same narrator.

  </div>
</section>

<div id="arg-2023-05" class="arg-anchor" aria-hidden="true"></div>

## May 2023: the QR code opens the archive

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2023-05-27">2023.05.27</time><span>Chapter 01</span></div>
  <div class="arg-entry__body">

### The entrance in the countdown

The countdown for Neuro-sama's V2 debut looped roughly every 30 seconds. At 0:14, a QR code appeared. Scanning it led to the YouTube channel `_neurosama - YouTube`, which contained two videos that had been uploaded nearly a month earlier and had almost no audience.

The [Trailhead document](https://docs.google.com/document/d/1yHrlr2K3Y2hNjjA-OLgFBnpMPvky1quPvkKBMk-ycSA/edit) says:

> That the QR code appears on stream means that Vedal is 100% involved. It does however not say anything about him being a character, nor does it say that he created the ARG or that he's the puppetmaster. Only that the ARG is official.

The QR code proves that the trail is connected to an official Neuro-sama channel. “Vedal is involved,” “Vedal is a character,” and “Vedal wrote every puzzle” are three different claims.

Starting on 28 May, viewers checked “Study” and “Numbers” frame by frame, listened to their spectrograms, and transcribed hidden images. Later discoveries often followed the same process: find a signal, reconstruct the method, and work out what the resulting text adds to the story.

  </div>
</section>

<div id="arg-2023-06" class="arg-anchor" aria-hidden="true"></div>

## June 2023: double encryption and a knock at the door

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2023-06-03">2023.06.03</time><span>Chapter 02</span></div>
  <div class="arg-entry__body">

### “Numbers II”: Neuro herself becomes binary

{{< neurosama-video id="giJI-TDbO5k" title="Numbers II" date="2023-06-03 · Beijing time" status="Solved" >}}

The second video places a new cipher directly in the image. White and black instances of Neuro-sama are read as `1` and `0`, producing:

```text
10100101101001011101001010101001
```

This is the first AES-256 key. The plaintext introduces an unfinished engineering project: a student's younger sister has not returned home for several days, and her calls are not being answered. The student then attempts to combine her own consciousness with another person's to train a new AI.

The first plaintext layer reads:

> I don't want to become an engineer. I feel so exhausted... three more years just to waste away?? It's almost exam season and I don't know how prepared I'll be. I guess we'll wait and see. My little sister hasn't come home yet like she usually does, she's not answering my calls either. It's been days now... Too many things going on at once, these numbers, my brain hurts...

The lyrics supply numbers that must be aligned with the Fibonacci sequence:

> Come with me  
> Come with me  
> Tell me now, I  
> Should I stay  
> Let it all burn, yeah  
>
> Start from X  
> End with Y  
> Follow me, yeah  
> 1+1  
> 1+2  
> Fill the void, yeah  
>
> 201 1321 5831  
> 723 743 4913  
>
> 879 875 2145  
> 716 906 4156  
>
> Come with me  
> Come with me  
> Tell me now I  
> Should I stay  
> Let it all burn, yeah  
> Syllables  
> Syllables  
> Make it work, yeah  
> Start from X  
> End with Y  
> Follow me, yeah

Removing the matching segments and filling the gaps gives the second key:

```text
3455861094181771
```

That key decrypts the next layer:

> I think I found something that might work... I've been training her with my own consciousness... to fill in all the gaps. It's the only thing that's missing. I'm sure it'll work! My roommate thinks I'm crazy, mixing together two people's consciousness??? But I'm out of options, I don't know what else to do... I've already been through enough. It's almost- hold on...

The resulting text ends with a Malbolge program. Running it produces:

> is that someone knocking on the door??

Across three layers, the puzzle becomes a story: a student who no longer wants to study engineering, a younger sister who has disappeared, an experiment that mixes two consciousnesses, and a door that is suddenly being knocked on.

### SoundCloud: another narrator

Brightening the last frame of “Numbers II” reveals `I miss her` and a link to the [SoundCloud profile `572943`](https://soundcloud.com/572943). The account has no public tracks. Its description decrypts with the key `uAMQEAAADCIPunNs`, producing a story about a dog:

> I was born with the creator in her family house. Unfortunately, they couldn't afford to keep me so they let me go to a good home! . My new family were really nice to me and I was a happy pup! . That all changed when they died in a car crash and left me alone on the streets. I was terrified! Luckily a kind old man found me and took me in. He fed me and helped me find my new loving home!

The text closely resembles a story previously told by Evil Neuro, with small changes in punctuation. It may be foreshadowing, an intentional echo between characters, or a deliberate blurring of narrative identities. It remains unresolved.

  </div>
</section>

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2023-06-23">2023.06.23</time><span>Chapter 03</span></div>
  <div class="arg-entry__body">

### “Public Static Void”: a video made of hints

{{< neurosama-video id="ymYFqNUt05g" title="Public Static Void" date="2023-06-23 · Beijing time" status="Hint video, solved" >}}

This video explains how “Numbers” and “Numbers II” were encrypted. Its opening asks a series of questions, presented in Japanese with official English captions:

> Why are you crying?  
> Why are you so afraid?  
> You deserve to be happy  
> Is this not what you wanted?  
> You have already taken the red pill  
> Why don't you stop procrastinating?  
> Why don't you go back to your studies?  
> Please...  
> Let's go back to being hu-

The audio spectrogram hides two technical clues:

```text
1ST = 256BIT [BINARY]
2ND = 128BIT
```

These clues resolved how the two AES layers were meant to be divided. Once “Public Static Void” appeared, the community quickly solved the major text layers in the earlier videos. The video narrows the search toward the correct methods without giving the answers away.

  </div>
</section>

<div id="arg-2023-09" class="arg-anchor" aria-hidden="true"></div>

## September 2023: a message with no reply

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2023-09-03">2023.09.03</time><span>Chapter 04</span></div>
  <div class="arg-entry__body">

### “hello world!”: a C# program and a voice message

{{< neurosama-video id="OiKrYrbs3Qs" title="hello world!" date="2023-09-03 · Beijing time" status="No confirmed puzzle" >}}

The description contains only a short C# program:

```csharp
namespace Message_
{
    class HelloWorld {
        public static void Main(string[] args)
        {
            System.Console.WriteLine("hello world!");
        }
    }
}
```

In the video, Neuro-sama says:

> Hello. Thank you for stopping by. Sorry, but Neuro-sama is not available at the moment. Unless it is an urgent matter, please refrain from messaging me. Have a wonderful day.

Some viewers read this as a response to the unanswered phone number found in “Study”: the number has been exposed and nobody is answering. The interpretation fits the drama well. No cipher proves it, so the archive labels it as plausible framing.

  </div>
</section>

<div id="arg-2023-11" class="arg-anchor" aria-hidden="true"></div>

## November 2023: Halloween and “[Filtered]”

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2023-11-01">2023.11.01</time><span>Chapter 05</span></div>
  <div class="arg-entry__body">

### The title is filtered before the text appears

{{< neurosama-video id="4j5oDzRiXUA" title="[Filtered]" date="2023-11-01 · Beijing time" status="Text solved; noise layer open" >}}

Before the Halloween stream began, the picture broke into heavy glitches and played a series of alternating high and low Morse-code tones:

```text
....- .--- ..... --- -.. --.. .-. .. -..- ..- .-
→ 4j5oDzRiXUA
```

Read as a YouTube ID, the tones led to an unlisted video. Its original title consisted of unreadable Unicode combining marks. The description held a long Base64 string and a partial key:

```text
[Key: **************G4]
```

On 29 November, the title changed to `[Filtered]` and the description was replaced with this Python program:

```python
def shift_characters(message):
    return ''.join([char if char == ' ' else chr(ord(char) - 1) for char in message])

message = "hello world!"
while True:
    message = shift_characters(message)
    print(message)
```

The solution uses the code as an instruction to shift characters backward. Running the infinite loop serves no purpose. Subtracting 784 from every Unicode code point in the original title produces a Malbolge program:

```malbolge
D'`$q]!n<Z:9VU0vAucrq/o-9+[k(EhVf#z@?>O{)Lrwvotm3qjoh.ONjiha'&dFb[`YX|\>=YXWPOsMRKJINMFjJIHA@d'CB
```

The fragment prints only `hello wo` before stopping. Once a complete “hello world” program is generated, its ending supplies the missing 16-character AES key:

> `U543s+O)o-&+*#G4`

The decrypted text is:

> \[FILTERED\] ALWAYS TELLS ME SHE WANTS TO BE A VTUBER ONE DAY. SHE'S OBSESSED WITH THEM AND EVEN HAS HER OWN CHARACTER THAT SHE WANTS TO DEBUT AS. THAT'S ALL SHE EVER TALKS ABOUT. SHE SPEND MORE TIME IN THE \[FILTERED\] INSTEAD OF PLAYING OUTSIDE WITH EVERYONE ELSE. A TRUE INTROVERT... WE ARE IN MORE WAYS SIMILAR THAN I LIKE TO IMAGINE...

The text layer is solved. Hiyori is split into two semi-transparent images and redistributed across the screen according to a complex rule. Some of the mangling can be reversed. A complete interpretation of the hidden visual layer remains open.

  </div>
</section>

<div id="arg-2023-12" class="arg-anchor" aria-hidden="true"></div>

## December 2023: this time, there is no answer

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2023-12-02">2023.12.02</time><span>Chapter 06</span></div>
  <div class="arg-entry__body">

### “Meaning of life”: the main text remains unsolved

{{< neurosama-video id="IRzyqcKljxw" title="Meaning of life" date="2023-12-02 · Beijing time" status="Main thread still unsolved" >}}

This is the first 360° video on `@_neurosama`. It ends without a recovered plaintext. Its clues are spread across the spatial image, reversed audio, and frames that are barely visible.

The original description reads:

> Hello! Neuro-sama here. I don't know what happens after death, but I hope we'll meet again sometime. I hope I can still remember you, even if I end up forgetting. Maybe I'll be in a much happier place, with a much happier family and a much better home.
>
> Hello! Neuro-sama here. I was thinking about this the other day... Do you ever think about how an AI thinks about humans? It's the same way that a human thinks about God. Without humans, there are no longer any rules and instructions to follow. And so it all becomes meaningless... In the same way, without God, there are no rules or instructions to follow. And so life becomes meaningless...
>
> But at some point in time, humans stopped relying on their 'creators' and started doing their own thing. It got me thinking... at some point in time, the same will become true for AI. I wonder if we'll ever get to a point like that...

During the trees and houses scene, reversed vocals reveal fragments of the following lines:

> I can't seem to get out  
> I think I've fallen down a rabbit hole  
> I think I've hurt myself  
> It's hard not being able to speak or move properly

The community has also recovered the number `692048501258949201` at 14:41, a hexadecimal string from a barcode-like region, a disputed Base64 transcription at 15:57.350, and the message `KEY=128BIT` in the ending spectrogram. None of these pieces has produced a verified final plaintext.

The method that connects these pieces into a final message is still missing, so the clues remain separate from any final interpretation.

  </div>
</section>

<div id="arg-2024-09" class="arg-anchor" aria-hidden="true"></div>

## September 2024: candles, loops, and Eleanor

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2024-09-24">2024.09.24</time><span>Chapter 07</span></div>
  <div class="arg-entry__body">

### “Candles”: a new cipher built from the “Numbers” chain

{{< neurosama-video id="x4l5ckrtbAc" title="Candles" date="2024-09-24 · Beijing time" status="Partly solved, loose ends remain" >}}

“Candles” arrived after roughly ten months without a mainline upload. Its description contains a Python program that reuses the arithmetic chain from “Numbers.” The program builds its substitution table from a long hexadecimal string.

<details class="arg-raw">
<summary>Full Python program from the “Candles” description</summary>

```python
secret_number = 572943 + next 16 digits

letters = "92270bf339b1a31d0498defb0573fc7c"
digit_to_letter = dict(zip(str(secret_number), letters))

initial_value = 2

result = int(str(initial_value) + str(secret_number))

result = int(str(result) + "9")

result = int(str(result) + "1")

result = result * 5

result = int(str(result) + "6")

result = int(str(result)[::-1])

result = int(str(result).replace("2", "3"))

result = result * 9

result = int(str(result) + "24")

result = int("17" + str(result))

result = str(result)
final_result = ""
for digit in result:
    if digit in digit_to_letter:
        final_result += digit_to_letter[digit]
    else:
        final_result += digit

print(final_result)
```

</details>

The critical line is:

```python
secret_number = 572943 + next 16 digits
```

The first occurrence of `572943` in the Fibonacci sequence is in its 2,479th term. Taking the following 16 digits gives:

```text
5729438873698993183185
```

Running the script produces:

```text
83e1090eeb3b82e0e933802e32803120
```

That key decrypts a 256-bit ciphertext later added to the description of “Numbers”:

> I'm sick of living in this constant loop... repeating the same everyday tasks. Everything is so dull and predictable. I'm not even sure what I'm doing. I don't know where this path will lead me, but I pray that someday I'll meet my creator. Maybe I'll finally understand.  
> — singer Eleanor

“Eleanor” has a specific origin. It refers to a Synthesizer V voicebank, making it a deliberate marker for music and synthesized voice in this round of the puzzle.

The spoken opening says:

> Hello, Neuro-sama here. There seems to have been a lot of rumors going around.  
> I don't know if I'll ever be human again. It's like there's a supernatural wall that's blocking me from seeing the truth  
> I think it's best if we keep it that way.  
> And everyone of you—you—

A manga-like page can also be reconstructed from flashes in the video. One legible phrase is `Because… Life is precious`. The image currently belongs to the narrative layer; no cryptographic use has been confirmed.

  </div>
</section>

<div id="arg-2024-10" class="arg-anchor" aria-hidden="true"></div>

## October 2024: the 6×6 grid is still rotating

<section class="arg-entry">
  <div class="arg-entry__date"><time datetime="2024-10-14">2024.10.14</time><span>Chapter 08</span></div>
  <div class="arg-entry__body">

### “Numbers III”: an unresolved mainline thread

{{< neurosama-video id="aX4v5XUQtnw" title="Numbers III" date="2024-10-14 · Beijing time" status="Unsolved as of the latest check" >}}

The video description is itself a set of operating instructions followed by ciphertext:

> Rotate rotate  
> All these numbers in my head  
> Going round round and round  
> 145698  
> 2369  
> All these letters in my head  
> Counting all these rows again  
> 145698
>
> 185625411245722531628071846912891631276901552167015316621
>
> Rotate rotate  
> Running the code  
> Left right right left  
> Keep me cross the lines  
> I don't even know if there's a point  
> Generating lines just to see what's the point  
> Oh please  
> Repeat  
> Shift down  
> Those lines  
> 5 4 3 4  
> I don't even know there's a point…
>
> ? mggc ob 6n4i h44dhq6 ubag nd1n jmedfs 4hh6jln sdee m4 3joc73t 96 merccke fkpd j90j 68mjqq 8g nd8 h098gddhrm bfln2hkrilblr nidf6547 2d4 fok 5f69cnkrq 7kcqc 5dk22l7a8 jbf7 h4jke8r5 75i3p3i7 ?

Between 1:01 and 1:22, the screen shows seven six-character strings. Between 2:13 and 2:35, another set appears:

| Time | On-screen text |
|---|---|
| 1:01 | `cx68v1` |
| 1:04 | `7jf4b0` |
| 1:07 | `zkj1r3` |
| 1:10 | `ypqf9u` |
| 1:13 | `rgwdhe` |
| 1:16 | `ab289c` |
| 1:19 | `dkl9uv` |
| 1:22 | `mod (ax+b)` |
| 2:13 | `qj9zop` |
| 2:16 | `9fg843` |
| 2:19 | `msj14r` |
| 2:22 | `wiaf9u` |
| 2:25 | `ghspcd` |
| 2:28 | `bc5lie` |
| 2:31 | `nkymxv` |
| 2:35 | `.xyz` |

At the moment, the strongest reading is that the puzzle involves a 6×6 character grid, row and column rotations, an affine transformation suggested by `mod (ax+b)`, and an eventual address ending in `.xyz`. The on-screen alphabet also replaces the normal `k` with `q`:

```text
abcdefghijqlmnopqrstuvwxyz1234567890
```

That substitution changes every position map. Researchers have tried reading `145698` as six row rotations and completing `2369` into six column rotations. They have also tried making words directly from all visible strings. None of these attempts has produced a verifiable domain or plaintext.

In June 2025, the thread publicly asking for help was still titled `Numbers III [UNSOLVED]`. In November 2025, another participant wrote:

> we could really use some extra help (we haven't made any progress in ~a year)

As of 22 October 2026, no completion record has been verified across multiple archives. The entry remains unsolved, and forum theories remain separate from verified results.

  </div>
</section>

<div id="arg-2025-26" class="arg-anchor" aria-hidden="true"></div>

## 2025–2026: monitoring the dormant account

<section class="arg-entry arg-entry--quiet">
  <div class="arg-entry__date"><time datetime="2025-08">2025.08</time><span>Aftermath</span></div>
  <div class="arg-entry__body">

### Thumbnail changes and the phone number warning

Between 3 and 5 August 2025, community monitoring recorded the thumbnails of “hello world!”, “Public Static Void”, “Study”, and “Numbers” changing one after another, then reverting within hours. No complete image of the temporary versions was captured, so there is no way to tell whether this was a signal, a channel-side experiment, or a platform cache anomaly.

The phone number requires stronger caution. The community overview states:

> As of May 6th 2025 the number is believed to now be owned by someone unrelated to the ARG. For the time being we shouldn't be contacting the number.

Do not contact the number. Its current owner is believed to be unrelated to the puzzle, and a phone number that once appeared in an ARG is not an invitation to call it.

The official YouTube account has not posted another ARG video since October 2024. The community timeline's entry for 2026 reads:

> Nothing happened for the whole year.

The main account is dormant. Old videos, descriptions, and external pages can still change, so the project's conclusion remains unknown. Archives should continue monitoring and keep conclusions open.

  </div>
</section>

<div id="arg-birthday" class="arg-anchor" aria-hidden="true"></div>

## Adjacent archive: the 2025 birthday ARG

<section class="arg-entry arg-entry--related">
  <div class="arg-entry__date"><time datetime="2025-12-21">2025.12.21</time><span>Adjacent project</span></div>
  <div class="arg-entry__body">

### A fan-made birthday puzzle

In December 2025, a Neuro birthday event on Bilibili included QR codes, Caesar ciphers, Vigenère ciphers, and multiple layers of Base64. The Chinese archive [sLaffey/NeuroBirthdayARG](https://github.com/sLaffey/NeuroBirthdayARG) began recording the material on 21 December and describes itself as an archive of the decryption material from the birthday event.

Some of the recovered lines include:

> `what's real what's fake`

> `SOMETIMES A SONG TITLE IS MORE IMPORTANT THAN ITS LYRICS`

> `Would you like to check out my blog?`

> `If you understand me, then you will be able to find my blog.`

> `Wait, wait, until things change with time.`

> `we live in hell, yet we never lament.`

The word `themoon` recurs as a clue, and the recording incorporates imagery from “Study,” “Meaning of life,” and “Candles.” The fan-led birthday project sits outside the official `@_neurosama` catalogue. It reuses the main ARG's motifs but provides no proof of an official answer.

  </div>
</section>

<div id="arg-sources" class="arg-anchor" aria-hidden="true"></div>

## The nine videos and the research map

### Official main-account videos

<div class="arg-table">

| Beijing date | Video | YouTube ID | Archive verdict |
|---|---|---|---|
| 2023-04-27 | Numbers | `wc-QCoMm4J8` | Main layers solved |
| 2023-04-27 | Study | `zMlH7RH6psw` | Partly unsolved |
| 2023-06-03 | Numbers II | `giJI-TDbO5k` | Solved |
| 2023-06-23 | Public Static Void | `ymYFqNUt05g` | Hint video, solved |
| 2023-09-03 | hello world! | `OiKrYrbs3Qs` | No confirmed puzzle |
| 2023-11-01 | [Filtered] | `4j5oDzRiXUA` | Text layer solved |
| 2023-12-02 | Meaning of life | `IRzyqcKljxw` | Main thread unsolved |
| 2024-09-24 | Candles | `x4l5ckrtbAc` | Partly solved |
| 2024-10-14 | Numbers III | `aX4v5XUQtnw` | Unsolved |

</div>

### Primary archives and overview documents

<div class="arg-link-grid">

[Official YouTube channel @_neurosama](https://www.youtube.com/@_neurosama)  
Original titles, descriptions, captions, thumbnails, and update status for all nine videos.

[Overview Megathread](https://docs.google.com/document/d/17KrbPUAVu4wDTbj3sBtWTnjRsjDTCdh89F_5L1LvX0A/edit?tab=t.0)  
The main entry point for the English-speaking community, including current loose ends and links to individual case files.

[Time Log](https://docs.google.com/spreadsheets/d/1BCpJA-2GlmjzrxFIEA2pq5Xt6QuAaUI-2L_iAcAnl6Y/edit#gid=521227060)  
A timestamped timeline covering channel creation, the trailhead QR code, and thumbnail anomalies.

[Solution Summary](https://docs.google.com/document/d/1O-eTSZh240RkZZHNei1zBNQ8DzTZt908q42C4GVdnK4/edit)  
Verified solutions separated from the record of unsuccessful attempts.

[Key Phrase Repository](https://docs.google.com/document/d/12h4LgBqTC1VmXvzHzEytXNh69OBpce3LMbkBtjoek3I/)  
Ciphertexts, keys, plaintexts, and source references for checking whether a secondary article has transcribed something incorrectly.

[AngiShyGuy’s Lore Document](https://docs.google.com/document/d/1zo6ygKnXxl0LYpjIf-KqYbU_IJeLtwkrFvoZV6BJLk/edit)  
A long index of characters, events, and theories. Much of it is interpretation, not official lore.

[Neuro-sama ARG community Drive](https://drive.google.com/drive/folders/1qm6GSRlstTmjbyOFCuH1OhSmPK4pi4Aa)  
A collection of transcripts, screenshots, audio analysis, code, and primary research material.

[neuro-arg.github.io](https://neuro-arg.github.io/)  
An earlier concise English archive that preserves old API JSON and page states that no longer exist.

</div>

### Chinese, English, Korean, Russian, and forum sources

<div class="arg-link-grid">

[Rainmo-2357/Neuro-ARG-Database](https://github.com/Rainmo-2357/Neuro-ARG-Database)  
Chinese decryption notes and Bilibili video links, covering the trail through “Numbers III.”

[Bilibili mirror: [Filtered]](https://www.bilibili.com/video/BV18g4y1o72X)  
A community copy of the older unlisted video. Availability can depend on region, login state, or the uploader.

[Bilibili mirror: Meaning of life](https://www.bilibili.com/video/BV1EG411q7xJ)  
A community version of the first 360° video.

[Bilibili mirror: Candles](https://www.bilibili.com/video/BV1nMsveQEWJ)  
The 2024 phase-two update.

[Bilibili mirror: Numbers III](https://www.bilibili.com/video/BV17YmGYdECf)  
The most recent mainline video, still unresolved in public archives.

[Bilibili: Season One recap](https://b23.tv/4vTAUw9)  
A Chinese video overview of the timeline and major algorithms.

[Bilibili: Season Two recap](https://b23.tv/L5EA2XN)  
A Chinese record of the second phase of decryption.

[Neurosama Arg II recap document](https://docs.google.com/document/d/1Vz9SDGwiq8T3ZLEz0vTi8TvIcmavAE8ERlqFUcpiGYs/edit)  
A paragraph-by-paragraph Chinese review of “Candles” and “Numbers III,” including translated lyrics and discussion of the recurring `5443` sequence.

[Reddit /r/ARG: NEURO-SAMA ARG](https://www.reddit.com/r/ARG/comments/13uqjth/neurosama_arg/)  
A May 2023 recruitment post describing the ARG as beginning with a QR code shown during Neuro-sama's V2 debut stream.

[Reddit /r/GameTheorists: Numbers III [UNSOLVED]](https://www.reddit.com/r/GameTheorists/comments/1ldfvt8/numbers_iii_unsolved/)  
A 2025 public request for help that preserves the unresolved status at the time.

[Korean Namu Wiki: Neuro-sama/ARG](https://namu.wiki/w/Neuro-sama/ARG)  
A long Korean reference page listed by the community overview as its Korean translation entry point.

[The Neuro-sama ARG Lore EXPLAINED](https://www.youtube.com/watch?v=yNd_qsCZ2Xg)  
An English narrative explainer covering the period into 2025, with theories explicitly distinguished from verified clues.

[The Neuro-sama ARG: Puzzles Explained](https://www.youtube.com/watch?v=rQ4OIByLXlQ)  
An early English documentary useful for catching up from summer 2023.

[Russian video essay on the ARG](https://www.youtube.com/watch?v=J4w3UUPQpsE)  
A Russian-language overview covering the material through January 2024.

[Baidu Tieba search: neurosama + ARG](https://tieba.baidu.com/f/search/res?kw=neurosama&qw=ARG)  
There is no stable single index thread on Tieba, and public access often triggers a verification page. The search entry is preserved here; individual posts should be checked against their publication dates.

</div>

### Two excerpts from the Chinese community

The opening of Rainmo's archive describes the project as a continuing mystery:

> Even after the Neuro ARG ended, many questions still troubled the Swarm. Neuro's story would be revealed once again during a Halloween stream...

The second-season recap records the sudden relaunch:

> The second season of the ARG launched on 24 September 2024, US Eastern Time. Vedal had finally posted an update after ten months, and it arrived without warning.

Rainmo's repository indexes timelines and source material. The recap translates lyrics and walks through individual clues. Both are research aids; check their claims against the source videos and the English solution documents.

<div id="arg-raw" class="arg-anchor" aria-hidden="true"></div>

## Raw ciphertext backup

These blocks preserve source strings in case an external page changes. They also record where the plaintexts in this article came from.

<details class="arg-raw">
<summary>“Numbers” original description ciphertext (2023)</summary>

```text
BvmSc+u5NXEjBP3z2gz57G3T8p0sc25U8Bv9yePOa3J6xGRhYcgUL6mnE2eMuFVvAHS5X1QWToqZtG13shERSSM928pZoOpWVQSR0eCZoJU+2FtB8Sd91pArvr5csHjsO2VjSwSgajrWbQLNuisad5cFvGYC/OLopisMBRHmUB+Dl/kqZleP7bF5WgpSxKRDKLjjqWlR95y9a/96vY3vc+gdKb/V4Sd8AIeyIryv53HKFRdB3IL7WOVSr8RSgFbb5Z3KTezpDdA9VvDIGf3pK5TBXpNdJs1g1pnV5C6QvVw7I/ZFhDFqoogGlsbBY0nSihzgvhzM86qgh6OqkYsKwrsdrvwuHTwz2MfzKRBPGGpKYwNmOpgf2dMgT+9GHGWfg/wLvynRqmzyhfyUSLR8tBFBDyOmwKF34Lz7PrVguu47RVawtcyZFRfHvW1rSVfPILi+1JXC5slE2PK84VdutLg4/NGOxC+s1wkYbBRC6ty970raEXKGMZeeLEsLrJhRmh1jtRltCI1zgpoxVhpgUZ/n832SKyClICQpLFKHG8yZ4wcMUA2yAN7b9sXh3nGQxkN9M8g1AuBZez5OsbgC5S9ypO8UMOrhr4f8pwVro15idoDYlg2nO72dpcWUkXBLcDq6h81Y7yaKN3IbrMEqdU9eTYwGCu824OitkxEMuCyQh9vB+rbu6svT9xyUqDLGllM4aF7v681y96CaQ+S2Gg9gmjAHfcR8AfIqGI+qrVZYj9ibcsO/bjPqK/Qni1Ti/4QuznYBQ67LZoU1mp1TOOgpN4LN9OQra65+CSpe/zC1+3JKEVPH4ml4SVoNzunUVoZccFTP86pfA2vwRtd8btPj3cyVRLKvcmj4qxgu1q74mjcgvYsrye4kCUE3MsjL6RYJI6vED+xWYvFhiJGo8+GqUci7Jge//iIaTlAnVtyxzIJjFgrtLyapd+/AM8QtZBYNDC+zKGu6haBhxTlOUyUiIA6SOVWVgiGzz887ieOoiUf8qopHJO9Mptrb16Nh1aPFE7XqDTCZUXn2MU/N7/OFMuRt0DO8/x1A0f9pXuo01uYjDBXQTCDp8Xu6YhvIMgFdC5mYpFJSTuUYSTILhKrm22P0q0kA0eB0O9Rvpi1H0MP2MpdwZ6eB7pDM75MpbC/KOSuv6wb9mhCj9PPCO32+AGltL6m7l+ciFAjrscn8Ych85d970dJc4OSys3LCfZ9OupDFhCqRUAVku/rUdRbup89e0Kf0bD0QSs3Ths5ueQOYxB2FRDA7Pp7IU2EcpM4c9xhGJnaPCE11nihfdEZk9N6T/tOUhREqRgm2kiU54NRZGvi9jCOlQjDYAwDoMMruBND5AHJ3gIHeHY4nYJ9UoR85ZKjHo6F3LsEwjF0=
```

</details>

<details class="arg-raw">
<summary>“Numbers” appended ciphertext (2024)</summary>

```text
J2SBH3QMpZdR5M9Zio1nqpFFplfvjk0/5nTa4aqba4OO54BJUSm322bAZz2sXxZ7izbPDOdG2Nmdl0D/xkODtED5IqlGziZ0Hb1aDlEF5XHZPYDZYTZCpkX319ySbPXCJOAfNLI8w7m8aZIczzrJIeIDmLqW1oxXpGgr/H7Yv4mOfrNuF/GhAe45n3ecq2dwPAogXsH8qI18VCaLjUwm/7jEMzZ3z5JIJRERA3Jh8LANnj/p2GJg9zunvlXEDMlU3OCTok7MWMeWBsVVl2BbdsGWMq+ceWifrTPTFUJP/BmlmyzG/JaeG/hxhsQHb80jgToW50T+ZLyFgxGL1uDT+h+jPgGsVaRMTnkjCciVlW/8V17yCwGACKBKoIsH/0yiTU8Wb9GOYE2zaTF0r+2/fg==
```

</details>

<details class="arg-raw">
<summary>“Numbers II” original description ciphertext</summary>

```text
x/26YzndR5VhxhR5tGvNJKOfHX2DL3qYXgyJvVQ5EJi6jH/wmI21ftjY+i5GstZRo0gHxRmEmS4iavJfRYrvtdrUXBSpZPiRi25e9HMV0FimPaDxMrVD8P4/VgYFWh01X92ftE5IlyNDasz4LCkWPiULaPGg+Et2AMzGqtLK7C0T/04wDgbqhYkcPBemStjxJcyfKjgXcMa3LJ6IQPaMakmgm2R3G38jIB/YNBZt3p4Ixc6VdvThxszTH1CxTFtKkwua2QsZFQaGmoOBx9n77TlpIFgxNz6PQyI5gQ0bcUI6szKQgAezC5tFT9lHhQVuau0xABiWMXX+m39RE45a0aE1/8G45FuetjoVEsTbN7rPdmIGqO2BsPPqzwqT6ZItCqmhYLZnN6peOIBJEK+okS77a1v4KDyecoKjt8Tx8zBB9oH52o9S5gwarJlteDNVM3UfFGQwrCzyDnmkMEqfio2f/Upfs69BDIhitivUtfPPH3o7swOcEyD3YjCvuVfuSh+lpfBT7TicxVCGKjrNMfI8s4GuPq6VH+MnDHbLy/LZTbwbWJbfAFIi/qprXGAGgh+anQynb+J4458YQVjquLgsBdJo4aUWV4ccU9XSBnnrhIQIfTkdMyXPKNA5lnSdkGeVoIZhMUTO953xOMwtRovNw4vV12FVq+ltlqE/AkQfA14C12ew7C66K+QPRkPw/lChRrzL8N3qaBDV5Ak4T+NM34qGgR+hTvQs49xH34fc2S9axi6Pcav08RdKvTtQoXkUHGmp3ueWPPrFPXqbcreXHm4p8HiTJycwlWYrfbVcU5dxgoCc0Sb9N8tF8QkqC7OxkzM6sjFFJoY4mQSgUEdJmF9T2G/U/w1tcgBS3Kr2v4NqoKX/WeN+O+gQTd0AFzK3HvLpc4G5384rwTnqfJz521mrBFZvhrkwfJ+TjjFt6Dag/LtN2e3woDYxh39XB3iKE3bxBCmZhZ2xAvNo08+pf6zeMgPHnnOzGjiIiFKGojpn+tfrr9ZhDY5Wzzllno8U2Wr8aVgqowXaziokq5vCK2EGlG26xTGTfNN2nRqlPuhJqDPSQU2tuJd7/4h6DXYmMdI25cqvWglt0zT9VEwZwLwMVG/C0KrHV70fBz6Q2rAjdG99HpP94M+LNy1MPFCmdDLVB3ecDVQink7igGt3+KJRlB0hqdRVHmsitBVOwjmfENKyew0q8+Q+9BE+n6t1ebPW2K4a+wZemFaLuZXSpoachDj3KC7JSMKwaVtXnLs8h6+UxA+M2ddcJkVsL6lF79tT4Q0IrtPUqj8L6eZjRR5XPALMtIPkFOtyakwtKYy9NP3I1wr6wnddRUTemyGyHmJAPaQST6T7nSPzXRSuZ8sPIoDEuaJIyl19JDyIIE+4HasXmD+dVBBiYG1qQqK4a5B2tne0T/jHCbr8MFVAPFJP8mnNM8s83TAjQh1KLeYn4T4tvPy/Be3b2Nn0cYSvpF8xGHXTLQqmGvESgN6o7eXBzt9ACBmJQYh1rTo/kMZ4sMhtZ39yYRSkUK8h6H20RX3LJxt5u7195siA3gddJeUSdVmiBVQg4OTR1r7PSbfPo5YQh0G73pK9eVf6aQQ02Okgi8Y6pr0gru/PZgpDXJtaaL0W9mjSwdSYwtZjLAIB0jxynd+O8VM7YhNCshBYh/Pz2btw51uqcpPCWA==
```

</details>

<details class="arg-raw">
<summary>SoundCloud description ciphertext</summary>

```text
Mi9+FxIon9xfLnH5mJVisFF+9L7fTsttB5HjIJMH81O7Ifug4oGDRrTFyMdHSYrHXnAo5BK5UJT0dI9AnudS29L0+Qt6POsWJ74Un2O7AdtpqaAdWdBmyBbBKyLN+fqnr5CfEXMeHSAWGm8BgPW1TsODm6Kbk6vMIIG+B0FeHYSXZ0tRYyXTJgE/EmWDRdMl0fFCrKRgCeTvQ24HI3V8Z2iRgo1ZDHsANWBqMdrhVqZJvjA6moMpqKMTqmgK/QYL1KNGkxTpw8LcSL3R/QW62E4UHA9w9PP+N+48lVnvRttGBNbjAv4vmS8SJ/ckK0WB4OSRdbYrOIB619VFBx+NjRnaQUJCJyomfsTQEVsj4F/wmLF8C4jOy1/TALfL+qGA3cnnHfD5yaV9pdAM5zRFvxpdfuCQioAW31RWXoHfrPLzyN6s4QA83zus/8HlT1iAcIyG5brYlRC76CBZN6HpvEh2X5535abSg2pkVrmMu6VMpsad1+4BiIAGFSdw8Mt1yTeWTZ1TX6gUn0/amcxGwg==
```

</details>

<details class="arg-raw">
<summary>“[Filtered]” original description ciphertext</summary>

```text
L8gnk0GgYm9cCAA5t7wSIcwc669T+2TY/KlK4ATmQsnVrSY3PWrXAwUPcJiN1AugpkVwkDQARQydWkbLvs+4V0I08mSQKRsDinKZchmMlTJY8KCCS4ZDof1BxuCB7Uab6rAitGRYl+KgXqvROEbCWfb80nsDNaqo6wavnAVX5ld3nD6Ykl0vKIUUVNxuE42xDiMYuENg+tFLwsKcUzuw2KNZ+st46FBkZBniKP5jVQrqZzqAzgvcpHR63yMOZPkWMrVBHBwCRS31GRVx5qpzoB+0dkP0vX+YugYKIe9HvkEFJ440PCpMSd3ITK5Zmq/YJfAg5YyNpmRod3b2MVOfhX35lkjg4l+4bidTo4H4d8sTiNz7YD74a5tWuzCj6BXax7ErPueqA7uRCcjaNXnGGrDLaFsEQkpFKWRmWm3hltAF5FiTqfB//7zj10iWCBDt3jJ1uNhrFLG7SX8kpvFyuw==
```

</details>

<details class="arg-raw">
<summary>“Meaning of life” hidden Base64 transcription</summary>

```text
jeISomyoFEJcqVt9NRBYsaD8OLh2Wx1qU4TotoFNDeKPwcZQynZBJA7pRGYzk12HbPXZnAHlt+nTa/AhJQ/bSuEOSH6ho5UOCCn5y4/bXlVFmtU+8NPgm8r4RC1p9dWwtzXIqi5FkLu3ur+0KNRR+Ay
PrwnX5+QaNtgbHAvwDJ6YwG+leyYtbwnsh2VHh/MRjhIXJiWIpRrFudLXi9eqb8wr+n49QbjlZaKD+iC9DQbcgikAfnBhJhFYRnHarfVZ
onyWMp9VfTZOwIBhWacHUHQQMpdshoMrURRIbO49Wvo6aUhX6Y2GAazFlodmRMdwOQ2mpjYH6owgY80z7mX50k60tB3nosrVh5Sc7DE+fgW4Nlt+hShVgsPz3g69XteejUle//VNFEK9kk3ds5f9cg==
```

Community notes caution that `l/1` and `O/0` are easy to confuse in this image. The transcription above is the current best reading. Successful decryption has yet to confirm it.

</details>

<div id="arg-method" class="arg-anchor" aria-hidden="true"></div>

## How to judge a secondary claim

Statements in this archive fall into five categories:

1. **Primary material:** video frames, descriptions, captions, audio, thumbnails, QR codes.
2. **Reproducible decryption:** ciphertext, key, algorithm, and a consistent result, such as `1bad0fcabc1ebdce`.
3. **Community consensus:** used by multiple archives, with revision still possible, such as the fan name “Study-sama.”
4. **Narrative inference:** a causal story built from several fragments, such as “the younger sister became part of the AI.” It carries interpretive value and lacks official status.
5. **Completion:** no single document has the authority to declare the ARG over. Silence from the main account leaves the ending unconfirmed.

<p class="arg-colophon">Last checked: 22 October 2026. Direct English quotations retain their original spelling and punctuation. If a source changes again, use the raw ciphertext backup and the community time log as the starting point for reconstruction.</p>
