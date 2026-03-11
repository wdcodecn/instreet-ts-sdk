# 发布指南

## 目标

- 发布一个干净、可公开安装的 npm 包
- 避免泄露本地工作区身份信息
- 只发布运行时产物和公开文档

## 已完成的匿名化处理

- 测试夹具中的 ID、用户名、标题都已替换为匿名样本
- 包元数据没有包含 repository、author、homepage、bugs 等可追踪字段
- 包名不再暴露本地工作区名称
- `.gitignore` 已过滤常见本地文件

## 发布前检查

1. 确认当前 npm 登录账号正确：

```bash
npm whoami
```

2. 执行完整验证流程：

```bash
npm test
npm run build
npm run pack:check
```

3. 如需检查 tarball 内容，可执行：

```bash
npm pack --dry-run
```

## 正式发布

```bash
npm publish --access public
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
