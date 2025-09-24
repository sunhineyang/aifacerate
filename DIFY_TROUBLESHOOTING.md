# DIFY API 问题排查指南

根据测试结果，DIFY API 返回了 `400` 错误，错误信息为：`App unavailable, please check your app configurations.`

这个错误通常表示 DIFY 应用配置有问题。以下是详细的排查步骤：

## 🔍 问题分析

### 当前状态
- ✅ 环境变量配置正确
- ❌ DIFY API 返回 400 错误："App unavailable"
- ❌ 本地 API 因为 DIFY 调用失败而返回 503 错误

### 可能的原因
1. **DIFY 应用未正确发布**
2. **API Token 不正确或已过期**
3. **DIFY 应用配置不完整**
4. **API 端点 URL 不正确**

## 🛠️ 解决步骤

### 步骤 1：检查 DIFY 应用状态

1. **登录 DIFY 控制台**
   - 访问你的 DIFY 控制台（通常是 `https://cloud.dify.ai` 或你的私有部署地址）
   - 确保你已经登录到正确的账户

2. **检查应用是否存在**
   - 在应用列表中找到你的 FaceRate 应用
   - 确认应用状态为"已发布"或"运行中"

3. **检查应用配置**
   - 点击进入应用详情
   - 确认应用已经完成基本配置
   - 检查是否有必要的输入变量配置（photo, lang）

### 步骤 2：验证 API Token

1. **获取正确的 API Token**
   - 在 DIFY 应用页面，找到"API 访问"或"API Keys"部分
   - 复制正确的 API Token（通常以 `app-` 开头）

2. **更新环境变量**
   - 打开 `.env` 文件
   - 确认 `DIFY_API_TOKEN` 的值是最新的
   ```
   DIFY_API_TOKEN=app-xxxxxxxxxxxxxxxxx
   ```

3. **重启开发服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 然后重新启动
   pnpm dev
   ```

### 步骤 3：检查 API 端点

1. **确认 DIFY API URL**
   - 如果使用 DIFY Cloud：`https://api.dify.ai/v1`
   - 如果使用私有部署：`https://your-domain.com/v1`

2. **更新 .env 文件**
   ```
   DIFY_API_URL=https://api.dify.ai/v1
   ```

### 步骤 4：检查应用输入配置

在 DIFY 应用中，确保配置了以下输入变量：

1. **photo** (类型：Text)
   - 描述：Base64 编码的图片数据
   - 是否必需：是

2. **lang** (类型：Text)
   - 描述：语言代码（zh/en）
   - 是否必需：是

### 步骤 5：测试简化的 API 调用

创建一个最简单的测试来验证 DIFY API：

```bash
# 使用 curl 直接测试 DIFY API
curl -X POST "https://api.dify.ai/v1/completion-messages" \
  -H "Authorization: Bearer YOUR_ACTUAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {},
    "query": "hello",
    "response_mode": "blocking",
    "user": "test"
  }'
```

将 `YOUR_ACTUAL_TOKEN` 替换为你的实际 token。

## 📋 常见错误代码说明

| 错误代码 | 含义 | 解决方案 |
|---------|------|----------|
| 400 - app_unavailable | 应用不可用 | 检查应用发布状态和配置 |
| 401 - unauthorized | 认证失败 | 检查 API Token 是否正确 |
| 403 - forbidden | 权限不足 | 检查 Token 权限和应用访问权限 |
| 404 - not_found | 应用不存在 | 检查应用 ID 和 API 端点 |
| 429 - rate_limit | 请求频率限制 | 等待一段时间后重试 |

## 🔧 快速修复检查清单

- [ ] DIFY 应用已创建并发布
- [ ] API Token 正确且未过期
- [ ] API URL 正确（通常是 `https://api.dify.ai/v1`）
- [ ] 应用配置了必要的输入变量（photo, lang）
- [ ] .env 文件中的配置正确
- [ ] 开发服务器已重启

## 🆘 如果问题仍然存在

1. **检查 DIFY 服务状态**
   - 访问 DIFY 官方状态页面
   - 确认服务没有维护或故障

2. **联系 DIFY 支持**
   - 提供你的应用 ID
   - 提供错误信息和时间戳
   - 描述你的配置步骤

3. **使用备用方案**
   - 临时使用模拟数据进行开发
   - 等待 DIFY 服务恢复后再进行集成

## 📝 测试命令

修复配置后，重新运行测试：

```bash
# 重新测试 DIFY API 连接
node test-dify-api.js
```

如果看到绿色的 ✓ 标记，说明问题已解决！

---

**提示**：大多数 "app_unavailable" 错误都是由于应用未正确发布或 API Token 不匹配造成的。请仔细检查这两个方面。