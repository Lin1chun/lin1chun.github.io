# AGENTS.md — 林1纯的地下室（Hugo 站点维护指南）

> 本文档供 AI Agent 或协作者快速了解站点结构、约定与近期重构内容。  
> 站点仓库：`lin1chun.github.io`，Hugo 根目录：**`site/`**（原 `quickstart/`，已于 2026-06-12 重命名）。

## 站点概览

| 项目 | 值 |
|------|-----|
| 站点名称 | 林1纯的地下室 |
| 线上地址 | https://lin1chun.vip/ |
| Hugo 根目录 | `site/` |
| 主题 | `hugo-theme-reimu`（位于 `site/themes/`） |
| 部署 | GitHub Actions → GitHub Pages（`.github/workflows/hugo.yaml`） |
| 语言 | 简体中文（`zh-CN`） |

本地预览：

```bash
cd site
hugo server -D
```

## 2026-06-12 重构摘要

### 1. 目录重命名

- `quickstart/` → **`site/`**（更贴合个人博客，而非 Hugo 教程默认名）
- 同步更新：`go.mod`、`.github/workflows/hugo.yaml`、`site/README.md`

### 2. 静态图片分类

原先所有图片堆在 `static/images/` 根目录。现按用途分类：

```
static/images/
├── site/                    # 全站主题资源
│   ├── banner/              # 顶栏头图（Chaos Theory.webp 等）
│   ├── icons/               # taichi、reimu、algolia 等 UI 图标
│   └── cursor/              # 自定义鼠标光标
├── avatar/                  # 侧边栏头像 → 实际路径为 `static/avatar/`（主题硬编码前缀）
├── covers/paccha/           # 文章封面（paccha!!-*.webp）
├── posts/vtuber/            # 跨文章共用的 VTuber 相关图
└── sponsor/                 # 赞助二维码等
```

**文章正文图片**已迁移为 **Hugo Page Bundle**：与 `index.md` 放在同一文件夹，便于长期维护。

| 文章目录 | 说明 |
|----------|------|
| `content/post/画过的一些小兔子/` | 11 张 sagi 插画 + index.md（`slug` 保留 URL 中的 `~`） |
| `content/post/a16z为何押注日本…/` | 正文配图 + index.md |
| `content/post/我的NSEP项目/` | water-bottles.jpg + index.md |
| `content/post/谁定义了娱乐AI…/` | index.md（见下方缺失文件） |
| `content/post/lin1chun-feels-so-alive/` | AI 小 MV 记录 + 5 张配图 + index.md |

其余仅含封面的文章仍为单文件 `.md`，封面路径指向 `images/covers/paccha/…`。

### 3. 图片短代码（无需手写完整 URL）

新增短代码，解析顺序：**Page Bundle 资源 → `static/images/`**。

**单图：**

```markdown
{{< img "default.jpg" "可选 alt 文字" >}}
```

**带 figcaption 的 figure（必须有闭合标签）：**

```markdown
{{< figure "photo.jpg" "alt" >}}
*图注 Markdown*
{{< /figure >}}
```

**引用共享静态资源（需带相对 `images/` 的子路径）：**

```markdown
{{< img "covers/paccha/paccha!!-beans.webp" "封面" >}}
```

**B 站视频嵌入（官方 iframe 播放器，无需 API）：**

```markdown
{{< bilibili "BV1N992B3E5s" >}}
{{< bilibili "https://www.bilibili.com/video/BV1N992B3E5s/" "可选标题" >}}
```

实现文件：

- `site/layouts/shortcodes/img.html`
- `site/layouts/shortcodes/figure.html`
- `site/layouts/shortcodes/bilibili.html`
- `site/layouts/partials/helpers/resolve-image.html`

### 4. Front Matter 封面路径约定

封面 `cover` 字段使用相对 static 的路径（不含 leading `/`）：

```yaml
cover: 'images/covers/paccha/paccha!!-beans.webp'
cover: 'images/posts/vtuber/NeuroN.webp'
```

站点全局头图等在 `site/config/_default/params.yml`：

```yaml
banner: "images/site/banner/Chaos Theory.webp"
avatar: "Neurosagi.webp"   # 文件位于 static/avatar/，主题会自动加 avatar/ 前缀
```

## 写新文章的标准流程

### 推荐：Page Bundle + 短代码

```bash
cd site
hugo new post/my-new-post/index.md
# 或手动创建 content/post/my-new-post/index.md
# 把图片放进同一目录
```

```markdown
+++
title = "新文章"
cover = "images/covers/paccha/paccha!!-missu.webp"
+++

{{< img "screenshot.png" "说明文字" >}}
```

### 封面图选择

- Paccha 系列封面：`static/images/covers/paccha/`
- 随机封面池：`site/data/covers.yml`（目前为 GitHub 外链，与本地 paccha 目录独立）

## 图片加载优化

### 自动（构建时，已启用）

通过 `{{< img >}}` / `{{< figure >}}` 插入的 **Page Bundle 图片**，在 `hugo` 构建时会自动：

- 宽度超过 **1200px** 时等比缩小
- JPG/PNG 转为 **WebP**（默认质量 82）
- 添加 `loading="lazy"`、`decoding="async"` 及 `width`/`height`（减少布局跳动）

配置位于 `site/config/_default/params.yml`：

```yaml
imageProcessing:
  maxWidth: 1200
  quality: 82
```

构建日志中 `Processed images` 应大于 0。输出示例：`channels4_banner_hu_xxx.webp`。

**GIF 不会自动压缩**（会保留动画）。动图建议转为 MP4 后用 `{{< video >}}`：

```markdown
{{< video "clip.mp4" "描述文字" >}}
```

`video` 短代码与 GIF 一样自动循环、静音播放，体积通常小一个数量级。

### 手动（静态资源）

```bash
cd site
python scripts/optimize_images.py          # 扫描报告
python scripts/optimize_images.py --apply  # 压缩 static/ 下的 jpg/png/webp
```

### 已处理的动图（2026-06-12）

| 原文件 | 新文件 | 体积变化 |
|--------|--------|----------|
| `a16z…/demo_07.gif` | `demo_07.mp4` | 6.8 MB → 602 KB |
| `a16z…/demo_09.gif` | `demo_09.mp4` | 1.6 MB → 223 KB |

转换命令参考（ffmpeg）：

```bash
ffmpeg -i input.gif -movflags +faststart -pix_fmt yuv420p -c:v libx264 -crf 28 -an output.mp4
```

### 仍可优化

| 文件 | 约大小 | 建议 |
|------|--------|------|
| `content/post/我的NSEP项目/water-bottles.jpg` | 2.4 MB | 构建时已输出 WebP；源文件可自行压缩 |

### 写文规范

- 正文图：**必须用** `{{< img "文件名" "描述" >}}`，不要用 `![...](/images/...)`
- 图片放在与 `index.md` 同目录的 Page Bundle 中
- 上传前尽量将长边控制在 1200px 以内

## 已知问题 / 待办

1. **缺失图片**（文章已引用但仓库中无文件，需作者补传至对应 Page Bundle）：
   - `content/post/谁定义了娱乐AI…/NeuroTwitch.webp`
   - `content/post/谁定义了娱乐AI…/Neuro-sama-研究.webp`

2. **`public/` 目录**：为构建产物，不应手动编辑；修改后运行 `hugo` 重新生成。

3. **主题升级**：`site/themes/hugo-theme-reimu/` 为主题副本；升级时注意 `site/layouts/` 中的覆盖模板与 `params.yml` 自定义项。

## 常用路径速查

| 用途 | 路径 |
|------|------|
| 站点配置 | `site/config/_default/params.yml` |
| Hugo 主配置 | `site/hugo.toml` |
| 博客文章 | `site/content/post/` |
| 自定义短代码 | `site/layouts/shortcodes/` |
| 静态资源 | `site/static/` |
| CI 工作流 | `.github/workflows/hugo.yaml` |
| 迁移脚本（一次性） | `site/scripts/migrate_page_bundles.py` |
| 图片压缩脚本 | `site/scripts/optimize_images.py` |
| 图片渲染逻辑 | `site/layouts/partials/helpers/render-image.html` |
| 动图短代码 | `site/layouts/shortcodes/video.html` |

## 修改检查清单

完成内容或资源变更后，Agent 应：

1. 在 `site/` 下运行 `hugo --minify` 确认无报错
2. 检查新增图片是否进入正确目录（bundle 或 `static/images/…`）
3. 文章内使用 `{{< img >}}` / `{{< figure >}}`，避免硬编码 `/images/…` 绝对路径
4. 构建后确认 `Processed images > 0`；新增大图运行 `optimize_images.py`
5. 若改目录名或 CI 路径，同步更新 `AGENTS.md` 与本文件日期

---

*最后更新：2026-06-12（含图片优化）*
