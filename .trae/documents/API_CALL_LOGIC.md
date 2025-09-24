# FaceRate API 调用逻辑文档

## 概述

本文档详细说明了 FaceRate 项目中如何调用 DIFY API 进行人脸分析的完整流程。

## 1. 整体架构

```
用户上传照片 → 前端处理 → API路由 → DIFY API → 返回结果 → 前端展示
```

## 2. 核心组件

### 2.1 useAnalyze Hook (`src/hooks/useAnalyze.ts`)

这是处理API调用的核心Hook，提供以下功能：

- **状态管理**：管理 loading、error、success 状态
- **图片转换**：将File对象转换为base64格式
- **API调用**：调用后端API进行分析
- **错误处理**：统一处理各种错误情况

```typescript
const { analyze, loading, error, clearError } = useAnalyze();
```

### 2.2 API路由 (`app/api/analyze/route.ts`)

后端API路由，负责：

- **接收请求**：接收前端发送的图片和语言参数
- **调用DIFY**：向DIFY API发送请求
- **数据转换**：将DIFY返回的数据转换为前端需要的格式
- **错误处理**：处理API调用过程中的各种错误

## 3. 详细调用流程

### 3.1 用户操作流程

1. **上传照片**：用户在 `PhotoUpload` 组件中选择照片
2. **显示进度**：切换到 `AnalysisProgress` 组件，显示分析进度（8秒）
3. **API调用**：进度完成后，在后台调用DIFY API
4. **显示结果**：API返回结果后，切换到 `ResultDisplay` 组件

### 3.2 技术实现流程

#### 步骤1：照片上传处理
```typescript
const handlePhotoUpload = async (file: File) => {
  // 1. 验证图片文件
  const validation = validateImageFile(file);
  
  // 2. 创建预览URL
  const imageUrl = URL.createObjectURL(file);
  setUploadedImage(imageUrl);
  
  // 3. 切换到分析状态
  setCurrentStep('analyzing');
  
  // 4. 延迟8秒后调用API
  setTimeout(async () => {
    const base64 = await convertToBase64(file);
    const result = await analyze(base64, locale);
    setAnalysisResult(result);
    setCurrentStep('result');
  }, 8000);
};
```

#### 步骤2：图片格式转换
```typescript
export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // 移除 "data:image/...;base64," 前缀
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

#### 步骤3：API调用
```typescript
const analyze = async (photo: string, lang: string = 'en'): Promise<AnalysisResult> => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photo, lang }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    setError(error.message);
    throw error;
  } finally {
    setLoading(false);
  }
};
```

#### 步骤4：后端API处理
```typescript
export async function POST(request: Request) {
  try {
    const { photo, lang } = await request.json();
    
    // 调用DIFY API
    const response = await fetch(process.env.DIFY_API_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { photo, lang },
        response_mode: 'blocking',
        user: 'facerate-user'
      }),
    });
    
    const data = await response.json();
    
    // 转换数据格式
    const result = {
      overall_score: data.data.outputs.overall_score,
      detailed_scores: data.data.outputs.detailed_scores,
      suggestions: data.data.outputs.suggestions,
      // ... 其他字段
    };
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

## 4. 数据结构

### 4.1 请求数据
```typescript
interface AnalyzeRequest {
  photo: string;  // base64编码的图片数据
  lang: string;   // 语言代码 (en, zh, etc.)
}
```

### 4.2 响应数据
```typescript
interface AnalysisResult {
  overall_score: number;           // 总体评分 (1-10)
  detailed_scores: {
    facial_symmetry: number;       // 面部对称性
    skin_quality: number;          // 皮肤质量
    eye_appeal: number;            // 眼部吸引力
    facial_structure: number;      // 面部结构
    smile_attractiveness: number;  // 笑容吸引力
  };
  suggestions: string[];           // 改善建议
  confidence_level: number;        // 置信度
  analysis_time: string;          // 分析时间
}
```

## 5. 错误处理机制

### 5.1 前端错误处理
- **网络错误**：显示网络连接失败提示
- **API错误**：显示具体的错误信息
- **文件格式错误**：在上传时进行验证
- **超时错误**：设置合理的超时时间

### 5.2 后端错误处理
- **DIFY API错误**：捕获并转换为用户友好的错误信息
- **参数验证错误**：验证请求参数的完整性
- **环境变量错误**：检查必要的配置是否存在

## 6. 环境配置

需要在 `.env.local` 文件中配置以下环境变量：

```env
DIFY_API_ENDPOINT=https://api.dify.ai/v1/workflows/run
DIFY_API_KEY=your-dify-api-key
```

## 7. 性能优化

### 7.1 图片处理优化
- **文件大小限制**：限制上传图片的最大尺寸
- **格式转换**：统一转换为JPEG格式以减小文件大小
- **压缩处理**：在转换为base64前进行适当压缩

### 7.2 用户体验优化
- **进度显示**：通过AnalysisProgress组件显示分析进度
- **错误重试**：提供重试机制
- **加载状态**：清晰的加载状态指示

## 8. 安全考虑

- **API密钥保护**：API密钥仅在服务端使用，不暴露给前端
- **输入验证**：严格验证上传的图片格式和大小
- **错误信息**：不向前端暴露敏感的系统错误信息
- **速率限制**：可以考虑添加API调用频率限制

## 9. 测试方法

### 9.1 功能测试
1. 访问测试页面：`http://localhost:3000/test-api`
2. 上传测试图片
3. 检查API调用是否成功
4. 验证返回数据格式

### 9.2 API测试
```bash
# 使用curl测试API
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"photo":"base64-encoded-image","lang":"en"}'
```

## 10. 故障排查

常见问题及解决方案：

1. **API调用失败**：检查环境变量配置
2. **图片上传失败**：检查文件格式和大小
3. **分析结果异常**：检查DIFY API返回的数据格式
4. **页面加载缓慢**：检查图片大小和网络连接

---

*最后更新时间：2025年1月*