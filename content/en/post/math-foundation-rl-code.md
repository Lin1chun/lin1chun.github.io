---
author: ["xi2p"]
title: "MFORL"
description: "The companion implementation for Mathematical Foundation Of Reinforcement Learning."
date: 2026-11-03T10:10:00+08:00
type: post
draft: false
translationKey: math-foundation-rl-code
cover: "/images/flowlines/35.svg"
coverAlt: "Flowlines branching across a wide field."
series: ["Math Foundation RL"]
tags: ["reinforcement-learning"]
categories: ["Learning"]
stage: "evergreen"
history: [
    {date = "2026-11-03", stage = "evergreen", note = "Published the original repository README and chapter file index."}
]
---

[Open the repository](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning).

code to implement content in Mathematical Foundation Of Reinforcement Learning

In chapter `1-7`, state, action and policy are represented in tabular form.

In chapter `8-10`, state, action and policy are represented in function form.

## core

The `mforl` folder is the core lib of all code files, where foundamental concepts, classes, methods are defined.

The `mforl` lib can be divided into two parts: `tabular` and `function`, corresponding to different form of state, action and policy.

## requirements

- python >= 3.9
- numpy
- torch
- tqdm

## Chapter files

| Chapter | Files |
| --- | --- |
| 2 | [calc_state_value_given_a_policy.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter2/calc_state_value_given_a_policy.py) |
| 4 | [value_iteration.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter4/value_iteration.py), [policy_iteration.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter4/policy_iteration.py), [truncated_policy_iteration.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter4/truncated_policy_iteration.py) |
| 5 | [mc_basic.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter5/mc_basic.py), [mc_exploring_starts.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter5/mc_exploring_starts.py), [mc_epsilon_greedy.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter5/mc_epsilon_greedy.py) |
| 6 | [stochastic_approximation.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter6/stochastic_approximation.py) |
| 7 | [TD_learning_of_state_value.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter7/TD_learning_of_state_value.py), [sarsa.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter7/sarsa.py), [n_step_sarsa.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter7/n_step_sarsa.py), [q_learning_on_policy.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter7/q_learning_on_policy.py), [q_learning_off_policy.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter7/q_learning_off_policy.py) |
| 8 | [TD_learning_of_state_values_without_autograd.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter8/TD_learning_of_state_values_without_autograd.py), [TD_learning_of_state_values_with_artificial_neural_network.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter8/TD_learning_of_state_values_with_artificial_neural_network.py), [sarsa_with_function_approximation.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter8/sarsa_with_function_approximation.py), [q_learning_with_function_approximation.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter8/q_learning_with_function_approximation.py), [deep_q_learning_with_function_approximation.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter8/deep_q_learning_with_function_approximation.py), [deep_q_learning_with_function_approximation_v2.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter8/deep_q_learning_with_function_approximation_v2.py) |
| 9 | [REINFORCE.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter9/REINFORCE.py), [REINFORCE_with_return_averaging.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter9/REINFORCE_with_return_averaging.py) |
| 10 | [QAC.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter10/QAC.py), [A2C.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter10/A2C.py), [DPG.py](https://github.com/xi2p/Code-For-Mathematical-Foundation-Of-Reinforcement-Learning/blob/master/chapter10/DPG.py) |
