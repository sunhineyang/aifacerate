import { NextResponse } from 'next/server';

// 测试配置端点 - 用于诊断 Vercel 部署问题
export async function GET() {
  try {
    const config = {
      // 环境信息
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      
      // DIFY API 配置检查（不暴露敏感信息）
      difyApiUrl: process.env.DIFY_API_URL ? {
        configured: true,
        length: process.env.DIFY_API_URL.length,
        preview: process.env.DIFY_API_URL.substring(0, 20) + '...'
      } : {
        configured: false
      },
      
      difyApiToken: process.env.DIFY_API_TOKEN ? {
        configured: true,
        length: process.env.DIFY_API_TOKEN.length,
        preview: process.env.DIFY_API_TOKEN.substring(0, 10) + '...'
      } : {
        configured: false
      },
      
      // 其他配置
      useMockData: process.env.USE_MOCK_DATA,
      difyApiTimeout: process.env.DIFY_API_TIMEOUT,
      
      // 时间戳
      timestamp: new Date().toISOString(),
      
      // 基本连通性测试
      status: 'API endpoint is working'
    };
    
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('配置检查错误:', error);
    
    return NextResponse.json({
      error: 'Configuration check failed',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

// 支持 OPTIONS 请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}