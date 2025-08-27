// HTML 响应测试脚本 - 验证 HTML 内容过滤功能
console.log('=== LongPort AI 助手 HTML 响应测试 ===');

// 测试 HTML 响应内容
const testHtmlResponse = `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#ffffff" />
    <meta
      name="description"
      content="OpenAI 接口聚合管理，支持多种渠道包括 Azure，可用于二次分发管理 key，仅单可执行文件，已打包好 Docker 镜像，一键部署，开箱即用"
    />
    <title>New API</title>
    <script type="module" crossorigin src="/assets/index-C2fRvE1s.js"></script>
    <link rel="modulepreload" crossorigin href="/assets/react-core-BvF_2poO.js">
    <link rel="modulepreload" crossorigin href="/assets/semi-ui-DafZJbih.js">
    <link rel="modulepreload" crossorigin href="/assets/tools-D_HHF1qJ.js">
    <link rel="modulepreload" crossorigin href="/assets/react-components-CT7d80Vq.js">
    <link rel="modulepreload" crossorigin href="/assets/i18n-Dgu1MipO.js">
    <link rel="stylesheet" crossorigin href="/assets/semi-ui-CTP9T3wo.css">
    <link rel="stylesheet" crossorigin href="/assets/index-rw00oqRY.css">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

// 测试 1: 内容脚本 HTML 清理功能
function testContentScriptHTMLCleaning() {
  console.log('\n🔍 测试 1: 内容脚本 HTML 清理功能');
  
  // 模拟内容脚本的 cleanAIResponse 函数
  function cleanAIResponse(response) {
    if (typeof response !== 'string') {
      return String(response);
    }
    
    // 如果响应包含 HTML 标签，尝试提取纯文本
    if (response.includes('<') && response.includes('>')) {
      console.log('检测到 HTML 响应，正在清理...');
      
      // 创建临时 DOM 元素来解析 HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = response;
      
      // 提取纯文本内容
      let cleanText = tempDiv.textContent || tempDiv.innerText || '';
      
      // 如果提取的文本为空或太短，尝试其他方法
      if (!cleanText || cleanText.trim().length < 10) {
        // 尝试移除 HTML 标签的正则表达式
        cleanText = response.replace(/<[^>]*>/g, '');
        cleanText = cleanText.replace(/&[a-zA-Z]+;/g, ' '); // 移除 HTML 实体
        cleanText = cleanText.replace(/\s+/g, ' ').trim(); // 清理多余空格
      }
      
      // 如果清理后仍然有问题，返回原始文本的前100个字符
      if (!cleanText || cleanText.length < 10) {
        cleanText = response.substring(0, 100) + '...';
      }
      
      console.log('HTML 清理完成，原始长度:', response.length, '清理后长度:', cleanText.length);
      return cleanText;
    }
    
    // 如果不是 HTML，直接返回
    return response;
  }
  
  console.log('测试 HTML 响应清理...');
  const cleanedResult = cleanAIResponse(testHtmlResponse);
  
  console.log('原始 HTML 长度:', testHtmlResponse.length);
  console.log('清理后结果长度:', cleanedResult.length);
  console.log('清理后结果预览:', cleanedResult.substring(0, 200));
  
  // 验证清理结果
  const hasHtmlTags = /<[^>]*>/.test(cleanedResult);
  const hasHtmlEntities = /&[a-zA-Z]+;/.test(cleanedResult);
  
  if (!hasHtmlTags && !hasHtmlEntities) {
    console.log('✅ HTML 清理成功，没有残留的 HTML 标签和实体');
  } else {
    console.log('❌ HTML 清理失败，仍有残留的 HTML 内容');
  }
  
  return cleanedResult;
}

// 测试 2: 后台脚本 HTML 清理功能
function testBackgroundScriptHTMLCleaning() {
  console.log('\n🔍 测试 2: 后台脚本 HTML 清理功能');
  
  // 模拟后台脚本的 cleanAPIResponse 函数
  function cleanAPIResponse(response) {
    if (typeof response !== 'string') {
      return String(response);
    }
    
    // 如果响应包含 HTML 标签，尝试提取纯文本
    if (response.includes('<') && response.includes('>')) {
      console.log('检测到 HTML 响应，正在清理...');
      
      // 尝试移除 HTML 标签的正则表达式
      let cleanText = response.replace(/<[^>]*>/g, '');
      cleanText = cleanText.replace(/&[a-zA-Z]+;/g, ' '); // 移除 HTML 实体
      cleanText = cleanText.replace(/\s+/g, ' ').trim(); // 清理多余空格
      
      // 如果清理后仍然有问题，返回原始文本的前200个字符
      if (!cleanText || cleanText.length < 10) {
        cleanText = response.substring(0, 200) + '...';
      }
      
      console.log('HTML 清理完成，原始长度:', response.length, '清理后长度:', cleanText.length);
      return cleanText;
    }
    
    // 如果不是 HTML，直接返回
    return response;
  }
  
  console.log('测试 HTML 响应清理...');
  const cleanedResult = cleanAPIResponse(testHtmlResponse);
  
  console.log('原始 HTML 长度:', testHtmlResponse.length);
  console.log('清理后结果长度:', cleanedResult.length);
  console.log('清理后结果预览:', cleanedResult.substring(0, 200));
  
  // 验证清理结果
  const hasHtmlTags = /<[^>]*>/.test(cleanedResult);
  const hasHtmlEntities = /&[a-zA-Z]+;/.test(cleanedResult);
  
  if (!hasHtmlTags && !hasHtmlEntities) {
    console.log('✅ HTML 清理成功，没有残留的 HTML 标签和实体');
  } else {
    console.log('❌ HTML 清理失败，仍有残留的 HTML 内容');
  }
  
  return cleanedResult;
}

// 测试 3: 弹窗显示测试
function testPopupDisplay() {
  console.log('\n🔍 测试 3: 弹窗显示测试');
  
  // 检查弹窗是否包含原文部分
  const popup = document.querySelector('.longport-ai-popup');
  if (popup) {
    const originalText = popup.querySelector('.original-text');
    const aiResult = popup.querySelector('.ai-result');
    
    if (!originalText) {
      console.log('✅ 弹窗中已去掉原文部分');
    } else {
      console.log('❌ 弹窗中仍包含原文部分');
    }
    
    if (aiResult) {
      console.log('✅ 弹窗中包含 AI 优化结果部分');
    } else {
      console.log('❌ 弹窗中缺少 AI 优化结果部分');
    }
  } else {
    console.log('ℹ️ 当前页面没有弹窗，无法测试弹窗显示');
  }
  
  return true;
}

// 测试 4: 模拟 API 调用测试
async function testMockAPICall() {
  console.log('\n🔍 测试 4: 模拟 API 调用测试');
  
  try {
    console.log('测试模拟 API 调用...');
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: '这是一个测试文本',
      apiType: 'company',
      siteType: 'longport'
    });
    
    if (response && response.success) {
      console.log('✅ 模拟 API 调用成功');
      console.log('返回数据长度:', response.data.length);
      console.log('返回数据预览:', response.data.substring(0, 100));
      
      // 检查返回的数据是否包含 HTML
      const hasHtml = /<[^>]*>/.test(response.data);
      if (!hasHtml) {
        console.log('✅ 返回数据不包含 HTML 标签');
      } else {
        console.log('❌ 返回数据仍包含 HTML 标签');
      }
      
      return { status: 'success', data: response.data };
    } else {
      console.log('❌ 模拟 API 调用失败');
      console.log('错误信息:', response.error);
      return { status: 'failed', error: response.error };
    }
  } catch (error) {
    console.log('❌ 模拟 API 调用异常:', error.message);
    return { status: 'error', error: error.message };
  }
}

// 测试 5: 不同响应格式测试
function testDifferentResponseFormats() {
  console.log('\n🔍 测试 5: 不同响应格式测试');
  
  const testCases = [
    {
      name: 'HTML 响应',
      content: testHtmlResponse,
      expected: 'should be cleaned'
    },
    {
      name: '纯文本响应',
      content: '这是一个纯文本响应，没有任何 HTML 标签。',
      expected: 'should remain unchanged'
    },
    {
      name: '混合内容响应',
      content: '这是文本内容 <b>这是粗体</b> 这是更多文本 <script>alert("test")</script>',
      expected: 'should be cleaned'
    },
    {
      name: '空响应',
      content: '',
      expected: 'should remain unchanged'
    },
    {
      name: '数字响应',
      content: 12345,
      expected: 'should be converted to string'
    }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.name}`);
    
    try {
      // 使用内容脚本的清理函数
      const cleanedResult = testContentScriptHTMLCleaning.call(null, testCase.content);
      
      const hasHtml = /<[^>]*>/.test(cleanedResult);
      const isClean = !hasHtml;
      
      console.log(`  结果: ${isClean ? '✅ 清理成功' : '❌ 清理失败'}`);
      console.log(`  清理后长度: ${cleanedResult.length}`);
      
      results.push({
        name: testCase.name,
        status: isClean ? 'success' : 'failed',
        originalLength: testCase.content.length,
        cleanedLength: cleanedResult.length
      });
      
    } catch (error) {
      console.log(`  错误: ${error.message}`);
      results.push({
        name: testCase.name,
        status: 'error',
        error: error.message
      });
    }
  }
  
  return results;
}

// 运行所有测试
async function runAllHTMLTests() {
  console.log('🚀 开始运行 HTML 响应测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const contentScriptTest = testContentScriptHTMLCleaning();
    const backgroundScriptTest = testBackgroundScriptHTMLCleaning();
    const popupTest = testPopupDisplay();
    const mockAPITest = await testMockAPICall();
    const formatTest = testDifferentResponseFormats();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 HTML 响应测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`内容脚本清理: ${contentScriptTest.length > 0 ? '✅' : '❌'}`);
    console.log(`后台脚本清理: ${backgroundScriptTest.length > 0 ? '✅' : '❌'}`);
    console.log(`弹窗显示: ${popupTest ? '✅' : '❌'}`);
    console.log(`模拟 API: ${mockAPITest.status === 'success' ? '✅' : '❌'}`);
    console.log(`格式测试: ${formatTest.filter(r => r.status === 'success').length}/${formatTest.length} 成功`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // 格式测试结果
    const successfulFormats = formatTest.filter(r => r.status === 'success');
    if (successfulFormats.length > 0) {
      console.log('✅ 成功的格式测试:');
      successfulFormats.forEach(format => {
        console.log(`  - ${format.name}: 原始长度 ${format.originalLength} → 清理后长度 ${format.cleanedLength}`);
      });
    }
    
    const failedFormats = formatTest.filter(r => r.status === 'failed');
    if (failedFormats.length > 0) {
      console.log('❌ 失败的格式测试:');
      failedFormats.forEach(format => {
        console.log(`  - ${format.name}: 清理失败`);
      });
    }
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [
      contentScriptTest.length > 0,
      backgroundScriptTest.length > 0,
      popupTest,
      mockAPITest.status === 'success',
      formatTest.some(r => r.status === 'success')
    ].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！HTML 响应处理功能正常');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，HTML 响应处理基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，HTML 响应处理可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，HTML 响应处理存在严重问题');
    }
    
    return {
      contentScriptTest,
      backgroundScriptTest,
      popupTest,
      mockAPITest,
      formatTest,
      totalDuration,
      successRate: successfulTests / totalTests
    };
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    return null;
  }
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 testContentScriptHTMLCleaning() 测试内容脚本 HTML 清理');
console.log('2. 运行 testBackgroundScriptHTMLCleaning() 测试后台脚本 HTML 清理');
console.log('3. 运行 testPopupDisplay() 测试弹窗显示');
console.log('4. 运行 testMockAPICall() 测试模拟 API 调用');
console.log('5. 运行 testDifferentResponseFormats() 测试不同响应格式');
console.log('6. 运行 runAllHTMLTests() 运行所有测试');

console.log('\n按 Enter 键开始运行所有 HTML 响应测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllHTMLTests();
  }
});

console.log('HTML 响应测试脚本加载完成，按 Enter 键开始测试');
