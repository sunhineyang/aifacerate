import { NextRequest, NextResponse } from 'next/server';

// 定义请求数据的类型
interface AnalyzeRequest {
  photo: string;  // base64编码的图片数据
  lang: string;   // 语言代码，如 'en' 或 'zh'
}

// 定义DIFY API返回的数据类型（基于workflows/run接口）
interface DifyWorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string; // running / succeeded / failed / stopped
    outputs?: {
      analyzable?: boolean;        // 是否可以分析
      score?: number;            // 评分 (0-100)
      predicted_age?: number;    // 预测年龄
      golden_quote?: string;     // 金句评语
      celebrity_lookalike?: {    // 明星相似度
        name: string;
        country: string;
      };
      message?: string;          // 错误信息（当 analyzable 为 false 时）
    };
    error?: string;
    elapsed_time?: number;
    total_tokens?: number;
    total_steps?: number;
    created_at: number;
    finished_at?: number;
  };
}

// 定义返回给前端的数据类型
interface AnalysisResult {
  score: number;
  stars: number;
  age: number;
  celebrity: {
    name: string;
    country: string;
  };
  comment: string;
  features: {
    eyes: string;
    nose: string;
    smile: string;
    face: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求数据
    const { photo, lang }: AnalyzeRequest = await request.json();
    
    // 验证必要参数
    if (!photo || !lang) {
      return NextResponse.json(
        { error: '缺少必要参数：photo 和 lang' },
        { status: 400 }
      );
    }
    
    // 移除模拟数据模式 - 只使用真实的DIFY数据
    
    // 检查环境变量
    const difyApiUrl = process.env.DIFY_API_URL;
    const difyApiToken = process.env.DIFY_API_TOKEN;
    
    if (!difyApiUrl || !difyApiToken) {
      return NextResponse.json(
        { error: 'API 配置错误，请联系管理员' },
        { status: 500 }
      );
    }
    
    // 将base64转换为Blob
    const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });
    
    // 创建FormData用于文件上传
    const formData = new FormData();
    formData.append('file', blob, 'photo.jpg');
    formData.append('user', `user-${Date.now()}`);
    
    // 上传文件
    const uploadResponse = await fetch(`${difyApiUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiToken}`
      },
      body: formData,
      signal: AbortSignal.timeout(30000)
    });
    
    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: 'AI 分析服务暂时不可用，请稍后重试' },
        { status: 503 }
      );
    }
    
    const uploadResult = await uploadResponse.json();
    
    // 调用工作流
    const difyResponse = await fetch(`${difyApiUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          photo: {
            transfer_method: 'local_file',
            upload_file_id: uploadResult.id,
            type: 'image'
          },
          lang: lang
        },
        response_mode: 'blocking',
        user: `user-${Date.now()}`
      }),
      signal: AbortSignal.timeout(30000)
    });
    
    if (!difyResponse.ok) {
      return NextResponse.json(
        { error: 'AI 分析服务暂时不可用，请稍后重试' },
        { status: 503 }
      );
    }
    
    const result: DifyWorkflowResponse = await difyResponse.json();
    
    // 详细记录DIFY返回的原始数据
    console.log('🔍 DIFY API 原始返回数据:', {
      timestamp: new Date().toISOString(),
      workflow_run_id: result.workflow_run_id,
      task_id: result.task_id,
      status: result.data?.status,
      outputs: result.data?.outputs,
      error: result.data?.error,
      elapsed_time: result.data?.elapsed_time,
      total_tokens: result.data?.total_tokens
    });
    
    // 检查工作流执行状态
    if (result.data.status !== 'succeeded') {
      console.log('❌ 工作流执行失败:', {
        status: result.data.status,
        error: result.data.error
      });
      return NextResponse.json(
        { error: '分析失败，请重试' },
        { status: 500 }
      );
    }
    
    // 获取输出数据
    const outputs = result.data.outputs;
    if (!outputs) {
      console.log('❌ 输出数据为空');
      return NextResponse.json(
        { error: '分析结果为空，请重试' },
        { status: 500 }
      );
    }
    
    console.log('📊 DIFY 输出数据详情:', outputs);
    
    // 检查是否有有效的分析数据
    if (!outputs || typeof outputs !== 'object') {
      console.log('❌ DIFY返回数据格式异常:', outputs);
      return NextResponse.json(
        { error: '分析数据格式异常，请重试' },
        { status: 500 }
      );
    }

    // 检查分析结果 - 修复数据结构访问
    // DIFY返回的数据结构可能是 {res: {实际数据}} 或直接是数据
    let analysisData = outputs;
    
    // 如果数据被包装在res字段中，则提取出来
    if (outputs.res && typeof outputs.res === 'object') {
      analysisData = outputs.res;
      console.log('📦 检测到嵌套数据结构，提取res字段:', analysisData);
    }
    
    if (analysisData.analyzable === false) {
      console.log('❌ DIFY无法识别人脸:', analysisData.message);
      return NextResponse.json(
        { error: analysisData.message || '无法分析此图片，请尝试其他图片' },
        { status: 400 }
      );
    }

    // 严格验证DIFY返回的数据 - 只有当可以分析时才检查数据完整性
    const resData = analysisData;
    
    // 检查必需的数据字段是否存在
    if (typeof resData.score !== 'number') {
      console.log('❌ 缺少评分数据:', resData);
      return NextResponse.json(
        { error: 'AI分析数据不完整：缺少评分' },
        { status: 500 }
      );
    }

    if (typeof resData.predicted_age !== 'number') {
      console.log('❌ 缺少年龄数据:', resData);
      return NextResponse.json(
        { error: 'AI分析数据不完整：缺少年龄预测' },
        { status: 500 }
      );
    }

    if (!resData.celebrity_lookalike?.name) {
      console.log('❌ 缺少明星相似度数据:', resData);
      return NextResponse.json(
        { error: 'AI分析数据不完整：缺少明星相似度分析' },
        { status: 500 }
      );
    }

    if (!resData.golden_quote) {
      console.log('❌ 缺少评价数据:', resData);
      return NextResponse.json(
        { error: 'AI分析数据不完整：缺少个性化评价' },
        { status: 500 }
      );
    }
    
    // 只有所有数据都完整时才返回结果
    const transformedResult: AnalysisResult = {
      score: resData.score,
      stars: Math.round(resData.score / 20),
      age: resData.predicted_age,
      celebrity: {
        name: resData.celebrity_lookalike.name,
        country: resData.celebrity_lookalike.country || 'Unknown'
      },
      comment: resData.golden_quote,
      features: {
        eyes: lang === 'zh' ? '深邃有神' : 'Deep and expressive',
        nose: lang === 'zh' ? '轮廓分明' : 'Well-defined',
        smile: lang === 'zh' ? '温暖迷人' : 'Warm and charming',
        face: lang === 'zh' ? '比例协调' : 'Well-proportioned'
      }
    };
    
    console.log('✅ 成功转换DIFY数据:', transformedResult);
    
    return NextResponse.json(transformedResult);
    
  } catch (error) {
    console.error('API 处理错误:', error);
    
    return NextResponse.json(
      { error: '分析服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}