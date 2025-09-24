# DIFY API 集成配置指南

本文档说明如何在 FaceRate 项目中配置和使用 DIFY API 进行人脸分析。

## 环境变量配置

### 1. 复制环境变量文件

```bash
cp .env.example .env
```

### 2. 配置 DIFY API 相关变量

在 `.env` 文件中找到以下配置项并填入正确的值：

```env
# DIFY API Configuration
DIFY_API_URL = "https://api.dify.ai/v1"  # 你的 DIFY API 基础URL
DIFY_API_TOKEN = ""                      # 你的 DIFY API Bearer Token
DIFY_API_TIMEOUT = "30000"               # API 请求超时时间（毫秒）
```

### 3. 获取 DIFY API Token

1. 登录到你的 DIFY 控制台
2. 进入你的应用设置
3. 在 "API Access" 或 "API 访问" 部分找到 Bearer Token
4. 复制 Token 并粘贴到 `.env` 文件中的 `DIFY_API_TOKEN` 变量

## API 接口说明

### 请求格式

- **接口地址**: `/api/analyze`
- **请求方法**: `POST`
- **请求头**: `Content-Type: application/json`

### 请求参数

```json
{
  "photo": "base64编码的图片数据",
  "lang": "语言代码 (如: en, zh, ja)"
}
```

### 响应格式

```json
{
  "analyzable": true,
  "score": 8.5,
  "predicted_age": 25,
  "golden_quote": "你拥有非常迷人的笑容...",
  "celebrity_lookalike": {
    "name": "Emma Stone",
    "country": "USA"
  }
}
```

## 错误处理

系统会自动处理以下错误情况：

- **网络错误**: 显示网络连接问题提示
- **API 错误**: 显示服务器错误信息
- **超时错误**: 显示请求超时提示
- **验证错误**: 显示参数验证失败信息
- **分析失败**: 显示图片无法分析的提示

## 安全注意事项

1. **API Token 保护**: 确保 `DIFY_API_TOKEN` 只在服务器端使用，不要暴露给前端
2. **输入验证**: 系统会自动验证上传的图片格式和大小
3. **速率限制**: 建议在生产环境中添加 API 调用频率限制
4. **HTTPS**: 生产环境中确保使用 HTTPS 协议

## 开发调试

### 启动开发服务器

```bash
pnpm dev
```

### 查看 API 调用日志

在浏览器开发者工具的 Console 中可以看到详细的 API 调用日志。

### 测试 API 接口

可以使用以下 curl 命令测试 API 接口：

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "photo": "base64_encoded_image_data",
    "lang": "en"
  }'
```

## 常见问题

### Q: API 调用失败，返回 401 错误
A: 检查 `DIFY_API_TOKEN` 是否正确配置，确保 Token 有效且有相应权限。

### Q: 请求超时
A: 可以适当增加 `DIFY_API_TIMEOUT` 的值，或检查网络连接。

### Q: 图片上传后没有反应
A: 检查图片格式是否支持（支持 JPG、PNG、WebP），文件大小是否超过限制（最大 10MB）。

### Q: 分析结果显示不完整
A: 检查 DIFY API 返回的数据格式是否与预期一致，可能需要调整数据映射逻辑。

## 部署到生产环境

1. 确保所有环境变量都已正确配置
2. 使用生产环境的 DIFY API URL 和 Token
3. 启用 HTTPS
4. 配置适当的错误监控和日志记录

---

如有问题，请查看项目文档或联系开发团队。