// DIFY API 连接测试脚本
// 这个脚本用来检查DIFY API是否可以正常访问

const https = require('https');
const http = require('http');

// 从环境变量读取配置
require('dotenv').config();

const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_API_TOKEN = process.env.DIFY_API_TOKEN;

console.log('🔍 开始测试DIFY API连接...');
console.log('📍 API地址:', DIFY_API_URL);
console.log('🔑 Token前缀:', DIFY_API_TOKEN ? DIFY_API_TOKEN.substring(0, 10) + '...' : '未设置');

if (!DIFY_API_URL || !DIFY_API_TOKEN) {
  console.error('❌ 错误: DIFY API配置缺失');
  console.log('请检查.env文件中的以下配置:');
  console.log('- DIFY_API_URL');
  console.log('- DIFY_API_TOKEN');
  process.exit(1);
}

// 测试数据 - 根据DIFY文档，使用简单的inputs测试连接
const testData = {
  inputs: {},  // 空的inputs用于测试基本连接
  response_mode: 'blocking',
  user: 'test-user'
};

// 发送测试请求
function testDifyAPI() {
  const url = new URL(`${DIFY_API_URL}/workflows/run`);
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 10000 // 10秒超时
  };

  const client = url.protocol === 'https:' ? https : http;
  
  console.log('🚀 发送测试请求...');
  
  const req = client.request(options, (res) => {
    console.log('📡 响应状态码:', res.statusCode);
    console.log('📋 响应头:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 响应内容:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ DIFY API连接成功!');
          if (jsonData.data && jsonData.data.status) {
            console.log('📊 工作流状态:', jsonData.data.status);
          }
        } else if (res.statusCode === 400) {
          console.log('⚠️  DIFY API返回400错误 - 这可能是正常的，说明API可以访问但参数有问题');
          console.log('🔍 错误详情:', jsonData.message || '未知错误');
          console.log('✅ 重要：API连接本身是成功的！');
        } else {
          console.log('❌ DIFY API返回错误状态码:', res.statusCode);
        }
      } catch (e) {
        console.log('原始响应:', data);
        console.log('❌ 响应不是有效的JSON格式');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ 请求失败:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 可能的原因:');
      console.log('- 网络连接问题');
      console.log('- DIFY API地址错误');
      console.log('- DNS解析失败');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 可能的原因:');
      console.log('- DIFY服务未启动');
      console.log('- 端口被阻止');
      console.log('- 防火墙设置');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 可能的原因:');
      console.log('- 网络超时');
      console.log('- 服务器响应慢');
    }
  });
  
  req.on('timeout', () => {
    console.error('❌ 请求超时');
    req.destroy();
  });
  
  // 发送请求数据
  req.write(postData);
  req.end();
}

// 开始测试
testDifyAPI();