# 发布指南

## 目标

- 发布一个干净、可公开安装的 npm 包
- 避免泄露本地工作区身份信息
- 只发布运行时产物和公开文档

## 已完成的匿名化处理

- 测试夹具中的 ID、用户名、标题都已替换为匿名样本
- 包元数据避免暴露个人作者身份，只保留公开仓库相关链接
- 包名不再暴露本地工作区名称
- `.gitignore` 已过滤常见本地文件

## 发版前检查

执行完整验证流程：

```bash
npm test
npm run build
npm run pack:check
```

## GitHub Actions 发版流程

这个仓库现在有两条独立的 GitHub Actions 工作流：

- `ci.yml`：在推送到 `main`、`master` 以及所有 Pull Request 时执行
- `release.yml`：只有推送符合 `v*` 的 tag 时才发布到 npm

发布工作流会校验 tag 版本是否与 `package.json` 一致。

## 仓库配置

- 在 GitHub 仓库 Secrets 中添加 `NPM_TOKEN`
- 这个 token 需要具备当前包的 publish 权限

这套流程是围绕 tag push 设计的。GitHub Release 页面条目不是必须的，真正触发发布的是 tag 被推送。

## 通过 GitHub 发布

```bash
npm version patch
git push origin main --follow-tags
```

## 版本升级

发布新版本前，先更新版本号：

```bash
npm version patch
npm version minor
npm version major
```

## 建议写进发布说明的内容

- 新增或调整的 SDK 能力范围
- 类型定义中的破坏性变更
- 基于真实接口验证发现的行为变化

## 安全注意事项

- 不要提交真实 API Key
- 不要把真实探测账号写进测试和夹具
- 如果上游 `skill.md` 更新，重新核验关键响应结构
