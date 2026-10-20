# Personal Blog

基于 [Hugo](https://gohugo.io/) 与 [hugo-brewm](https://github.com/foxihd/hugo-brewm)
的个人博客。仓库根目录就是 Hugo 站点，主题通过 Git 子模块固定版本，
不再依赖仓库外部的目录。

## 环境要求

- Hugo Extended `0.141.0` 或更高版本
- Node.js `20` 或更高版本
- Git

## 本地开发

首次克隆时需要同时初始化主题子模块：

```bash
git clone --recurse-submodules <YOUR_REPOSITORY_URL>
cd Website
npm ci
npm run dev
```

如果仓库已经克隆但主题目录为空：

```bash
git submodule update --init --recursive
```

启动后访问 <http://localhost:1313/en/>。当前默认语言为英语，所以站点使用
`/en/` 路径前缀；站点文字和文章内容仍然可以正常写中文。

## 常用命令

```bash
npm run dev      # 启动本地预览
npm run check    # 仅验证 Hugo 构建，不写入 public/
npm run build    # 生成站点和 Pagefind 搜索索引
```

构建产物位于 `public/`，可直接部署到任意静态托管服务。

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
├── themes/hugo-brewm/     # 固定版本的 Git 子模块
├── .editorconfig
├── .gitattributes
├── .gitignore
├── package.json
└── README.md
```

`public/`、`resources/`、`.hugo_build.lock` 和 `node_modules/` 都是生成物或
本地依赖，已被 `.gitignore` 排除。

## 发布前检查

1. 将 `config/_default/hugo.toml` 中的 `baseURL` 改为正式域名。
2. 更新作者名、邮箱、版权信息和首页内容，替换主题演示文章。
3. 安装依赖后执行 `npm run build`。
4. 部署 `public/` 目录；CI 环境需要递归检出 Git 子模块。

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
