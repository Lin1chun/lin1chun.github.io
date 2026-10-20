# AGENTS.md — 林1纯的地下室（Hugo 站点维护指南）

> 本文档供 AI Agent 或协作者快速了解站点结构、约定与近期重构内容。
> 站点仓库：`lin1chun.github.io`，Hugo 根目录就是仓库根目录。

## 站点概览

| 项目 | 值 |
|------|-----|
| 站点名称 | 林1纯的地下室 |
| 线上地址 | <https://lin1chun.github.io/> |
| Hugo 根目录 | 仓库根目录 |
| 主题 | `hugo-theme-reimu` v0.14.1（Hugo Module） |
| 部署 | GitHub Actions → GitHub Pages（`.github/workflows/hugo.yaml`） |
| 语言 | 简体中文（`zh-CN`） |
| Hugo | Extended 0.168.0 |
| Go | 1.24+ |

本地预览：

```bash
hugo server -D
```

## 2026-10-20 结构整理

- 删除 `site/` 中间层，Hugo 源文件全部上提到仓库根目录。
- 删除已提交的 `public/`、`resources/_gen/`、`.hugo_build.lock` 等生成物，
  并在 `.gitignore` 中统一忽略。
- 删除旧静态模板残留：`index.html`、`script.js`、`styles.css`。
- 删除一次性迁移脚本与空数据文件。
- 删除 72 个与主题逐字节相同的本地模板副本，只保留真正改过的覆盖文件。
- 主题从 `themes/hugo-theme-reimu/` 的整仓副本改为 `go.mod` 锁定的
  Hugo Module，升级时不再需要复制整个主题目录。
- CI 工作目录、发布目录、README 和本文件同步更新。

## 目录结构

```text
.
├── .github/workflows/hugo.yaml
├── assets/css/
│   ├── main.scss                # 主题样式副本 + 站点自定义字体/图标
│   └── sagi-gallery.scss        # 小兔子图集专用样式
├── config/_default/params.yml   # 站点参数、导航、评论、社交链接
├── content/
│   ├── about.md
│   ├── friend.md
│   ├── archives/_index.md
│   └── post/                    # 文章；正文图片使用 Page Bundle
├── data/
│   ├── covers.yml               # 随机封面池
│   └── friends.yml              # 友链
├── layouts/                     # 仅保留站点自定义模板
├── scripts/optimize_images.py   # 静态图片压缩工具
├── static/
│   ├── avatar/                  # 侧边栏头像
│   ├── images/                  # 共享图片（封面、头图、图标、光标）
│   ├── resources/               # 本地化的前端依赖（vendor.yml 使用）
│   └── favicon.ico
├── go.mod / go.sum              # Hugo Module 版本锁定
├── hugo.toml
└── README.md
```

### 保留的模板覆盖

只保留以下与主题不同的本地文件；其余模板、短代码和 partial 均由主题模块提供。

```text
layouts/404.html
layouts/_default/baseof.html
layouts/partials/afterFooter.html
layouts/partials/footer.html
layouts/partials/helpers/render-image.html
layouts/partials/helpers/resolve-image.html
layouts/partials/helpers/vendorGoogleFont.html
layouts/shortcodes/bilibili.html
layouts/shortcodes/figure.html
layouts/shortcodes/img.html
layouts/shortcodes/sagi-gallery.html
layouts/shortcodes/video.html
```

导航、页脚、图标等路径改动集中在 `404.html`、`baseof.html`、
`afterFooter.html` 和 `footer.html`。`vendorGoogleFont.html` 把 Google Fonts
域名换成了 `fonts.loli.net`。

## 主题升级

主题版本写在 `go.mod` 和 `go.sum` 中。升级步骤：

```bash
hugo mod get github.com/D-Sketon/hugo-theme-reimu@vX.Y.Z
hugo mod tidy
hugo --minify
```

升级后重点检查：

1. `assets/css/main.scss` 是基于 v0.14.1 主题源码的完整副本，底部附加了
   `Inter`、`iconfont` 和音乐/牛肉/爱心图标样式。升级时需用新主题的
   `assets/css/main.scss` 重新合并这段自定义 CSS。
2. `layouts/partials/helpers/vendorGoogleFont.html` 的字体 CDN 替换是否仍然有效。
3. `layouts/` 中的覆盖模板是否仍与新版主题兼容。

不要重新把整个主题复制进 `themes/`。

## 写新文章

推荐使用 Page Bundle：

```bash
hugo new post/my-new-post/index.md
# 或手动创建 content/post/my-new-post/index.md
```

```markdown
+++
title = "新文章"
cover = "images/covers/paccha/paccha!!-missu.webp"
+++

{{< img "screenshot.png" "说明文字" >}}
```

### 图片短代码

解析顺序：**Page Bundle 资源 → `static/images/`**。

```markdown
{{< img "default.jpg" "可选 alt 文字" >}}

{{< figure "photo.jpg" "alt" >}}
*图注支持 Markdown*
{{< /figure >}}

{{< img "covers/paccha/paccha!!-beans.webp" "封面" >}}
```

### 视频与 B 站

```markdown
{{< video "clip.mp4" "描述文字" >}}
{{< bilibili "BV1N992B3E5s" >}}
{{< bilibili "https://www.bilibili.com/video/BV1N992B3E5s/" "可选标题" >}}
```

`video` 自动循环、静音播放；`bilibili` 使用官方 iframe，无需 API。

### 小兔子图集

```markdown
{{< sagi-gallery >}}
{{< img "default.jpg" "描述" >}}
*图注*
{{< /sagi-gallery >}}
```

## 封面与站点配置

封面 `cover` 使用相对 `static/` 的路径，不含开头的 `/`：

```yaml
cover: 'images/covers/paccha/paccha!!-beans.webp'
cover: 'images/posts/vtuber/NeuroN.webp'
```

站点全局配置在 `config/_default/params.yml`：

```yaml
banner: "images/site/banner/Chaos Theory.webp"
avatar: "Neurosagi.webp"   # 文件位于 static/avatar/，主题自动加 avatar/ 前缀
```

- Paccha 封面：`static/images/covers/paccha/`
- 随机封面池：`data/covers.yml`（GitHub 外链）
- 友链：`data/friends.yml`
- 前端依赖版本：由主题模块内的 `data/vendor.yml` 提供

## 图片优化

### Page Bundle（构建时自动）

通过 `{{< img >}}` / `{{< figure >}}` 插入的 Page Bundle 图片会：

- 宽度超过 1200px 时等比缩小
- JPG/PNG 转为 WebP（质量 82）
- 添加 `loading="lazy"`、`decoding="async"` 和 `width`/`height`

配置位于 `config/_default/params.yml`：

```yaml
imageProcessing:
  maxWidth: 1200
  quality: 82
```

构建日志中 `Processed images` 应大于 0。GIF 不会自动压缩；动图建议转 MP4：

```bash
ffmpeg -i input.gif -movflags +faststart -pix_fmt yuv420p \
  -c:v libx264 -crf 28 -an output.mp4
```

### 静态图片（手动）

```bash
python scripts/optimize_images.py          # 扫描报告
python scripts/optimize_images.py --apply  # 压缩 static/ 下的 jpg/png/webp
```

### 写文规范

- 正文图优先放在与 `index.md` 同目录的 Page Bundle 中。
- 使用 `{{< img "文件名" "描述" >}}`，不要硬编码 `/images/...`。
- 上传前尽量把长边控制在 1200px 以内。

## 已知问题 / 待办

1. **缺失图片**（文章已引用但仓库中无文件，需补传到对应 Page Bundle）：
   - `content/post/谁定义了娱乐AI的新范式？……/NeuroTwitch.webp`
   - `content/post/谁定义了娱乐AI的新范式？……/Neuro-sama-研究.webp`
2. 主题 v0.14.1 仍使用 `.Site.Data`、`.Site.Languages`、`.Language.LanguageCode`
   和 libsass，构建时会出现 Hugo 0.168 的弃用警告，但不影响产物；等上游主题更新。
3. `public/` 与 `resources/_gen/` 是生成目录，不要手动编辑或提交。

## 常用路径速查

| 用途 | 路径 |
|------|------|
| 站点配置 | `config/_default/params.yml` |
| Hugo 主配置 | `hugo.toml` |
| 博客文章 | `content/post/` |
| 自定义短代码 | `layouts/shortcodes/` |
| 图片渲染逻辑 | `layouts/partials/helpers/render-image.html` |
| 静态资源 | `static/` |
| 前端依赖 | `static/resources/` |
| CI 工作流 | `.github/workflows/hugo.yaml` |
| 图片压缩脚本 | `scripts/optimize_images.py` |

## 修改检查清单

完成内容或资源变更后：

1. 在仓库根目录运行 `hugo --minify`，确认无报错。
2. 检查新增图片是否进入正确目录（Page Bundle 或 `static/images/…`）。
3. 文章内使用 `{{< img >}}` / `{{< figure >}}`，避免绝对路径。
4. 构建日志确认 `Processed images > 0`；新增大图运行 `optimize_images.py`。
5. 若改目录、主题版本或 CI 路径，同步更新 `README.md` 与 `AGENTS.md`。
6. `git status` 中不应出现 `public/`、`resources/_gen/`、`.hugo_build.lock`。

---

*最后更新：2026-10-20（目录上提、主题模块化、构建产物清理）*
