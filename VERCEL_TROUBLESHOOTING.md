# Vercel 部署问题诊断指南

## 问题现象
用户报告 Vercel 部署后出现 "Internal Server Error" 错误。

## 诊断结果
✅ **本地开发环境正常**：API 端点在本地 (localhost:3001) 工作正常
✅ **代码逻辑正确**：API 路由文件没有语法错误
✅ **错误处理完善**：已添加详细的错误日志和异常处理

## 可能的原因

### 1. 环境变量配置问题 ⚠️
Vercel 部署环境中的环境变量可能未正确配置。

**需要检查的环境变量：**
- `DIFY_API_URL`: DIFY API 的基础 URL
- `DIFY_API_TOKEN`: DIFY API 的访问令牌
- `USE_MOCK_DATA`: 是否使用模拟数据（可选）

### 2. DIFY API 连接问题 🌐
- DIFY API 服务可能不可用
- API 令牌可能已过期或无效
- 网络连接问题

### 3. Vercel 函数超时 ⏱️
- DIFY API 响应时间过长
- Vercel Serverless 函数默认超时时间限制

## 解决方案

### 方案 1: 启用模拟数据模式（快速测试）
在 Vercel 环境变量中设置：
```
USE_MOCK_DATA=true
```
这将绕过 DIFY API 调用，使用模拟数据进行测试。

### 方案 2: 检查 DIFY API 配置
1. 登录 Vercel Dashboard
2. 进入项目设置 → Environment Variables
3. 确认以下变量已正确设置：
   ```
   DIFY_API_URL=https://api.dify.ai/v1
   DIFY_API_TOKEN=your-actual-token-here
   ```
4. 重新部署项目

### 方案 3: 查看 Vercel 函数日志
1. 在 Vercel Dashboard 中查看 Functions 日志
2. 查找具体的错误信息
3. 根据错误信息进行针对性修复

### 方案 4: 测试 DIFY API 连接
可以创建一个简单的测试端点来验证 DIFY API 连接：

```javascript
// 在 src/app/api/test-dify/route.ts 中创建测试端点
export async function GET() {
  const difyApiUrl = process.env.DIFY_API_URL;
  const difyApiToken = process.env.DIFY_API_TOKEN;
  
  return NextResponse.json({
    difyApiUrl: difyApiUrl ? 'configured' : 'missing',
    difyApiToken: difyApiToken ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
}
```

## 监控和日志

当前 API 已包含详细的错误日志：
- 环境变量检查日志
- DIFY API 调用日志
- 错误分类和处理日志

这些日志可以在 Vercel Functions 面板中查看。

## 联系支持

如果问题仍然存在，请提供：
1. Vercel 部署 URL
2. Vercel Functions 日志截图
3. 具体的错误信息
4. 环境变量配置状态（不要包含敏感信息）

---

**注意**：本地开发环境工作正常，说明代码逻辑没有问题。问题主要集中在部署环境的配置上。