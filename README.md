# Personal Blog

基于 [Hugo](https://gohugo.io/) 与 [hugo-brewm](https://github.com/foxihd/hugo-brewm)
的个人博客。仓库根目录就是 Hugo 站点，主题通过 Git 子模块固定版本，
不再依赖仓库外部的目录。

- 仓库：<https://github.com/Lin1chun/lin1chun.github.io>
- 站点：<https://lin1chun.github.io/>

## 环境要求

- Hugo Extended `0.168.0` 或更高版本（固定版本见 `.hugo-version`）
- Node.js `20` 或更高版本
- Git

仓库包含 `.nvmrc`，推荐运行 `nvm use` 使用与 CI 一致的 Node.js 24。

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

启动后访问 <http://localhost:1313/>。站点目前只发布英文内容。

## 常用命令

```bash
npm run dev      # 启动本地预览，仅渲染到内存
npm run check    # 检查 JavaScript/JSON 并验证 Hugo 构建
npm run verify   # 完整发布校验：检查、构建、搜索索引和站内链接
npm run build    # 生成站点和 Pagefind 搜索索引
npm run check:links  # 构建后检查站内链接
npm run sync:neuro-feed  # 手动刷新 Neuro-sama 博客快照
```

版本节点和提交规范见 [CHANGELOG.md](CHANGELOG.md)、
[VERSIONING.md](VERSIONING.md) 和 [docs/git-history.md](docs/git-history.md)。
站点架构和发布/回滚流程见 [docs/architecture.md](docs/architecture.md) 与
[docs/operations.md](docs/operations.md)。

构建产物位于 `public/`，可直接部署到任意静态托管服务。

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages。

## 写文章

```bash
hugo new content/en/post/my-first-post.md
```

新文章会使用 [archetypes/post.md](archetypes/post.md) 中的模板。文章的 front
matter 必须保留 `type: post`。主题教程和测试页保留在仓库中，但使用
`draft: true`，不会进入生产站点、搜索或 RSS。

Neuro-sama 博客的最新三篇摘要来自 `data/neuro_blog_feed.json`。站点构建只读
这份本地快照，不会等待第三方站点。`sync-neuro-feed` 工作流每天刷新一次；
抓取失败时保留上一次成功的数据。

## 仓库结构

```text
.
├── archetypes/            # 新内容模板
├── assets/css/custom.css  # 站点自定义样式
├── assets/js/live2d/      # Live2D 加载器与交互增强
├── config/_default/       # 站点、语言和菜单配置
├── content/en/            # 页面、文章、作者和分类内容
├── data/                  # 本地构建使用的快照
├── docs/                  # 架构、运维和历史记录
├── i18n/                  # 英文界面翻译
├── layouts/partials/head/ # 社交元数据
├── scripts/               # 校验与维护脚本
├── static/live2d-widget/  # Live2D 第三方运行时与样式
├── static/live2d-models/  # Live2D 模型（桃濑日和 hiyori，官方示例模型）
├── themes/hugo-brewm/     # 固定版本的 Git 子模块
├── .github/workflows/     # CI、部署与数据同步
├── .editorconfig
├── .gitattributes
├── .gitignore
├── package.json
└── README.md
```

`public/`、`resources/`、`.hugo_build.lock` 和 `node_modules/` 都是生成物或
本地依赖，已被 `.gitignore` 排除。

## 发布前检查

1. 执行 `npm run verify`。
2. 检查受影响页面的桌面和手机布局。
3. 提交并推送到 `main`，等待 GitHub Actions 完成部署。

## 更新主题

主题当前固定在 `hugo-brewm v2.11.1`。更新时执行：

```bash
git submodule update --remote themes/hugo-brewm
git add themes/hugo-brewm
git commit -m "chore: update hugo-brewm theme"
```

更新后运行 `npm run verify`，确认主题兼容当前 Hugo 版本。

## 配置说明

- [hugo.toml](config/_default/hugo.toml)：站点地址、作者、搜索和文章功能。
- [languages.toml](config/_default/languages.toml)：英文语言和内容目录。
- [menus.en.toml](config/_default/menus.en.toml)：顶部导航。
- [custom.css](assets/css/custom.css)：覆盖主题样式。
- `content/en/_index.md`：首页介绍。
- `content/en/post/`：博客文章。

## Live2D 看板娘

页面左下角的 Live2D 看板娘（桃濑日和 hiyori）由
[stevenjoezhang/live2d-widget](https://github.com/stevenjoezhang/live2d-widget)（v1.0.1）
驱动，所有脚本与模型均自托管在本仓库，无外部 CDN 依赖：

- `static/live2d-widget/`：第三方运行时、样式和台词配置（`waifu-tips.js`、
  `waifu-tips.json`、`waifu.css`、`live2d.min.js`、`live2dcubismcore.min.js`、`chunk/`）。
- `static/live2d-models/`：模型仓库，`model_list.json` 定义可用模型列表，
  模型文件在 `model/hiyori/`（官方示例模型 PRO 版，moc3）。

入口是 [layouts/partials/head.html](layouts/partials/head.html)。站点会把
[autoload.js](assets/js/live2d/autoload.js) 与
[enhancements.js](assets/js/live2d/enhancements.js) 合并、压缩并生成内容指纹，
浏览器缓存因此会自动失效。

加载器负责校验用户偏好、按需加载第三方运行时和模型，并在宽度小于 768px 时
跳过初始化。看板娘默认关闭，只有用户在 Accessibility 菜单中主动开启后才会
加载模型并记住选择。交互增强负责分部位的点击与悬停台词、无障碍开关和工具栏
清理；交互栏按钮已禁用。

模型来自 Live2D 官方示例数据集，使用需遵守
[无偿提供素材使用授权协议](https://www.live2d.com/zh-CHS/download/sample-data/)，
许可说明见 `static/live2d-models/model/hiyori/ReadMe.txt`。

注意：站点开启了 `canonifyURLs`，本地预览需要指定 baseURL 才能加载看板娘，
`npm run dev` 已包含 `--baseURL http://localhost:1313/`。

## 许可与第三方材料

原创构建代码使用 [MIT License](LICENSE)。博客正文、原创图片、视频和美术作品
保留版权，具体范围见 [CONTENT_LICENSE.md](CONTENT_LICENSE.md)。第三方软件、
示例模型和字体图标的许可见
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 编辑约定

Shortcode 中只保留功能标签、无障碍名称、必要状态/错误信息，以及承载额外事实
的来源或图注。不要添加装饰性口号、伪系统状态、坐标、房间/章节编号、图片尺寸、
重复作者名或重复来源说明。完整规则见 [AGENTS.md](AGENTS.md)。
