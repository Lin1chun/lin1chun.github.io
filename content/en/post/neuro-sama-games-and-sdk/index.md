---
title: "How Neuro-sama plays games, and how the SDK works"
date: 2026-11-05T12:00:00+08:00
type: post
draft: false
author: ["Lin1chun"]
description: "A practical guide to the games Neuro-sama has played, the milestones around them, the systems underneath, and the official Neuro SDK for connecting new games."
subtitle: "The streamer, the game-specific AI, and the text protocol are three different pieces"
tags: ["neuro-sama"]
categories: ["Programming"]
stage: "evergreen"
toc: true
secnum: true
---

Gameplay can make Neuro-sama look like one system that reads a game, says something funny, and presses the right button. In practice, several components hand information to one another, and each has a different job.

The character layer contains the LLM, memory, voice, filters, and a Live2D or 3D body. Under it are game-specific systems that perceive a game and control it. An adapter between those systems and the game translates state and intentions into actions.

The official [Neuro SDK](https://github.com/VedalAI/neuro-sdk) covers the interface between a game and Neuro's backend. The game uses it to report state and offer actions. The SDK does not supply the game engine, input handling, or game rules.

## What counts as "playing a game"

Neuro has controlled game characters, chosen cards, talked with other players through a game, and appeared in event modes. These cases give her different amounts of control, so they should not be treated as one capability.

The main split is between a custom game AI and the general SDK protocol.

| Kind of gameplay | How the game is connected | Typical example |
| --- | --- | --- |
| Continuous control | A game-specific model reads game state and produces fast, low-level input | *osu!* |
| Open-ended control | A dedicated perception and planning system interprets a scene and issues higher-level commands | *Minecraft* |
| Discrete decisions | The game describes state in text, registers actions, and waits for Neuro to choose one | *Inscryption*, *Buckshot Roulette*, *Liar's Bar* |
| Social or event play | A custom mod or integration supplies high-level actions while the game handles timing and movement | *UNO*, *Pokémon Platinum*, *Cyberpunk 2077* |

A clip alone does not show whether Neuro used a game-specific AI, the public SDK, or a custom mod. The official wiki keeps a separate list of [confirmed integrations](https://en.neurosama.info/wiki/Neuro-sama/Integrations) that have been verified to use the API.

## The games Neuro has played

### osu!: the origin

Neuro began before she had a VTuber avatar. In May 2019, Vedal published a neural-network system learning to play *osu!*; it was named Neuro-sama later that month. The current character is a combination of that game-playing project and a later conversational streaming prototype.

*osu!* is rhythm gameplay with a hard timing requirement. The general Neuro SDK is not a good fit for that job because it sends JSON messages through a WebSocket and expects text-level decisions. Her *osu!* gameplay instead uses a specialised module that can react at game speed.

Ten days after her December 2022 streaming debut, she faced mrekk, then the top-ranked *osu!* player, and won the matchup. The result made for a striking demonstration. The precise cursor movement came from a narrow, purpose-built game agent, while the conversational model handled the personality and speech.

### Minecraft: perception plus planning

*Minecraft* is another dedicated integration. A new game AI arrived with the V3 model in December 2024, with more emphasis on visual perception and higher-level planning. It can follow goals such as gathering resources, fighting, or moving through the world, but it is not a human-like player operating a keyboard and mouse.

The results can look strangely capable and strangely wrong in the same session: attacking through a wall, failing to recognise a functional block, or succeeding at a long sequence because the surrounding system supplies the right low-level control. The game AI still has to translate a plan into a game action, just as a person translates an intention into movement.

On 8 December 2025, Neuro, Vedal, Filian, and Crelly defeated the Ender Dragon in hardcore mode during a Minecraft subathon. The win came from a group playing across several days. It did not serve as a benchmark for Neuro by herself.

### Card games, social deduction, and turn-based strategy

The public SDK fits games that can be reduced to a sequence of decisions. *Inscryption*, *Buckshot Roulette*, *Liar's Bar*, *Slay the Spire*, and *UNO* all provide examples:

- What is the current board or game state?
- Which actions are available now?
- Which one should Neuro choose?
- Did the game accept that choice?

The game does not need to give Neuro a video feed if it can describe the relevant facts in text. The adapter can say that two cards remain, that it is Neuro's turn, and that the possible actions are to shoot the opponent or use an item. Neuro chooses an action; the adapter validates it and changes the game state.

The SDK only has to support a choice among described actions. It does not need to understand the whole screen. That fits card games, board games, visual novels, and turn-based strategy. Shooters and platformers need another layer for fast movement.

Neuro has also played *Plague Inc.*, *Pokémon Showdown*, *Cookie Clicker*, and other games in one-off or experimental streams. The official repository lists several larger integrations as examples, including *Slay the Spire 2*, *Inscryption*, *Buckshot Roulette*, *Hollow Knight*, *Cyberpunk 2077*, and *Pokémon Platinum*.

### Collaborations and event games

Some games were played mainly as social content. In *UNO*, Neuro still has cards to play, but the conversation around the table is what makes the integration worth watching. In *Pokémon Platinum*, a mod changed the rival's sprite to Evil, making the game part of the twins' relationship. *Cyberpunk 2077* and *Hollow Knight* appeared in event integrations. Those integrations gave Neuro actions to take; they do not imply that every animation or movement was selected by an LLM.

The community has extended the list with projects such as *Outer Wilds*, *Among Us*, *Subnautica: Swarm Control*, *Don't Starve*, and *Skyrim*. These projects are useful to read as implementation examples: each one has to decide which parts of its game should become text, which parts should stay in the game engine, and how to keep the interaction responsive.

## The basic loop behind a game-playing streamer

The production stack has changed repeatedly since 2022, and some newer modules are not public. The interaction still follows a recognisable loop.

### 1. Perceive

Input arrives from several directions: Twitch chat, speech from a collaborator, a game's own state, a screenshot or video frame, and the stream context. Different modules handle different formats. Speech recognition turns voice into text and also tries to identify the speaker and tone. A vision model can describe an image or scene. A game adapter can expose the board state directly.

The game adapter does not have to use computer vision. A turn-based game already knows what cards are in each hand and whose turn it is. Passing that state through an API is more reliable than asking a vision system to infer it from pixels.

### 2. Build context

The language model cannot act on raw events alone. A context builder selects recent conversation, remembered facts, the current game rules, previous actions, and any special instructions. For a game, it might send the board once at the start and then send only the changes that matter.

The memory system keeps selected facts, summaries, and recent context. This lets her sound continuous even when older token-level history is gone.

### 3. Decide

The language model produces a response in one or more forms: speech, an emotion and animation cue, or a structured action. In a game using the Neuro API, an action is more than a sentence like "play the blue card". It has a name, a description, and a JSON schema describing its parameters.

For example:

```json
{
  "name": "play_card",
  "description": "Play one card from the current hand.",
  "schema": {
    "type": "object",
    "properties": {
      "card_id": {
        "type": "string"
      }
    },
    "required": ["card_id"]
  }
}
```

The schema constrains the shape of the output and gives the game a predictable object to validate. The model can still make mistakes, so the game must check the result as if it came from an untrusted client.

### 4. Guard and execute

Before speech reaches the stream, filters inspect it. Before an action reaches the game, the adapter checks that the action exists, the game is in the right state, and the parameters are valid. If the action is accepted, the adapter sends a result back to Neuro and performs the move.

The game sends the result after validating the choice and before a slow animation or game update finishes because Neuro waits for it. If the action is impossible, the error message should tell her what would make a retry succeed.

### 5. Speak and animate

On the output side, text is converted to speech, and the character system selects facial expressions and body animations. The audio and visual layers are separate from the game decision. A game action can succeed while the avatar is still speaking, and a line of dialogue can be interrupted without rolling back the game state.

### 6. Feed the result back

The next turn begins with changed state: a card has left the hand, a player has lost health, or a block has been placed. The adapter sends that change as context, and the cycle repeats.

"Game AI" here is not one neural network. It is a pipeline with strict boundaries, shared state, and latency limits. The LLM interprets language and chooses among options. The game engine runs the simulation. The adapter validates requests and passes information between them.

## What the Neuro SDK is

The repository at [github.com/VedalAI/neuro-sdk](https://github.com/VedalAI/neuro-sdk) contains:

- the WebSocket API specification;
- a Unity SDK;
- a Godot SDK;
- example integrations;
- voice-chat documentation and SDK components;
- Randy, a small test server that imitates Neuro.

The project was originally called the Neuro Game SDK. The name was shortened around August 2025 because the protocol is not limited to games. Some older installation links still use the previous repository name, but the current canonical repository is `VedalAI/neuro-sdk`.

The API is a JSON-over-WebSocket protocol. The game is the client. Neuro's backend is the server. Every client message has the same envelope:

```json
{
  "command": "command/name",
  "game": "My Game",
  "data": {}
}
```

The `game` field identifies the integration and should remain stable. Messages from Neuro back to the game contain `command` and `data`, but not `game`.

The protocol has four main message types:

| Concept | What it does |
| --- | --- |
| Startup | Announces that the game process is running and clears old actions |
| Context | Gives Neuro readable information about the game |
| Action | Describes something Neuro may do, including optional parameters |
| Action force | Tells Neuro that the game is waiting for one of a set of actions |

The server can also send action requests and speech-finished events. These messages let a turn-based game work without giving Neuro direct access to engine memory.

## A minimal integration sequence

The first messages after connecting look like this:

```json
{
  "command": "startup",
  "game": "My Card Game"
}
```

Then the game sends a context message explaining the rules:

```json
{
  "command": "context",
  "game": "My Card Game",
  "data": {
    "message": "Each player starts with five cards. On your turn, play one card or end your turn.",
    "silent": true
  }
}
```

`silent: true` adds the information without necessarily prompting a spoken reply. Use it for rules and state that Neuro needs to remember but does not need to narrate.

The game registers actions once:

```json
{
  "command": "actions/register",
  "game": "My Card Game",
  "data": {
    "actions": [
      {
        "name": "play_card",
        "description": "Play one card from your hand.",
        "schema": {
          "type": "object",
          "properties": {
            "card_id": { "type": "string" }
          },
          "required": ["card_id"]
        }
      },
      {
        "name": "end_turn",
        "description": "End your turn without playing a card."
      }
    ]
  }
}
```

When it is Neuro's turn, the game can force a choice:

```json
{
  "command": "actions/force",
  "game": "My Card Game",
  "data": {
    "state": "Your hand: red_3, blue_2, green_1. Opponent's health: 4.",
    "query": "It is your turn. Play a card or end your turn.",
    "ephemeral_context": true,
    "priority": "low",
    "action_names": ["play_card", "end_turn"]
  }
}
```

The backend may then send:

```json
{
  "command": "action",
  "data": {
    "id": "action-42",
    "name": "play_card",
    "data": "{\"card_id\":\"blue_2\"}"
  }
}
```

The `data` field here is a JSON string. The game must parse it, validate `card_id`, perform the move, and send back the result:

```json
{
  "command": "action/result",
  "game": "My Card Game",
  "data": {
    "id": "action-42",
    "success": true,
    "message": "Blue 2 was played. It dealt two damage."
  }
}
```

Neuro waits for this result before continuing. The specification warns that a server may give up after about twenty seconds, but a game should not rely on that timeout. It should answer promptly and never leave a request unresolved.

## Installing the official SDK

### Unity

The Unity SDK targets Unity 2022.3, although nearby versions may work. The repository documentation recommends installing [Native WebSockets](https://github.com/endel/NativeWebSocket) first, then adding the SDK through the Unity Package Manager with:

```text
https://github.com/VedalAI/neuro-sdk.git?path=Unity/Assets
```

If you prefer a local copy, place `Unity/Assets` in the project's `Packages` folder and rename it to `NeuroSdk`. After installation, either drag the `NeuroSdk` prefab into the first loaded scene and set its game name, or initialise it from code:

```csharp
using NeuroSdk;

public static class NeuroBootstrap
{
    public static void Start()
    {
        NeuroSdkSetup.Initialize("My Card Game");
    }
}
```

The prefab is usually the simpler option. It is marked to survive scene changes and prevents duplicate instances. For local testing, set `NEURO_SDK_WS_URL` to the WebSocket address of the test server. For WebGL builds, follow the SDK's additional compression and environment-file setup.

Context can be sent with the SDK's `Context.Send` method:

```csharp
using NeuroSdk.Messages.Outgoing;

Context.Send("The player drew the blue 2.", silent: true);
```

Custom actions extend `NeuroAction` or `NeuroAction<T>`. `Validate` should check the incoming data and return either a success or a useful failure. `Execute` should perform the move after the result has been sent. The generic version carries parsed state from validation into execution, which avoids looking up the same game object twice.

### Godot

The Godot SDK targets Godot 4.1 and later 4.x releases. Install it from the Godot Asset Library, enable **Neuro SDK** in the plugin settings, and set the game name in `res://neuro_sdk_config.gd`. The SDK also reads `NEURO_SDK_WS_URL` for testing.

### Other engines and languages

The protocol is language-independent. An engine without an official SDK can implement the WebSocket messages directly or use one of the community SDKs listed in the repository. Whichever library you choose, send the main game protocol as plaintext JSON frames.

## Testing without the real streamer

Do not test a new integration by waiting for a public Neuro stream. The repository includes Randy, a local server that pretends to be Neuro and chooses random valid actions.

From the repository's `Randy` directory:

```bash
npm install
npm start
```

Randy listens for game connections at `ws://localhost:8000` and exposes an HTTP control port at `1337`. Point `NEURO_SDK_WS_URL` at the WebSocket address, then play through the integration.

Randy is deliberately simple. It does not reliably reproduce malformed parameters, unsolicited actions, or realistic delays. Test those cases yourself because a game adapter has to handle them.

## Designing the game interface

### Describe state explicitly

Write game state as if the reader has not watched the previous ten turns. A list of card IDs is not always enough: say whose turn it is, what the cards mean, which player has what health, and which actions are legal. Neuro is better at reading clearly stated facts than at inferring missing context.

Avoid sending a stream of tiny position updates. Send meaningful state at meaningful moments, and use the `state` field of an action force for information relevant to the current decision.

### Keep the action vocabulary stable

Register permanent actions once. Re-registering a large action set every turn adds latency and makes failures harder to diagnose. Use one parameterised action when the choices share the same verb, and use separate actions when the verbs are genuinely different.

Action names and descriptions are part of the interface. `play_card` is usable; `action_7` is not. The model reads both fields.

### Always validate the response

The server may send malformed JSON, a stale action, or a valid-looking parameter that is illegal in the current state. Treat the action request as untrusted input. Return a failure with a reason such as:

> That card is not in Neuro's hand. Her current hand is red_3, blue_2, and green_1.

That message is more useful than silently dropping the request, because Neuro can use it to choose again.

### Force only when the game is blocked

An action force is a request for a decision now. Use it for a turn, a dialog choice, or another situation where the game cannot proceed. Sending several forces at once creates a race; sending one for every possible moment turns a conversation into a command queue.

For turn-based games, the default `low` priority is usually right. Higher priorities can shorten or interrupt her speech when the game is timed. `critical` is for hard deadlines, not for making a card game feel urgent.

### Re-register after reconnecting

Context survives a disconnect. Actions do not work the same way. After reconnecting, send `startup` and register the current actions again. If a scene change makes an action unavailable, unregister it. For a disposable action such as a card play, unregister it before sending the result so that it cannot be chosen twice.

### Do not give Neuro information a human player would not have

The integration controls what becomes visible. Hiding the opponent's hand makes a card game more interesting and keeps the result meaningful. Revealing the whole simulation makes a better demo of obedience but a weaker demonstration of gameplay.

## Voice chat and real-time games

The SDK also documents an optional voice-chat side channel. It uses a second WebSocket and sends raw 48 kHz, mono, 32-bit float PCM audio. A game can tap each player's voice separately, tag it with a speaker name, and send it to Neuro. Her speech comes back through the same channel so the game can inject it into its normal voice transport.

This is not general game-audio perception. It is explicitly for voice chat, and the integration must still work when voice is unavailable. It is useful for multiplayer games where conversation is part of play, but it does not solve the timing problem for a shooter.

Both channels leave simulation and timing with the game. The protocol carries choices and speech; movement, collision, and low-level input stay local. This arrangement works for discrete decisions and requires a separate control layer for continuous action.

## Records and milestones

The public record covers gameplay results and platform milestones. Developers have also built game adapters with the SDK. This list is based on the public [NeuroWiki milestone record](https://en.neurosama.info/wiki/Neuro-sama) and the official repository, checked on 5 November 2026.

| Date | Milestone |
| --- | --- |
| May 2019 | Vedal publishes the first neural-network *osu!* experiment; the project is named Neuro-sama later that month |
| December 2022 | Neuro debuts as a Live2D streamer on Twitch |
| 29 December 2022 | She defeats top-ranked *osu!* player mrekk |
| January 2023 | Her Twitch account reaches 100,000 followers while she is temporarily suspended |
| January 2024 | Her first birthday subathon ends with 41,244 subscriptions |
| August 2024 | Her first Bilibili stream earns the platform's "Hundred Member Fleet" milestone |
| January 2025 | The channel breaks Twitch's Hype Train record, reaching Level 111 |
| November 2025 | Her first 3D model debuts |
| 8 December 2025 | She and her collaborators defeat the Ender Dragon in hardcore *Minecraft* |
| December 2025 | The channel raises its own Twitch Hype Train record again, reaching Level 123 |
| January 2026 | The channel reaches Hype Train Level 126; the birthday subathon ends with 343,117 subscriptions; her Bilibili account reaches one million followers |
| April 2026 | Her Twitch account reaches one million followers |

Opening the protocol gave outside developers a way to build adapters, test against Randy, and publish source code. The examples now cover card games, open-world games, visual novels, and social games.

Failed moves often become jokes, and some of those jokes become part of the character. A perfect move is not always the funniest outcome. Game design, latency, audience reaction, and Vedal's willingness to leave rough edges visible all contribute to that result.

## What the SDK can and cannot do

The Neuro SDK can expose game state, register available actions, force a decision, return a result, and optionally carry voice conversation.

It does not replace physics, pathfinding, or input handling. An FPS still needs a control layer capable of reacting much faster than a text model. The SDK also cannot guarantee that a model's output is valid, and it does not connect Neuro to every developer's game on demand. The actual server address and the decision to connect a character remain part of the deployment environment.

For a first integration, choose a game whose turn can be described in a few sentences. Make the rules explicit, keep the action list small, and test every failure path with Randy. A card game is less glamorous than an open-world mod, but it exposes protocol mistakes quickly. Let the game engine decide what Neuro is allowed to do, even after she has chosen an action.

## Sources

- [Official Neuro SDK repository](https://github.com/VedalAI/neuro-sdk)
- [Neuro API specification](https://github.com/VedalAI/neuro-sdk/blob/main/API/SPECIFICATION.md)
- [Neuro SDK integration best practices](https://github.com/VedalAI/neuro-sdk/blob/main/API/BEST_PRACTICES.md)
- [Unity SDK documentation](https://github.com/VedalAI/neuro-sdk/blob/main/Unity/README.md)
- [Godot SDK documentation](https://github.com/VedalAI/neuro-sdk/blob/main/Godot/README.md)
- [Neuro voice-chat API](https://github.com/VedalAI/neuro-sdk/blob/main/API/VOICE_CHAT.md)
- [NeuroWiki: Neuro-sama](https://en.neurosama.info/wiki/Neuro-sama)
- [NeuroWiki: Integrations](https://en.neurosama.info/wiki/Neuro-sama/Integrations)
- [Official Neuro-sama Twitch channel](https://www.twitch.tv/vedal987)
- [Why developers should pay attention to Neuro-sama](/post/neuro-sama-entertainment-ai-paradigm/)
