# 环境变量配置指南

本文档详细说明了项目中所有环境变量的配置要求，帮助您快速了解哪些配置是必需的，哪些是可选的。

## 🔴 必需配置（项目运行的基本要求）

### 1. 基础Web配置
```bash
# 网站基本信息
NEXT_PUBLIC_WEB_URL = "http://localhost:3000"  # 开发环境URL，生产环境需要改为实际域名
NEXT_PUBLIC_PROJECT_NAME = "ShipAny"           # 项目名称
```

### 2. 身份验证配置
```bash
# 必需的身份验证密钥
AUTH_SECRET = "Zt3BXVudzzRq2R2WBqhwRy1dNMq48Gg9zKAYq7YwSL0="  # 已生成，可直接使用
AUTH_URL = "http://localhost:3000/api/auth"                      # 认证服务URL
AUTH_TRUST_HOST = true                                          # 信任主机设置
```

### 3. DIFY API配置（人脸分析功能必需）
```bash
# DIFY API服务配置
DIFY_API_URL = "https://api.dify.ai/v1"                    # DIFY API地址
DIFY_API_TOKEN = "app-1xn6xh2xGHri6hO5XGrMCmTx"           # 您的DIFY API令牌
DIFY_API_TIMEOUT = "30000"                                # API超时时间（毫秒）
USE_MOCK_DATA = "false"                                   # 是否使用模拟数据
```

### 4. 主题和本地化
```bash
# 界面主题设置
NEXT_PUBLIC_DEFAULT_THEME = "system"        # 默认主题（system/light/dark）
NEXT_PUBLIC_LOCALE_DETECTION = "false"      # 是否自动检测语言
```

## 🟡 可选配置（增强功能）

### 1. 数据库配置（如需用户数据存储）
```bash
# Supabase数据库
DATABASE_URL = ""  # 如果需要存储用户数据，请配置Supabase数据库URL
```

### 2. 第三方登录（可选）
```bash
# Google登录
AUTH_GOOGLE_ID = ""                           # Google OAuth客户端ID
AUTH_GOOGLE_SECRET = ""                       # Google OAuth客户端密钥
NEXT_PUBLIC_AUTH_GOOGLE_ID = ""               # 前端使用的Google客户端ID
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED = "false"     # 是否启用Google登录
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED = "false"  # 是否启用Google一键登录

# GitHub登录
AUTH_GITHUB_ID = ""                           # GitHub OAuth应用ID
AUTH_GITHUB_SECRET = ""                       # GitHub OAuth应用密钥
NEXT_PUBLIC_AUTH_GITHUB_ENABLED = "false"     # 是否启用GitHub登录
```

### 3. 数据分析（可选）
```bash
# Google Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = ""          # Google Analytics跟踪ID

# OpenPanel分析
NEXT_PUBLIC_OPENPANEL_CLIENT_ID = ""          # OpenPanel客户端ID

# Plausible分析
NEXT_PUBLIC_PLAUSIBLE_DOMAIN = ""             # Plausible域名
NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL = ""         # Plausible脚本URL
```

### 4. 支付功能（如需付费功能）
```bash
# Stripe支付
STRIPE_PUBLIC_KEY = ""                        # Stripe公钥
STRIPE_PRIVATE_KEY = ""                       # Stripe私钥
STRIPE_WEBHOOK_SECRET = ""                    # Stripe Webhook密钥

# Creem支付（替代方案）
CREEM_ENV = ""                                # Creem环境
CREEM_API_KEY = ""                            # Creem API密钥
CREEM_WEBHOOK_SECRET = ""                     # Creem Webhook密钥
CREEM_PRODUCTS = ''                           # Creem产品配置

# 支付相关页面
PAY_PROVIDER = "stripe"                       # 支付提供商选择
NEXT_PUBLIC_PAY_SUCCESS_URL = "/my-orders"    # 支付成功页面
NEXT_PUBLIC_PAY_FAIL_URL = "/pricing"         # 支付失败页面
NEXT_PUBLIC_PAY_CANCEL_URL = "/pricing"       # 支付取消页面
```

### 5. 文件存储（如需上传功能）
```bash
# AWS S3存储
STORAGE_ENDPOINT = ""                         # S3端点
STORAGE_REGION = ""                           # S3区域
STORAGE_ACCESS_KEY = ""                       # S3访问密钥
STORAGE_SECRET_KEY = ""                       # S3秘密密钥
STORAGE_BUCKET = ""                           # S3存储桶名称
STORAGE_DOMAIN = ""                           # S3域名
```

### 6. 广告收入（可选）
```bash
# Google AdSense
NEXT_PUBLIC_GOOGLE_ADCODE = ""                # Google AdSense代码
```

### 7. 管理员配置（可选）
```bash
# 管理员邮箱列表（用逗号分隔）
ADMIN_EMAILS = ""                             # 管理员邮箱，如："admin1@example.com,admin2@example.com"
```

## 📋 快速配置检查清单

### 最小运行配置（必需）
- [ ] `NEXT_PUBLIC_WEB_URL` - 设置为您的域名
- [ ] `NEXT_PUBLIC_PROJECT_NAME` - 设置项目名称
- [ ] `AUTH_SECRET` - 已配置（可直接使用）
- [ ] `AUTH_URL` - 设置认证URL
- [ ] `DIFY_API_URL` - DIFY API地址
- [ ] `DIFY_API_TOKEN` - 您的DIFY API令牌
- [ ] `DIFY_API_TIMEOUT` - API超时设置
- [ ] `USE_MOCK_DATA` - 设置为"false"使用真实API

### 推荐配置（增强体验）
- [ ] `DATABASE_URL` - 如需用户数据存储
- [ ] Google或GitHub登录 - 提升用户体验
- [ ] Google Analytics - 了解用户行为
- [ ] 支付配置 - 如有付费功能

## 🚀 部署注意事项

1. **生产环境**：将所有`localhost:3000`替换为实际域名
2. **安全性**：确保所有密钥和令牌安全存储，不要提交到代码仓库
3. **DIFY API**：确保DIFY API令牌有效且有足够的调用额度
4. **测试**：部署前在本地测试所有配置的功能

## 💡 获取配置信息的方法

- **DIFY API令牌**：登录DIFY控制台，在应用设置中获取
- **Google OAuth**：在Google Cloud Console创建OAuth应用
- **GitHub OAuth**：在GitHub Settings > Developer settings创建OAuth应用
- **Stripe密钥**：在Stripe Dashboard的API密钥部分获取
- **数据库URL**：在Supabase项目设置中获取连接字符串

---

**提示**：如果您是初学者，建议先配置必需项目，项目运行正常后再逐步添加可选功能。