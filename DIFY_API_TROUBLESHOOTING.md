# DIFY API 故障排除指南

## 🔍 问题诊断

根据测试结果，DIFY API 返回了以下错误：
```
{
  "code": "app_unavailable",
  "message": "App unavailable, please check your app configurations.",
  "status": 400
}
```

## 🛠️ 解决方案

### 1. 检查 DIFY 应用配置

请登录您的 DIFY 控制台，确认以下设置：

- ✅ **应用状态**：确保应用已发布且处于活跃状态
- ✅ **API Token**：确认 Token 是否正确且未过期
- ✅ **应用类型**：确认应用类型支持 `completion-messages` 接口
- ✅ **输入变量**：确认应用配置了 `photo` 和 `lang` 输入变量

### 2. 验证 API Token

当前配置的 Token：`app-1xn6xh...`

请确认：
1. Token 格式正确（通常以 `app-` 开头）
2. Token 对应的应用存在且可用
3. Token 权限足够（可以调用 completion-messages 接口）

### 3. 检查应用输入配置

您的 DIFY 应用需要配置以下输入变量：
- `photo`：类型为 Text，用于接收 base64 编码的图片数据
- `lang`：类型为 Text，用于接收语言代码（如 'en', 'zh'）

### 4. 检查应用输出格式

应用应该返回包含以下字段的 JSON：
```json
{
  "analyzable": true,
  "score": 85,
  "predicted_age": 28,
  "golden_quote": "您拥有迷人的笑容！",
  "celebrity_lookalike": {
    "name": "某位明星",
    "country": "中国"
  }
}
```

## 🔧 临时解决方案

在修复 DIFY API 配置期间，我们可以启用模拟数据模式：

1. 在 `.env` 文件中添加：
```bash
# 启用模拟数据模式（用于测试）
USE_MOCK_DATA=true
```

2. 重启开发服务器：
```bash
pnpm dev
```

这样您就可以先测试整个分析流程是否正常工作。

## 📞 获取帮助

如果问题仍然存在，请：

1. 检查 DIFY 控制台中的应用日志
2. 确认应用的 Prompt 和配置是否正确
3. 联系 DIFY 技术支持获取帮助

## 🧪 测试命令

运行以下命令来测试 API 配置：
```bash
node test-dify-api.js
```

当看到 "✅ API调用成功" 时，说明配置正确。