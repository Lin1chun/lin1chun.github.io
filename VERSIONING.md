# Versioning

## Version format

站点使用语义化版本号 `MAJOR.MINOR.PATCH`，版本以 Git annotated tag
`vX.Y.Z` 标记。

- `MAJOR`：永久链接、内容模型或站点架构发生不兼容变化。
- `MINOR`：新增页面、内容系列或用户可见功能。
- `PATCH`：修复、无障碍改进、内容勘误和性能调整。

`package.json`、`package-lock.json` 和本文件所对应的版本号应在发布提交中
保持一致。

## Commit format

提交标题使用：

```text
type(scope): imperative summary
```

常用类型：

- `feat`：新增功能或内容能力。
- `fix`：修复错误或回归。
- `refactor`：不改变外部行为的结构调整。
- `content`：文章正文、元数据和内容组织。
- `style`：只调整格式或样式。
- `docs`：文档和版本记录。
- `build`：依赖、构建和工具链。
- `ci`：GitHub Actions 等工作流。
- `chore`：其他维护工作。

一次提交只处理一个主题。已经推送的 `main` 历史不重写；需要整理多个提交时，
先在功能分支完成压缩和改写，再合并。

## Release process

1. 运行 `npm run check`。
2. 更新 `package.json` 和 `package-lock.json` 的版本号。
3. 在 `CHANGELOG.md` 中记录本次发布。
4. 提交为 `chore: release vX.Y.Z`。
5. 创建 annotated tag：`git tag -a vX.Y.Z -m "Release vX.Y.Z"`。
6. 推送提交和标签：`git push origin main --follow-tags`。

## Historical checkpoints

`v0.1.0` 至 `v0.5.0` 的标签补充在已有里程碑提交上，用来标记可回看的站点
状态。补标签不会改变提交内容或提交哈希。
