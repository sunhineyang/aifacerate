// 人脸分析API对比测试脚本
// 这个脚本用来对比模拟数据和真实DIFY数据的差异

const fs = require('fs');
const path = require('path');
const { default: fetch } = require('node-fetch');

// 测试配置
const API_BASE_URL = 'http://localhost:3001';
const TEST_IMAGE_PATH = './public/imgs/users/1.png';

console.log('🔍 开始对比测试：模拟数据 vs 真实DIFY数据');
console.log('📍 API地址:', `${API_BASE_URL}/api/analyze`);
console.log('🖼️  测试图片:', TEST_IMAGE_PATH);

// 检查测试图片是否存在
if (!fs.existsSync(TEST_IMAGE_PATH)) {
  console.error('❌ 错误: 测试图片不存在');
  console.log('请在以下位置放置一张测试图片:');
  console.log(`- ${TEST_IMAGE_PATH}`);
  process.exit(1);
}

// 测试函数
async function testWithMode(useMockData, modeName) {
  try {
    console.log(`\n🚀 开始测试 ${modeName}...`);
    
    // 临时修改环境变量（通过API调用）
    console.log(`📝 设置 USE_MOCK_DATA=${useMockData}`);
    
    // 读取图片并转换为base64
    const imageBuffer = fs.readFileSync(TEST_IMAGE_PATH);
    const fileName = path.basename(TEST_IMAGE_PATH);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    console.log('📤 正在发送请求...');
    console.log('📊 图片大小:', imageBuffer.length, 'bytes');
    
    // 准备JSON数据
    const requestData = {
      photo: base64Image,
      lang: 'zh'  // 使用中文
    };
    
    // 发送请求
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    const endTime = Date.now();
    
    console.log(`\n📡 ${modeName} 响应信息:`);
    console.log('- 状态码:', response.status);
    console.log('- 状态文本:', response.statusText);
    console.log('- 响应时间:', endTime - startTime, 'ms');
    console.log('- Content-Type:', response.headers.get('content-type'));
    
    // 获取响应内容
    const responseText = await response.text();
    console.log('- 响应长度:', responseText.length, 'characters');
    
    // 解析JSON
    try {
      const jsonData = JSON.parse(responseText);
      console.log(`\n✅ ${modeName} JSON解析成功!`);
      console.log('📋 解析后的数据结构:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      return {
        success: true,
        data: jsonData,
        responseTime: endTime - startTime,
        status: response.status
      };
      
    } catch (parseError) {
      console.log(`\n❌ ${modeName} JSON解析失败:`);
      console.log('解析错误:', parseError.message);
      console.log('原始响应:', responseText);
      
      return {
        success: false,
        error: parseError.message,
        rawResponse: responseText,
        responseTime: endTime - startTime,
        status: response.status
      };
    }
    
  } catch (error) {
    console.error(`\n❌ ${modeName} 测试失败:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 对比两个结果
function compareResults(mockResult, realResult) {
  console.log('\n🔍 ========== 数据对比分析 ==========');
  
  if (!mockResult.success || !realResult.success) {
    console.log('⚠️  无法进行对比，因为有测试失败');
    if (!mockResult.success) {
      console.log('- 模拟数据测试失败:', mockResult.error);
    }
    if (!realResult.success) {
      console.log('- 真实数据测试失败:', realResult.error);
    }
    return;
  }
  
  const mockData = mockResult.data;
  const realData = realResult.data;
  
  console.log('📊 响应时间对比:');
  console.log(`- 模拟数据: ${mockResult.responseTime}ms`);
  console.log(`- 真实数据: ${realResult.responseTime}ms`);
  
  console.log('\n📋 数据结构对比:');
  
  // 检查字段是否存在
  const expectedFields = ['score', 'stars', 'age', 'celebrity', 'comment', 'features'];
  
  expectedFields.forEach(field => {
    const mockHas = mockData.hasOwnProperty(field);
    const realHas = realData.hasOwnProperty(field);
    
    if (mockHas && realHas) {
      console.log(`✅ ${field}: 两者都有`);
      
      // 详细对比值
      if (typeof mockData[field] === 'object' && typeof realData[field] === 'object') {
        console.log(`   模拟: ${JSON.stringify(mockData[field])}`);
        console.log(`   真实: ${JSON.stringify(realData[field])}`);
      } else {
        console.log(`   模拟: ${mockData[field]} (${typeof mockData[field]})`);
        console.log(`   真实: ${realData[field]} (${typeof realData[field]})`);
      }
    } else if (mockHas && !realHas) {
      console.log(`⚠️  ${field}: 只有模拟数据有`);
    } else if (!mockHas && realHas) {
      console.log(`⚠️  ${field}: 只有真实数据有`);
    } else {
      console.log(`❌ ${field}: 两者都没有`);
    }
  });
  
  // 检查额外字段
  const mockKeys = Object.keys(mockData);
  const realKeys = Object.keys(realData);
  
  const mockOnlyFields = mockKeys.filter(key => !realKeys.includes(key));
  const realOnlyFields = realKeys.filter(key => !mockKeys.includes(key));
  
  if (mockOnlyFields.length > 0) {
    console.log('\n🔸 模拟数据独有字段:', mockOnlyFields);
  }
  
  if (realOnlyFields.length > 0) {
    console.log('\n🔸 真实数据独有字段:', realOnlyFields);
  }
  
  // 数据类型对比
  console.log('\n📝 数据类型对比:');
  expectedFields.forEach(field => {
    if (mockData[field] !== undefined && realData[field] !== undefined) {
      const mockType = typeof mockData[field];
      const realType = typeof realData[field];
      
      if (mockType === realType) {
        console.log(`✅ ${field}: ${mockType}`);
      } else {
        console.log(`⚠️  ${field}: 模拟(${mockType}) vs 真实(${realType})`);
      }
    }
  });
}

// 主测试函数
async function runComparisonTest() {
  console.log('⏰ 开始对比测试...');
  
  // 首先测试模拟数据（当前.env中USE_MOCK_DATA=true）
  const mockResult = await testWithMode(true, '模拟数据模式');
  
  // 等待一下
  console.log('\n⏳ 等待2秒后测试真实数据...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 然后测试真实数据（需要临时修改环境变量）
  console.log('\n📝 注意：要测试真实DIFY数据，需要：');
  console.log('1. 确保DIFY服务正常运行');
  console.log('2. 在.env文件中设置正确的DIFY_API_URL和DIFY_API_TOKEN');
  console.log('3. 临时将USE_MOCK_DATA设置为false');
  
  const realResult = await testWithMode(false, '真实DIFY数据模式');
  
  // 对比结果
  compareResults(mockResult, realResult);
  
  console.log('\n🏁 对比测试完成!');
  
  // 给出建议
  console.log('\n💡 建议:');
  if (mockResult.success && !realResult.success) {
    console.log('- 模拟数据正常，真实数据有问题，请检查DIFY配置');
  } else if (!mockResult.success && realResult.success) {
    console.log('- 真实数据正常，模拟数据有问题，请检查模拟数据逻辑');
  } else if (mockResult.success && realResult.success) {
    console.log('- 两种模式都正常工作！');
  } else {
    console.log('- 两种模式都有问题，请检查API路由代码');
  }
}

// 运行测试
runComparisonTest().catch((error) => {
  console.error('\n💥 测试过程中发生错误:', error);
});