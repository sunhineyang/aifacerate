# DIFY API 测试指南

这个文档将帮助你测试 DIFY API 是否正确配置和连接。我们提供了两种测试方法：**自动化脚本测试**（推荐）和 **手动 HTTP 测试**。

## 🚀 方法一：自动化脚本测试（推荐）

### 运行测试脚本

在项目根目录下运行以下命令：

```bash
node test-dify-api.js
```

### 测试结果说明

脚本会自动检测三个方面：

#### 1. 环境变量检查
- ✅ **绿色 ✓**：环境变量配置正确
- ❌ **红色 ✗**：环境变量缺失或配置错误

#### 2. DIFY API 直接连接测试
- ✅ **绿色 ✓**：DIFY API 连接成功，可以正常调用
- ❌ **红色 ✗**：DIFY API 连接失败，可能是网络问题或 API 密钥错误

#### 3. 本地 API 接口测试
- ✅ **绿色 ✓**：本地 `/api/analyze` 接口工作正常
- ❌ **红色 ✗**：本地接口有问题，可能是服务器未启动或代码错误

### 成功示例输出

```
🚀 开始 DIFY API 连接测试...

=== 检查环境变量配置 ===
✓ DIFY_API_URL: https://api.dify.ai/v1
✓ DIFY_API_TOKEN: app-1xn6xh...
✓ DIFY_API_TIMEOUT: 30000

=== 测试 DIFY API 直接连接 ===
✓ DIFY API 连接成功
✓ 响应状态码: 200
✓ 响应数据格式正确

=== 测试本地 /api/analyze 接口 ===
✓ 本地 API 连接成功
✓ 响应状态码: 200
✓ 响应数据格式正确
✓ 包含 analyzable 字段: true
✓ 包含 score 字段: 85

=== 测试结果总结 ===
✓ 环境变量配置: 正常
✓ DIFY API 连接: 正常
✓ 本地 API 接口: 正常

🎉 所有测试通过！DIFY API 集成配置正确。
```

## 📋 方法二：手动 HTTP 测试

如果你熟悉 HTTP 测试工具，可以使用 `debug/apitest.http` 文件进行手动测试。

### 使用 VS Code REST Client 插件

1. 安装 "REST Client" 插件
2. 打开 `debug/apitest.http` 文件
3. 找到以下测试用例：
   - `### Test DIFY API Direct Connection`
   - `### Test FaceRate Analyze API`
4. 点击每个测试用例上方的 "Send Request" 按钮

### 使用 curl 命令

#### 测试本地 API 接口：

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "lang": "zh"
  }'
```

## 🔧 常见问题排查

### 问题 1：环境变量配置错误

**症状**：测试脚本显示环境变量未配置

**解决方案**：
1. 检查 `.env` 文件是否存在
2. 确认以下变量已正确配置：
   ```
   DIFY_API_URL=https://api.dify.ai/v1
   DIFY_API_TOKEN=app-xxxxxxxxxx
   DIFY_API_TIMEOUT=30000
   ```
3. 重启开发服务器：`pnpm dev`

### 问题 2：DIFY API 连接失败

**症状**：DIFY API 测试返回 401、403 或连接错误

**可能原因和解决方案**：
- **API Token 错误**：检查 `DIFY_API_TOKEN` 是否正确
- **API URL 错误**：确认 `DIFY_API_URL` 是否为正确的 DIFY 服务地址
- **网络问题**：检查网络连接，确保可以访问 DIFY 服务
- **API 配额用完**：检查 DIFY 账户是否还有可用配额

### 问题 3：本地 API 接口失败

**症状**：本地 API 测试连接失败或返回错误

**解决方案**：
1. **确保开发服务器正在运行**：
   ```bash
   pnpm dev
   ```
2. **检查服务器端口**：确认服务器运行在 `http://localhost:3000`
3. **查看服务器日志**：检查终端中的错误信息
4. **检查 API 路由文件**：确认 `src/app/api/analyze/route.ts` 文件存在且正确

### 问题 4：测试脚本运行失败

**症状**：运行 `node test-dify-api.js` 时出现错误

**解决方案**：
1. **确保在正确目录**：在项目根目录运行命令
2. **检查 Node.js 版本**：确保 Node.js 版本 >= 14
3. **安装依赖**：运行 `pnpm install`

## 📊 测试结果判断标准

### ✅ 测试成功标准

- **环境变量**：所有必需的环境变量都已配置
- **DIFY API**：返回状态码 200，响应包含有效的 JSON 数据
- **本地 API**：返回状态码 200，响应包含 `analyzable`、`score` 等字段

### ❌ 需要修复的情况

- 任何测试项显示红色 ✗ 标记
- 环境变量缺失或配置错误
- API 返回非 200 状态码
- 响应数据格式不正确

### ⚠️ 警告情况

- 黄色 ⚠ 标记通常表示非致命问题
- 可能影响功能但不会完全阻止运行
- 建议修复以获得最佳体验

## 🎯 下一步

当所有测试都通过后，你就可以：

1. **在网页中测试**：访问 `http://localhost:3000`，上传照片进行人脸分析
2. **查看实时日志**：在终端中观察 API 调用日志
3. **开始开发**：基于成功的 API 集成继续开发其他功能

如果遇到任何问题，请参考上面的常见问题排查部分，或者查看终端中的详细错误信息。