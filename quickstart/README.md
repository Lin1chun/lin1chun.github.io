# 林1纯的地下室

这个仓库包含我的个人博客网站源码，基于 Hugo 静态网站生成器和 `hugo-theme-reimu` 主题构建。

## 关于这个网站

- 站点名称：**林1纯的地下室**
- 站点地址：`https://lin1chun.vip/`
- 主题：`hugo-theme-reimu`
- 语言：简体中文
- 作者：林1纯
- 描述：`I don't want to be an engineer~🎵`
- 副标题：`✝神的上升✝`

这个网站使用 Hugo 生成静态页面，内容放在 `content/` 目录，主题文件位于 `themes/hugo-theme-reimu/`，静态资源位于 `static/`。

## 本地开发

### 前提条件

- 已安装 Hugo（建议使用 Hugo Extended 版本）
- 已安装 Git

### 启动网站

在仓库根目录下运行：

```bash
hugo server -D
```

然后打开浏览器访问：

```text
http://localhost:1313
```

### 常见命令

```bash
# 生成本地预览
hugo server -D

# 生成静态站点文件
hugo

# 清理公共文件夹
rm -rf public/*
```

## 目录结构说明

```
quickstart/
├── config/
│   └── _default/
│       └── params.yml      # 站点配置、作者信息、社交链接
├── content/               # 博客文章和页面内容
├── layouts/               # 自定义页面模板
├── static/                # 静态资源：图片、CSS、JS
├── themes/                # Hugo 主题代码
│   └── hugo-theme-reimu/
├── hugo.toml              # Hugo 配置文件
└── README.md              # 说明文档（本文件）
```

### 重要目录

- `config/_default/params.yml`：站点元信息、作者简介、社交链接、页面配置
- `content/`：博客文章、关于页、归档页等内容
- `layouts/`：主题模板或自定义页面布局
- `themes/hugo-theme-reimu/`：主题资源和样式
- `static/`：图片、资源、favicon 等静态文件

## 如何定制

### 修改站点信息

编辑 `quickstart/config/_default/params.yml` 中的以下字段：

- `author`
- `email`
- `description`
- `subtitle`
- `banner`
- `avatar`
- `social` 链接

### 修改页面内容

- `content/post/`：博客文章
- `content/about.md`：关于页面
- `content/friend.md`：友链页面

### 修改主题样式

如果你想更改主题样式，可以在 `themes/hugo-theme-reimu/` 中查找对应模板和 CSS，也可以在 `layouts/` 中覆盖模板。

### 添加静态资源

将图片、资源文件放入 `static/` 目录，例如：

- `static/images/`
- `static/avatar/`
- `static/resources/`

## 部署说明

这个仓库可以生成静态站点并部署到任意静态站点托管服务，例如 GitHub Pages、Netlify、Vercel 等。

部署过程示例：

1. 生成静态文件：

```bash
hugo
```

2. 将 `public/` 目录中的内容部署到你选择的托管平台。

## 其他说明

- 该仓库是个人博客站点源码，而不是主题文档。
- 如果你想继续扩展网站功能，可直接编辑 `content/` 中的文章和页面，或修改 `config/_default/params.yml` 进行主题设置。

### Netlify（免费）

1. 访问 [Netlify](https://www.netlify.com/)
2. 注册/登录账号
3. 拖拽项目文件夹到 Netlify
4. 网站会自动部署并获得一个网址

### Vercel（免费）

1. 访问 [Vercel](https://vercel.com/)
2. 注册/登录账号
3. 导入你的项目
4. 自动部署完成

## 💡 下一步建议

1. **添加更多内容**：博客文章、作品集、技能展示等
2. **添加动画效果**：使用 CSS 动画或 JavaScript 库（如 AOS）
3. **添加表单功能**：联系表单、订阅表单等
4. **优化性能**：压缩图片、优化代码
5. **SEO 优化**：添加 meta 标签、结构化数据
6. **添加分析工具**：Google Analytics 等

## 📚 学习资源

- [MDN Web 文档](https://developer.mozilla.org/zh-CN/) - 学习 HTML、CSS、JavaScript
- [CSS-Tricks](https://css-tricks.com/) - CSS 技巧和教程
- [JavaScript.info](https://zh.javascript.info/) - 现代 JavaScript 教程

## ❓ 常见问题

**Q: 为什么我的样式没有生效？**  
A: 检查 CSS 文件路径是否正确，确保 `index.html` 中的 `<link>` 标签路径正确。

**Q: 如何添加新的页面？**  
A: 创建新的 HTML 文件，复制 `index.html` 的结构，修改内容，然后在导航栏添加链接。

**Q: 可以修改代码结构吗？**  
A: 当然可以！这个模板是为了让你学习和自定义的，你可以随意修改。

**Q: 需要学习哪些知识？**  
A: 基础的 HTML、CSS 和 JavaScript 知识就足够了。这个项目是很好的学习起点。

## 📄 许可证

这个模板是开源的，你可以自由使用、修改和分享。

---

**祝你建站愉快！** 🎉

如果有任何问题，欢迎查看代码注释或搜索相关文档。


