---
author: ["Lin1chun"]
title: "Hugo 页面包、阶段与修订记录"
description: "介绍本站如何使用页面包管理文章资源、使用 stage 分类记录完成度、使用 translationKey 关联分类翻译，并配置修订记录和全屏页面。"
date: 2026-10-18T00:00:00+08:00
type: post
draft: false
translationKey: how-a-note-grows
cover: "/images/flowlines/27.svg"
coverAlt: "流线从一根细枝逐渐展开成更完整的形状。"
tags: ["写作", "数字花园", "工作流"]
categories: ["制作"]
stage: "evergreen"
history: [
    {date = "2026-10-13", stage = "seedling", note = "写下提纲。"},
    {date = "2026-10-16", stage = "budding", note = "补上翻译和修订说明。"},
    {date = "2026-10-18", stage = "evergreen", note = "对照站点检查示例。"}
]
coffee: 2
---

文章使用 Hugo 页面包，因此正文和配套文件位于同一目录。移动或归档文章时，不需要在多个位置追踪资源文件。

## 页面包结构

基本结构如下：

```text
content/zh/post/a-note/
├── index.md
├── cover.webp
└── audio.ogg
```

站点使用三条约定：

- `index.md` 保存文章正文和 front matter。
- `cover.*` 用作文章卡片和社交元数据图片。
- `audio.*` 可选地提供文章音频版本。

题图说明写入 `coverAlt`。使用屏幕阅读器的读者需要获得和视觉读者相同的图片说明。

## 阶段分类

`stage` 分类记录文章的完成程度。本站定义三个术语：

- `seedling`
- `budding`
- `evergreen`

当前阶段显示在文章标题附近，并链接到采用相同阶段的其他文章。笔记可以在持续修改时公开，内容稳定后再更新阶段。

## 分类页与翻译

分类页和标签页可以单独设置标题、说明、封面和翻译。没有这些元数据时，分类页只能使用文件夹名称。

分类翻译使用相同的 `translationKey`。中英文页面可以有不同的标题和网址，但仍是同一个分类的不同语言版本。语言切换通过该键找到对应页面。

## 修订记录

front matter 中的 `history` 列表记录有意义的修订。每条记录可包含：

- `date`
- `stage`
- `author`
- `editor`
- `reviewer`
- `note`

文章模板会把记录显示在正文之后。补充来源、修正解释或调整章节时添加记录。错别字和只影响格式的修改不需要记录。

## 全屏页面

需要完整窗口的页面使用 `type: fullscreen`。该布局适合地图、大型图表和普通文章栏宽无法容纳的视觉索引。

普通文章继续使用 Markdown。原始 HTML 只用于 Markdown 无法表达的结构，例如全屏嵌入和复杂图表。限制例外范围可以让这些页面更容易查找和审查。

## 发布检查

发布页面包之前：

1. 将 `index.md` 和媒体文件放在同一目录。
2. 页面有封面时设置 `coverAlt`。
3. 按文章当前完成度设置 `stage`。
4. 修订改变文章含义时添加 `history` 记录。
5. 执行 `npm run check` 并检查生成的页面。
