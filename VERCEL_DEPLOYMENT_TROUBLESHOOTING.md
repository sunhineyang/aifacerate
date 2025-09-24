# Vercel 部署故障排除指南

## 问题：JSON 解析错误

### 错误信息
```
未知错误 Unexpected token 'R', "Request En"... is not valid JSON
```

### 问题原因
这个错误通常表示 API 返回的不是 JSON 格式的数据，而是 HTML 错误页面。常见原因包括：

1. **DIFY API 配置错误**
   - API URL 不正确
   - API Token 无效或过期
   - API 服务不可用

2. **环境变量配置问题**
   - Vercel 环境变量未正确设置
   - 环境变量值包含特殊字符

3. **网络连接问题**
   - DIFY API 服务器无法访问
   - 防火墙或网络限制

### 解决方案

#### 1. 检查 DIFY API 配置

在 Vercel 项目设置中，确保以下环境变量正确配置：

```bash
# DIFY API 基础 URL
DIFY_API_URL=https://api.dify.ai/v1

# DIFY API Token（必须是有效的 token）
DIFY_API_TOKEN=app-xxxxxxxxxxxxxxxxxxxxxxxxx

# API 超时时间（可选）
DIFY_API_TIMEOUT=30000
```

**重要提示：**
- `DIFY_API_TOKEN` 必须是从 DIFY 平台获取的真实有效 token
- Token 格式通常为 `app-` 开头的长字符串
- 确保 token 没有过期且有相应权限

#### 2. 使用模拟数据模式进行测试

如果 DIFY API 暂时不可用，可以启用模拟数据模式：

```bash
# 在 Vercel 环境变量中添加
USE_MOCK_DATA=true
```

这将使用内置的模拟数据，方便测试其他功能。

#### 3. 检查 Vercel 部署日志

1. 登录 Vercel 控制台
2. 进入项目页面
3. 查看 "Functions" 标签页
4. 检查 API 路由的执行日志
5. 查找具体的错误信息

#### 4. 本地测试

在本地环境测试 API 调用：

```bash
# 启动开发服务器
pnpm dev

# 在浏览器中测试人脸分析功能
# 查看浏览器控制台和终端日志
```

### 修复内容

我们已经改进了 API 错误处理，现在会：

1. **检查响应内容类型**：确保 API 返回 JSON 格式
2. **详细错误日志**：记录更多调试信息
3. **环境变量检查**：显示配置状态
4. **分类错误处理**：针对不同错误类型提供相应提示

### 下一步操作

1. **检查 DIFY API Token**：确保使用有效的 token
2. **更新 Vercel 环境变量**：设置正确的 API 配置
3. **重新部署**：推送代码后 Vercel 会自动重新部署
4. **监控日志**：查看部署后的执行日志

### 联系支持

如果问题仍然存在，请提供：
- Vercel 部署日志
- DIFY API 配置信息（隐藏敏感信息）
- 具体的错误截图