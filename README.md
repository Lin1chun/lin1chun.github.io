# Personal Blog

基于 [Hugo](https://gohugo.io/) 与 [hugo-brewm](https://github.com/foxihd/hugo-brewm)
的个人博客。仓库根目录就是 Hugo 站点，主题通过 Git 子模块固定版本，
不再依赖仓库外部的目录。

- 仓库：<https://github.com/Lin1chun/lin1chun.github.io>
- 站点：<https://lin1chun.github.io/>

## 环境要求

- Hugo Extended `0.141.0` 或更高版本
- Node.js `20` 或更高版本
- Git

## 本地开发

首次克隆时需要同时初始化主题子模块：

```bash
git clone --recurse-submodules https://github.com/Lin1chun/lin1chun.github.io.git
cd lin1chun.github.io
npm ci
npm run dev
```

如果仓库已经克隆但主题目录为空：

```bash
git submodule update --init --recursive
```

启动后访问 <http://localhost:1313/en/>。当前默认语言为英语，所以站点和线上
地址都会使用 `/en/` 路径前缀；站点文字和文章内容仍然可以正常写中文。

## 常用命令

```bash
npm run dev      # 启动本地预览
npm run check    # 仅验证 Hugo 构建，不写入 public/
npm run build    # 生成站点和 Pagefind 搜索索引
```

构建产物位于 `public/`，可直接部署到任意静态托管服务。

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages。

## 写文章

```bash
hugo new content/en/post/my-first-post.md
```

新文章会使用 [archetypes/post.md](archetypes/post.md) 中的模板。文章的 front
matter 必须保留 `type: post`。

## 仓库结构

```text
.
├── archetypes/            # 新内容模板
├── assets/css/custom.css  # 站点自定义样式
├── config/_default/       # 站点、语言和菜单配置
├── content/en/            # 页面、文章、作者和分类内容
├── static/live2d-widget/  # Live2D 看板娘脚本（stevenjoezhang/live2d-widget）
├── static/live2d-models/  # Live2D 模型（桃濑日和 hiyori，官方示例模型）
├── themes/hugo-brewm/     # 固定版本的 Git 子模块
├── .github/workflows/     # GitHub Pages 自动部署
├── .editorconfig
├── .gitattributes
├── .gitignore
├── package.json
└── README.md
```

`public/`、`resources/`、`.hugo_build.lock` 和 `node_modules/` 都是生成物或
本地依赖，已被 `.gitignore` 排除。

## 发布前检查

1. 更新作者名、邮箱、版权信息和首页内容，替换主题演示文章。
2. 安装依赖后执行 `npm run build`。
3. 提交并推送到 `main`，等待 GitHub Actions 完成部署。

## 更新主题

主题当前固定在 `hugo-brewm v2.11.1`。更新时执行：

```bash
git submodule update --remote themes/hugo-brewm
git add themes/hugo-brewm
git commit -m "chore: update hugo-brewm theme"
```

更新后运行 `npm run check`，确认主题兼容当前 Hugo 版本。

## 配置说明

- [hugo.toml](config/_default/hugo.toml)：站点地址、作者、搜索和文章功能。
- [languages.toml](config/_default/languages.toml)：语言和内容目录。
- [menus.en.toml](config/_default/menus.en.toml)：顶部导航。
- [custom.css](assets/css/custom.css)：覆盖主题样式。
- `content/en/_index.md`：首页介绍。
- `content/en/post/`：博客文章。

## Live2D 看板娘

页面左下角的 Live2D 看板娘（桃濑日和 hiyori）由
[stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)（v1.0.1）
驱动，所有脚本与模型均自托管在本仓库，无外部 CDN 依赖：

- `static/live2d-widget/`：widget 脚本（`autoload.js`、`enhancements.js`、`waifu-tips.js`、
  `waifu-tips.json`、`waifu.css`、`live2d.min.js`、`live2dcubismcore.min.js`、`chunk/`）。
- `static/live2d-models/`：模型仓库，`model_list.json` 定义可用模型列表，
  模型文件在 `model/hiyori/`（官方示例模型 PRO 版，moc3）。

入口是 [layouts/partials/head.html](layouts/partials/head.html) 中的
`<script defer src="/live2d-widget/autoload.js">`，配置集中在
`static/live2d-widget/autoload.js`（模型路径、工具按钮、移动端隐藏等）。

`enhancements.js` 提供分部位的点击与悬停台词以及带冷却时间的触发逻辑。看板娘
开关位于 Accessibility 菜单的 Screen Reader Optimization 下方，会记住用户选择；
关闭后下次加载页面时不会初始化模型。

模型来自 Live2D 官方示例数据集，使用需遵守
[无偿提供素材使用授权协议](https://www.live2d.com/zh-CHS/download/sample-data/)，
许可说明见 `static/live2d-models/model/hiyori/ReadMe.txt`。

注意：站点开启了 `canonifyURLs`，本地预览需要指定 baseURL 才能加载看板娘，
`npm run dev` 已包含 `--baseURL http://localhost:1313/`。
