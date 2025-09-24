// 测试API端点的脚本
// Node.js 18+ 已经内置了 fetch

async function testAPI() {
  try {
    console.log('开始测试 /api/analyze 端点...');
    
    // 创建一个简单的测试图片数据（1x1像素的透明PNG）
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const response = await fetch('http://localhost:3001/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photo: testImageBase64,
        lang: 'zh'
      })
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('响应内容:', responseText);
    
    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('解析后的JSON:', JSON.stringify(jsonData, null, 2));
      } catch (parseError) {
        console.error('JSON解析失败:', parseError.message);
      }
    } else {
      console.error('API请求失败，状态码:', response.status);
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testAPI();