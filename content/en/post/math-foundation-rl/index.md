---
author: ["cc98 @Hydrofoil"]
title: "Math Foundation RL"
description: "The original 37-page course summary by cc98 @Hydrofoil, with the companion MFORL code repository."
date: 2026-11-03T10:00:00+08:00
type: post
draft: false
translationKey: math-foundation-rl
cover: "/images/flowlines/31.svg"
coverAlt: "Flowlines converging into a central point."
series: ["Math Foundation RL"]
tags: ["reinforcement-learning", "mathematics", "course-notes"]
categories: ["Learning"]
stage: "evergreen"
history: [
    {date = "2026-11-03", stage = "evergreen", note = "Published the original 37-page PDF and its contents."}
]
---

{{< pdf-reader src="MathFoundationRL.pdf" title="Math Foundation RL, a 37-page course summary by cc98 @Hydrofoil" >}}

## Contents

- Basic Concepts
    - [MDP: Markov Decision Process](MathFoundationRL.pdf#page=1)
- Bellman Equation
    - [State Value](MathFoundationRL.pdf#page=2)
    - [Bellman Equation](MathFoundationRL.pdf#page=2)
    - [Action Value](MathFoundationRL.pdf#page=3)
- [BOE: Bellman Optimality Equation](MathFoundationRL.pdf#page=3)
    - [Intro](MathFoundationRL.pdf#page=3)
    - [How to Solve](MathFoundationRL.pdf#page=4)
    - [Truncated Policy Iteration Algorithm](MathFoundationRL.pdf#page=5)
- [MC: Monte Carlo Learning](MathFoundationRL.pdf#page=6)
    - [MC Basic algorithm](MathFoundationRL.pdf#page=7)
    - [MC Exploring Starts](MathFoundationRL.pdf#page=8)
    - [MC ε-Greedy](MathFoundationRL.pdf#page=9)
- [SA: Stochastic Approximation](MathFoundationRL.pdf#page=10)
    - [Robbins-Monro algorithm](MathFoundationRL.pdf#page=11)
    - [BGD, SGD, MBGD](MathFoundationRL.pdf#page=11)
- [TD: Temporal Difference Learning](MathFoundationRL.pdf#page=12)
    - [Sarsa](MathFoundationRL.pdf#page=13)
    - [n-step Sarsa](MathFoundationRL.pdf#page=15)
    - [Q-learning](MathFoundationRL.pdf#page=16)
- [Value Function Approximation](MathFoundationRL.pdf#page=17)
    - [Algorithm for state value estimation](MathFoundationRL.pdf#page=17)
    - [Sarsa with function approximation](MathFoundationRL.pdf#page=21)
    - [Deep Q-learning](MathFoundationRL.pdf#page=22)
- [Policy Gradient Methods](MathFoundationRL.pdf#page=24)
    - [Metrics to define optimal policies](MathFoundationRL.pdf#page=24)
    - [Gradients of the metrics](MathFoundationRL.pdf#page=26)
    - [Gradient-ascent algorithm (REINFORCE)](MathFoundationRL.pdf#page=27)
- [Actor-Critic Methods](MathFoundationRL.pdf#page=30)
    - [The simplest actor-critic (QAC)](MathFoundationRL.pdf#page=30)
    - [Advantage actor-critic (A2C)](MathFoundationRL.pdf#page=30)
    - [Off-policy actor-critic](MathFoundationRL.pdf#page=33)
    - [Deterministic actor-critic (DPG)](MathFoundationRL.pdf#page=36)

## Source

Original notes: **MathFoundationRL**, 37 pages, cc98 @Hydrofoil.

Companion code: [MFORL](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning).
