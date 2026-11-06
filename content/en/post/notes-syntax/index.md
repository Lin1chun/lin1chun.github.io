---
author: ["Lin1chun"]
title: "写法速查"
description: "Markdown 和 LaTeX 的常用写法，左边是源码，右边是渲染结果。"
date: 2026-11-06T13:58:00+08:00
type: post
draft: true
translationKey: notes-syntax
hideFromRecent: true
math: true
categories: ["Notes"]
tags: ["markdown", "latex"]
stage: "seedling"
---

这一页只在本地 `npm run dev` 里出现，用来边写边查，不会发布。

## 三条规则

1. 空行才是新段落。在源码里敲一个回车，渲染出来还是同一段。
2. 公式用一对 `$` 括起来。要单独占一行，就用一对 `$$`。
3. LaTeX 命令都以反斜杠开头，大小写不同就是两个符号：`\omega` 是 $\omega$，`\Omega` 是 $\Omega$。

## 行内公式

| 你写 | 效果 |
| --- | --- |
| `$u_C$` | $u_C$ |
| `$i_B$`、`$V_{CC}$` | $i_B$、$V_{CC}$ |
| `$10^{-3}$` | $10^{-3}$ |
| `$j\omega L$` | $j\omega L$ |
| `$\dot{U}$`、`$\bar{U}$`、`$\hat{u}$` | $\dot{U}$、$\bar{U}$、$\hat{u}$ |
| `$U\angle\varphi$` | $U\angle\varphi$ |
| `$5\,\mathrm{mA}$` | $5\,\mathrm{mA}$ |
| `$R_{\mathrm{eq}}$` | $R_{\mathrm{eq}}$ |
| `$\pm 5\%$` | $\pm 5\%$ |
| `$T \approx 20\,\mathrm{ms}$` | $T \approx 20\,\mathrm{ms}$ |

带分式和根号的式子会把行撑开。行内的分式会压到上一行去，所以这类式子一律单独成行：

```text
$$
\frac{R_2}{R_1+R_2}\,u_i
\qquad
\sqrt{2}\,U
$$
```

$$
\frac{R_2}{R_1+R_2}\,u_i
\qquad
\sqrt{2}\,U
$$

一定要写在句子里，就用斜杠和括号：`$R_2/(R_1+R_2)$` 得到 $R_2/(R_1+R_2)$。

## 独立公式

源码：

```text
$$
u_C(t) = u_C(\infty) + \left[u_C(0_+) - u_C(\infty)\right] e^{-t/\tau}
$$
```

渲染：

$$
u_C(t) = u_C(\infty) + \left[u_C(0_+) - u_C(\infty)\right] e^{-t/\tau}
$$

## 多行推导

用 `aligned`，`&` 对齐等号，`\\` 换行：

```text
$$
\begin{aligned}
Z &= R + j\left(\omega L - \frac{1}{\omega C}\right) \\
|Z| &= \sqrt{R^2 + X^2}
\end{aligned}
$$
```

$$
\begin{aligned}
Z &= R + j\left(\omega L - \frac{1}{\omega C}\right) \\
|Z| &= \sqrt{R^2 + X^2}
\end{aligned}
$$

## 分段的式子

```text
$$
u_D = \begin{cases}
  0.7\,\mathrm{V}, & i_D > 0 \\
  0, & i_D = 0
\end{cases}
$$
```

$$
u_D = \begin{cases} 0.7\,\mathrm{V}, & i_D > 0 \\ 0, & i_D = 0 \end{cases}
$$

## 符号表

| 你写 | 效果 | 你写 | 效果 |
| --- | --- | --- | --- |
| `\alpha` | $\alpha$ | `\beta` | $\beta$ |
| `\gamma` | $\gamma$ | `\Delta` | $\Delta$ |
| `\theta` | $\theta$ | `\varphi` | $\varphi$ |
| `\omega` | $\omega$ | `\Omega` | $\Omega$ |
| `\tau` | $\tau$ | `\mu` | $\mu$ |
| `\pi` | $\pi$ | `\infty` | $\infty$ |
| `\cdot` | $\cdot$ | `\times` | $\times$ |
| `\pm` | $\pm$ | `\approx` | $\approx$ |
| `\leq` | $\leq$ | `\geq` | $\geq$ |
| `\neq` | $\neq$ | `\to` | $\to$ |
| `\angle` | $\angle$ | `\partial` | $\partial$ |
| `\int` | $\int$ | `\sum` | $\sum$ |
| `\vec{E}` | $\vec{E}$ | `\overline{AB}` | $\overline{AB}$ |

## 文字部分

- 二级标题：`## 标题`，三级是 `### 标题`
- 加粗：`**加粗**`，斜体：`*斜体*`
- 行内代码：用一对反引号把字包起来，像 `` `V_{CC}` ``
- 无序列表：`- 一项`
- 有序列表：`1. 一项`
- 引用：`> 一句话`，整段变成缩进的引用块
- 链接：`[文字](https://example.com)`
- 分隔线：单独一行写 `---`

## 容易踩的坑

- `$` 一定要成对。正文里只有一个 `$`，后面的排版会乱掉。
- 行内的 `\frac`、`\sqrt`、`\sum` 会压到上一行，这类式子用 `$$` 单独成行。
- 下划线 `_` 在公式外会被当成斜体标记。要写字面量就写成 `\_`，或者用反引号包起来。
- 公式里不要写中文，实在要写就用 `\text{...}`，但更常见的是把字写在外面。
- 单位用正体，写 `\mathrm{mA}`；数字和单位之间加 `\,` 隔开。
- 公式左边 `$` 后面不要留空格，写成 `$u_C$` 而不是 `$ u_C $`。
- `|` 在表格里会和列分隔符冲突，绝对值用 `\left| x \right|`。

## 提问

卡住的时候，在下面写一行 `? 问题`，答案会接在它后面。
