# Changelog

本文件按版本汇总站点中值得保留的变化。历史版本来自已有提交的整理，
没有改写原始提交历史。完整提交索引见
[`docs/git-history.md`](docs/git-history.md)。

## [Unreleased]

### Added

- 新增 pull request CI、PR 模板和代码所有者声明。
- 新增架构、运维、贡献、安全与第三方许可说明。
- 新增动态 JavaScript、JSON 和仓库卫生检查。
- Dependabot 开始维护主题子模块。
- 明确原创代码、原创内容和第三方组件的许可证范围。

### Changed

- 固定本地 Node.js 推荐版本，并统一 CI 的 Node.js 来源。
- 固定 GitHub Actions 的 Ubuntu 运行环境，避免 `ubuntu-latest` 迁移造成漂移。
- 完善二进制文件和第三方资产的 Git 属性。

## [0.5.0] - 2026-11-04

### Added

- 发布 Math Foundation RL 讲义页，内嵌原始 37 页 PDF，并保留原稿目录和页码。
- 发布 MFORL 配套代码页，保留仓库 README 的内容和章节文件入口。
- 新增 Learning 分类与 Math Foundation RL 系列。
- 新增响应式 PDF 阅读器。

### Changed

- 建立版本、提交信息和发布流程文档。

## [0.4.0] - 2026-11-03

### Added

- 添加 Moe ICP 页脚标识。

### Fixed

- 对齐并居中 Moe ICP 页脚链接。
- 统一版权与咖啡统计的页脚布局。
- 让 Giscus 评论区继承站点主题，并与页面背景融合。

### Changed

- 简化页脚元信息布局。
- 更新 Neuro-sama 博客快照。

## [0.3.0] - 2026-11-01

### Added

- 发布 Friends 页面和 Neuro-sama 博客快照。
- 添加沉浸式 Study 页面、音乐播放器、专注计时器和 Hiyori 对话。

### Changed

- 站点切换为英文单语言内容结构。
- 恢复首页轮播、分类封面与 Neuro-sama 订阅入口。
- 将 Live2D 资源纳入 Hugo 资源处理流程。

### Fixed

- 恢复 Neuro-sama 博客订阅链接。

## [0.2.0] - 2026-10-25

### Added

- 添加 Hiyori Momose Live2D 模型、交互和台词。
- 发布第二篇 Bilibili 直播记录、Neuro-sama 长文和 ARG 档案。
- 添加 Malbolge 交互示例、图片画廊、归档页头和流线封面。

### Changed

- 整理文章文案、页脚链接和文章资源。
- 移除 Live2D 工具栏中的非必要控件。

### Fixed

- 限制 GitHub Actions 依赖安装的重试次数。

## [0.1.0] - 2026-10-20

### Added

- 初始化 Hugo 个人博客。
- 配置 GitHub Pages 部署。
