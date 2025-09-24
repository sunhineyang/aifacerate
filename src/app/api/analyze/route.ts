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
    
    // 检查是否启用模拟数据模式
    const useMockData = process.env.USE_MOCK_DATA === 'true';
    
    if (useMockData) {
      console.log('使用模拟数据模式...', {
        timestamp: new Date().toISOString(),
        lang,
        photoSize: photo.length
      });
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回模拟数据
      const mockResult: AnalysisResult = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100分
        stars: Math.floor(Math.random() * 2) + 4, // 4-5星
        age: Math.floor(Math.random() * 20) + 20, // 20-40岁
        celebrity: {
          name: lang === 'zh' ? '刘亦菲' : 'Emma Stone',
          country: lang === 'zh' ? '中国' : 'USA'
        },
        comment: lang === 'zh' ? '您拥有迷人的笑容和优雅的气质！' : 'You have a charming smile and elegant temperament!',
        features: {
          eyes: lang === 'zh' ? '深邃有神' : 'Deep and expressive',
          nose: lang === 'zh' ? '轮廓分明' : 'Well-defined',
          smile: lang === 'zh' ? '温暖迷人' : 'Warm and charming',
          face: lang === 'zh' ? '比例协调' : 'Well-proportioned'
        }
      };
      
      return NextResponse.json(mockResult);
    }
    
    // 检查环境变量
    const difyApiUrl = process.env.DIFY_API_URL;
    const difyApiToken = process.env.DIFY_API_TOKEN;
    
    if (!difyApiUrl || !difyApiToken) {
      console.error('DIFY API 配置缺失:', { 
        difyApiUrl: !!difyApiUrl, 
        difyApiToken: !!difyApiToken,
        actualUrl: difyApiUrl,
        actualToken: difyApiToken ? `${difyApiToken.substring(0, 10)}...` : 'undefined'
      });
      return NextResponse.json(
        { error: 'API 配置错误，请联系管理员。提示：可以在.env文件中设置 USE_MOCK_DATA=true 来使用模拟数据测试' },
        { status: 500 }
      );
    }
    
    console.log('开始调用 DIFY API...', {
      timestamp: new Date().toISOString(),
      lang,
      photoSize: photo.length
    });
    
    // 第一步：上传文件到DIFY获取upload_file_id
    console.log('步骤1: 上传文件到DIFY...');
    
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
      console.error('文件上传失败:', uploadResponse.status, uploadResponse.statusText);
      const errorText = await uploadResponse.text();
      console.error('上传错误详情:', errorText);
      return NextResponse.json(
        { error: 'AI 分析服务暂时不可用，请稍后重试' },
        { status: 503 }
      );
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('文件上传成功:', uploadResult);
    
    // 第二步：使用upload_file_id调用工作流
    console.log('步骤2: 调用工作流...');
    
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
      console.error('DIFY API 调用失败:', difyResponse.status, difyResponse.statusText);
      return NextResponse.json(
        { error: 'AI 分析服务暂时不可用，请稍后重试' },
        { status: 503 }
      );
    }
    
    const result: DifyWorkflowResponse = await difyResponse.json();
    
    console.log('DIFY API 调用成功:', {
      timestamp: new Date().toISOString(),
      status: result.data.status,
      workflow_run_id: result.workflow_run_id
    });
    
    // 检查工作流执行状态
    if (result.data.status === 'failed') {
      return NextResponse.json(
        { error: result.data.error || '分析失败，请重试' },
        { status: 500 }
      );
    }
    
    if (result.data.status !== 'succeeded') {
      return NextResponse.json(
        { error: '分析未完成，请重试' },
        { status: 500 }
      );
    }
    
    // 获取输出数据
    const outputs = result.data.outputs;
    if (!outputs) {
      return NextResponse.json(
        { error: '分析结果为空，请重试' },
        { status: 500 }
      );
    }
    
    // DIFY返回的数据在outputs.res中
    const analysisResult = outputs.res || outputs;
    
    // 检查分析结果 - analyzable为false是正常结果，需要显示给用户
    if (analysisResult.analyzable === false) {
      return NextResponse.json(
        { 
          analyzable: false,
          message: analysisResult.message || '无法分析此图片，请尝试上传其他照片'
        },
        { status: 200 }
      );
    }
    
    // 转换为前端期望的格式
    const transformedResult: AnalysisResult = {
      score: analysisResult.score || 0,
      stars: Math.round((analysisResult.score || 0) / 20), // 转换为5星制
      age: analysisResult.predicted_age || 25,
      celebrity: analysisResult.celebrity_lookalike || {
        name: 'Unknown Celebrity',
        country: 'Unknown'
      },
      comment: analysisResult.golden_quote || '您拥有独特的魅力！',
      features: {
        eyes: '深邃有神',
        nose: '轮廓分明',
        smile: '温暖迷人',
        face: '比例协调'
      }
    };
    
    return NextResponse.json(transformedResult);
    
  } catch (error) {
    console.error('API 处理错误:', error);
    
    // 处理超时错误
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: '分析超时，请稍后重试' },
        { status: 408 }
      );
    }
    
    // 处理其他错误
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