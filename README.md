# 林1纯的地下室

个人博客源码：Hugo 生成，使用 `hugo-theme-reimu` 主题，推送到 `master` 后由 GitHub Actions 部署到 GitHub Pages。

- 线上地址：<https://lin1chun.github.io/>
- 语言：简体中文
- Hugo 扩展版：`0.168.0`
- Go：`1.24+`（Hugo Modules）

## 本地开发

```bash
# 安装主题依赖（首次或升级主题后）
hugo mod get github.com/D-Sketon/hugo-theme-reimu@v0.14.1

# 本地预览
hugo server -D

# 生产构建
hugo --minify
```

预览地址：<http://localhost:1313/>

`public/`、`resources/_gen/` 和 `.hugo_build.lock` 都是生成物，已加入 `.gitignore`，不要提交。

## 目录结构

```text
.
├── .github/workflows/hugo.yaml   # GitHub Pages 部署
├── assets/css/                   # 覆盖主题的 SCSS
├── config/_default/params.yml    # 站点参数
├── content/                      # 文章与页面
├── data/                         # 封面池、友链
├── layouts/                      # 仅保留站点自定义的模板与短代码
├── scripts/optimize_images.py    # 静态图片压缩工具
├── static/                       # 图片、头像、favicon、前端依赖
├── go.mod / go.sum               # Hugo Module 版本锁定
└── hugo.toml                     # Hugo 主配置
```

主题本体不放在仓库里，由 `go.mod` 锁定为
`github.com/D-Sketon/hugo-theme-reimu v0.14.1`。站点对主题的改动只保留在
`assets/css/main.scss`、`layouts/partials/helpers/vendorGoogleFont.html`
和必要的模板覆盖中。

## 写文章

文章使用 Page Bundle，图片与 `index.md` 放在同一个目录：

```bash
hugo new post/my-new-post/index.md
```

```markdown
+++
title = "新文章"
cover = "images/covers/paccha/paccha!!-missu.webp"
+++

{{< img "screenshot.png" "说明文字" >}}
{{< figure "photo.jpg" "alt" >}}
*图注支持 Markdown*
{{< /figure >}}
```

Page Bundle 中的 JPG/PNG 会在构建时等比缩到 1200px 并转为 WebP。
静态共享图片放在 `static/images/`，引用时写相对 `images/` 的路径。

更多约定见 [AGENTS.md](AGENTS.md)。

## 部署

`.github/workflows/hugo.yaml` 会在推送到 `master` 时：

1. 安装 Hugo Extended 与 Go
2. 下载 `go.mod` 中锁定的主题模块
3. 运行 `hugo --gc --minify`
4. 将 `public/` 上传并部署到 GitHub Pages
