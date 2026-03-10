# 个人网站 - 从零开始指南

这是一个简单、清晰、可读性高的个人网站基础模板。使用纯 HTML、CSS 和 JavaScript 构建，无需任何框架或构建工具，可以直接在浏览器中打开使用。

## 📁 项目结构

```
个人网站/
├── index.html      # 主页面 HTML 结构
├── styles.css      # 样式文件
├── script.js       # JavaScript 交互功能
└── README.md       # 说明文档（本文件）
```

## 🚀 快速开始

### 方法一：直接打开（最简单）

1. 下载所有文件到同一个文件夹
2. 双击 `index.html` 文件
3. 网站会在浏览器中打开

### 方法二：使用本地服务器（推荐）

如果你想要更好的开发体验，可以使用本地服务器：

#### 使用 Python（如果已安装）

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

然后在浏览器中访问：`http://localhost:8000`

#### 使用 Node.js（如果已安装）

```bash
# 安装 http-server（只需安装一次）
npm install -g http-server

# 启动服务器
http-server
```

#### 使用 VS Code

如果你使用 VS Code，可以安装 "Live Server" 扩展，然后右键点击 `index.html` 选择 "Open with Live Server"。

## ✏️ 如何自定义

### 1. 修改个人信息

打开 `index.html` 文件，找到以下部分并修改：

```html
<!-- 修改网站标题 -->
<title>我的个人网站</title>

<!-- 修改导航栏品牌名称 -->
<div class="nav-brand">
    <a href="#home">我的网站</a>
</div>

<!-- 修改首页标题 -->
<h1 class="hero-title">你好，我是 <span class="highlight">你的名字</span></h1>
```

### 2. 修改关于我内容

在 `index.html` 中找到 `<section id="about">` 部分，修改其中的文字内容。

### 3. 添加/修改项目

在 `<section id="projects">` 部分，你可以：

- **添加新项目**：复制一个 `.project-card` 块，修改内容
- **修改现有项目**：编辑项目标题、描述、标签和链接
- **删除项目**：删除不需要的 `.project-card` 块

### 4. 修改联系方式

在 `<section id="contact">` 部分，修改：

- 邮箱地址：`mailto:your.email@example.com`
- GitHub 链接：`https://github.com/yourusername`
- 其他社交媒体链接

### 5. 修改颜色主题

打开 `styles.css` 文件，在文件开头找到 `:root` 部分，修改 CSS 变量：

```css
:root {
    --primary-color: #4a90e2;        /* 主色调 */
    --secondary-color: #50c878;      /* 次要色 */
    --text-color: #333333;           /* 文字颜色 */
    /* ... 其他变量 */
}
```

### 6. 添加头像或图片

1. 将图片文件放在项目文件夹中（建议创建 `images` 文件夹）
2. 在 HTML 中找到 `.placeholder-image` 部分
3. 替换为：

```html
<img src="images/your-photo.jpg" alt="我的头像" class="placeholder-image">
```

或者对于项目图片：

```html
<div class="project-image">
    <img src="images/project1.jpg" alt="项目截图">
</div>
```

## 🎨 样式定制

### 修改字体

在 `index.html` 的 `<head>` 部分，可以替换 Google Fonts 链接：

```html
<link href="https://fonts.googleapis.com/css2?family=你的字体&display=swap" rel="stylesheet">
```

然后在 `styles.css` 中修改 `--font-family` 变量。

### 修改布局

- **容器宽度**：修改 `--container-width` 变量
- **间距**：修改 `--spacing-*` 变量
- **圆角**：修改 `--border-radius` 变量

## 📱 响应式设计

网站已经包含了移动端适配，会在小屏幕设备上自动调整布局。主要特性：

- 移动端菜单（汉堡菜单）
- 响应式网格布局
- 自适应字体大小
- 触摸友好的按钮大小

## 🔧 功能说明

### JavaScript 功能

`script.js` 文件包含以下功能：

1. **移动端菜单切换**：点击菜单按钮显示/隐藏导航菜单
2. **平滑滚动**：点击导航链接时平滑滚动到对应区域
3. **导航栏高亮**：滚动时自动高亮当前区域的导航链接
4. **返回顶部按钮**：滚动一定距离后显示返回顶部按钮

### 如何添加新功能

在 `script.js` 文件中，你可以添加自己的 JavaScript 代码。例如：

```javascript
// 在 DOMContentLoaded 事件中添加你的初始化代码
document.addEventListener('DOMContentLoaded', function() {
    // 你的代码
});
```

## 📝 代码结构说明

### HTML 结构

- **语义化标签**：使用 `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` 等语义化标签
- **清晰的类名**：使用描述性的类名，便于理解和维护
- **注释说明**：关键部分都有中文注释

### CSS 结构

- **CSS 变量**：使用 CSS 变量统一管理颜色、字体、间距等
- **模块化组织**：按功能区域组织样式代码
- **响应式设计**：使用媒体查询适配不同屏幕

### JavaScript 结构

- **函数式组织**：每个功能都是独立的函数
- **详细注释**：每个函数都有说明注释
- **错误处理**：检查元素是否存在再操作

## 🌐 部署到网络

### GitHub Pages（免费）

1. 在 GitHub 上创建一个新仓库
2. 将所有文件上传到仓库
3. 在仓库设置中启用 GitHub Pages
4. 选择主分支作为源
5. 访问 `https://你的用户名.github.io/仓库名`

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


