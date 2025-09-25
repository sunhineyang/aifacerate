// 人脸分析API测试脚本
// 这个脚本用来测试真实的图片上传和分析功能

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { default: fetch } = require('node-fetch');

// 测试配置
const API_BASE_URL = 'http://localhost:3001';
const TEST_IMAGE_PATH = './public/imgs/users/5.png'; // 换一张可能有人脸的图片 // 使用现有的用户头像图片

console.log('🔍 开始测试人脸分析API...');
console.log('📍 API地址:', `${API_BASE_URL}/api/analyze`);
console.log('🖼️  测试图片:', TEST_IMAGE_PATH);

// 检查测试图片是否存在
if (!fs.existsSync(TEST_IMAGE_PATH)) {
  console.error('❌ 错误: 测试图片不存在');
  console.log('请在以下位置放置一张测试图片:');
  console.log(`- ${TEST_IMAGE_PATH}`);
  console.log('或者修改 TEST_IMAGE_PATH 变量指向你的测试图片');
  process.exit(1);
}

// 测试函数
async function testAnalyzeAPI() {
  try {
    console.log('\n🚀 开始上传图片并调用分析API...');
    
    // 读取图片并转换为base64
    const imageBuffer = fs.readFileSync(TEST_IMAGE_PATH);
    const fileName = path.basename(TEST_IMAGE_PATH);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    console.log('📤 正在发送请求...');
    console.log('📊 图片大小:', imageBuffer.length, 'bytes');
    console.log('📝 文件名:', fileName);
    console.log('📋 Base64长度:', base64Image.length, 'characters');
    
    // 准备JSON数据
    const requestData = {
      photo: base64Image,
      lang: 'zh'  // 使用中文
    };
    
    // 发送请求
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('\n📡 API响应信息:');
    console.log('- 状态码:', response.status);
    console.log('- 状态文本:', response.statusText);
    console.log('- Content-Type:', response.headers.get('content-type'));
    
    // 获取响应内容
    const responseText = await response.text();
    console.log('\n📄 原始响应内容:');
    console.log('响应长度:', responseText.length, 'characters');
    console.log('原始内容:', responseText);
    
    // 尝试解析JSON
    try {
      const jsonData = JSON.parse(responseText);
      console.log('\n✅ JSON解析成功!');
      console.log('📋 解析后的数据结构:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      // 详细分析返回的数据
      console.log('\n🔍 数据详细分析:');
      if (jsonData.success !== undefined) {
        console.log('- success字段:', jsonData.success);
      }
      if (jsonData.data) {
        console.log('- data字段存在');
        console.log('- data类型:', typeof jsonData.data);
        console.log('- data内容:', jsonData.data);
        
        // 检查具体字段
        if (typeof jsonData.data === 'object') {
          const dataKeys = Object.keys(jsonData.data);
          console.log('- data字段包含的键:', dataKeys);
          
          dataKeys.forEach(key => {
            console.log(`  - ${key}:`, jsonData.data[key], `(类型: ${typeof jsonData.data[key]})`);
          });
        }
      }
      if (jsonData.error) {
        console.log('- error字段:', jsonData.error);
      }
      
    } catch (parseError) {
      console.log('\n❌ JSON解析失败:');
      console.log('解析错误:', parseError.message);
      console.log('这可能意味着API返回的不是JSON格式');
      
      // 检查是否是HTML错误页面
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
        console.log('⚠️  响应看起来是HTML页面，可能是错误页面');
      }
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 可能的原因:');
      console.log('- 开发服务器未启动 (请运行 pnpm dev)');
      console.log('- 端口3000被占用');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 可能的原因:');
      console.log('- API地址错误');
      console.log('- 网络连接问题');
    }
  }
}

// 运行测试
console.log('⏰ 开始测试...');
testAnalyzeAPI().then(() => {
  console.log('\n🏁 测试完成!');
}).catch((error) => {
  console.error('\n💥 测试过程中发生错误:', error);
});