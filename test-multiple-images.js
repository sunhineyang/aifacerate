const fs = require('fs');
const path = require('path');

// 测试配置
const API_BASE_URL = 'http://localhost:3001';
const IMAGES_DIR = './public/imgs/users';

console.log('🔍 开始批量测试人脸分析API...');
console.log('📍 API地址:', `${API_BASE_URL}/api/analyze`);
console.log('📁 图片目录:', IMAGES_DIR);

// 获取所有图片文件
function getImageFiles() {
  try {
    const files = fs.readdirSync(IMAGES_DIR);
    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg'].includes(ext);
    }).slice(0, 3); // 只测试前3张图片
  } catch (error) {
    console.error('❌ 读取图片目录失败:', error.message);
    return [];
  }
}

// 测试单张图片
async function testSingleImage(filename) {
  console.log(`\n🖼️  测试图片: ${filename}`);
  console.log('=' .repeat(50));
  
  try {
    // 动态导入 node-fetch
    const { default: fetch } = await import('node-fetch');
    
    const imagePath = path.join(IMAGES_DIR, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(imagePath)) {
      console.log('❌ 图片文件不存在');
      return null;
    }
    
    // 读取图片并转换为Base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:image/${path.extname(filename).slice(1)};base64,${base64Image}`;
    
    console.log('📊 图片信息:');
    console.log(`  - 文件大小: ${imageBuffer.length} bytes`);
    console.log(`  - Base64长度: ${base64Image.length} characters`);
    console.log(`  - 文件扩展名: ${path.extname(filename)}`);
    
    // 构建请求数据
    const requestData = {
      photo: dataUrl,
      lang: 'zh'
    };
    
    console.log('📤 发送API请求...');
    const startTime = Date.now();
    
    // 发送请求
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('📡 响应信息:');
    console.log(`  - 状态码: ${response.status}`);
    console.log(`  - 状态文本: ${response.statusText}`);
    console.log(`  - 响应时间: ${duration}ms`);
    console.log(`  - Content-Type: ${response.headers.get('content-type')}`);
    
    // 获取响应内容
    const responseText = await response.text();
    console.log(`  - 响应长度: ${responseText.length} characters`);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ 解析成功!');
        console.log('📋 返回数据:');
        console.log(JSON.stringify(result, null, 2));
        
        // 分析返回数据
        console.log('🔍 数据分析:');
        console.log(`  - Score: ${result.score} (${typeof result.score})`);
        console.log(`  - Stars: ${result.stars} (${typeof result.stars})`);
        console.log(`  - Age: ${result.age} (${typeof result.age})`);
        console.log(`  - Celebrity: ${result.celebrity?.name || 'N/A'}`);
        console.log(`  - Comment: ${result.comment || 'N/A'}`);
        console.log(`  - Features: ${Object.keys(result.features || {}).length} items`);
        
        return {
          filename,
          success: true,
          duration,
          result
        };
      } catch (parseError) {
        console.log('❌ JSON解析失败:', parseError.message);
        console.log('📄 原始响应:', responseText);
        return {
          filename,
          success: false,
          error: 'JSON解析失败',
          rawResponse: responseText
        };
      }
    } else {
      console.log('❌ API请求失败');
      console.log('📄 错误响应:', responseText);
      return {
        filename,
        success: false,
        error: `HTTP ${response.status}`,
        rawResponse: responseText
      };
    }
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    return {
      filename,
      success: false,
      error: error.message
    };
  }
}

// 主测试函数
async function runTests() {
  const imageFiles = getImageFiles();
  
  if (imageFiles.length === 0) {
    console.log('❌ 没有找到可测试的图片文件');
    return;
  }
  
  console.log(`📋 找到 ${imageFiles.length} 张图片:`, imageFiles.join(', '));
  
  const results = [];
  
  for (const filename of imageFiles) {
    const result = await testSingleImage(filename);
    if (result) {
      results.push(result);
    }
    
    // 每次测试之间稍作延迟
    if (imageFiles.indexOf(filename) < imageFiles.length - 1) {
      console.log('⏳ 等待3秒后继续下一张图片...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // 汇总结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试汇总报告');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`✅ 成功: ${successCount} 张`);
  console.log(`❌ 失败: ${failCount} 张`);
  console.log(`📈 成功率: ${((successCount / results.length) * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    const avgDuration = results
      .filter(r => r.success && r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / successCount;
    console.log(`⏱️  平均响应时间: ${avgDuration.toFixed(0)}ms`);
  }
  
  console.log('\n📋 详细结果:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.filename}:`, 
      result.success ? '✅ 成功' : `❌ 失败 (${result.error})`);
  });
  
  console.log('\n🏁 批量测试完成!');
  
  // 如果有成功的结果，显示数据对比
  const successResults = results.filter(r => r.success);
  if (successResults.length > 0) {
    console.log('\n🔍 成功结果数据对比:');
    successResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.filename}:`);
      console.log(`   Score: ${result.result.score}`);
      console.log(`   Stars: ${result.result.stars}`);
      console.log(`   Age: ${result.result.age}`);
      console.log(`   Celebrity: ${result.result.celebrity?.name}`);
    });
  }
}

// 运行测试
runTests().catch(error => {
  console.error('💥 测试过程中发生错误:', error);
  process.exit(1);
});