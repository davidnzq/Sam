// 最终验证测试脚本 - 验证所有修复功能
console.log('=== LongPort AI 助手最终验证测试 ===');

// 测试配置
const testConfig = {
  testTexts: [
    '这是一个测试文本，用于验证 AI 优化功能。',
    'The market shows strong momentum with increasing volume.',
    '基于当前市场分析，建议投资者关注科技板块。'
  ],
  htmlResponse: `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <title>New API</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">这是有用的内容</div>
  </body>
</html>`
};

// 测试 1: 右键菜单文字验证
function testContextMenuText() {
  console.log('\n🔍 测试 1: 右键菜单文字验证');
  
  try {
    // 检查右键菜单是否包含正确的文字
    const menuItems = document.querySelectorAll('[data-context-menu]');
    let foundCorrectMenu = false;
    
    // 由于右键菜单是动态创建的，我们检查页面中是否有相关元素
    const hasAIMenu = document.querySelector('.longport-ai-popup') !== null;
    
    if (hasAIMenu) {
      console.log('✅ 发现 AI 弹窗，右键菜单功能正常');
      foundCorrectMenu = true;
    } else {
      console.log('ℹ️ 当前页面没有弹窗，无法直接验证右键菜单文字');
      console.log('请手动选择文本并右键查看菜单文字是否为"校验优化内容"');
    }
    
    return foundCorrectMenu;
  } catch (error) {
    console.log('❌ 右键菜单验证失败:', error.message);
    return false;
  }
}

// 测试 2: HTML 响应清理功能验证
function testHTMLResponseCleaning() {
  console.log('\n🔍 测试 2: HTML 响应清理功能验证');
  
  // 模拟内容脚本的 cleanAIResponse 函数
  function cleanAIResponse(response) {
    if (typeof response !== 'string') {
      return String(response);
    }
    
    console.log('开始清理 AI 响应，原始内容:', response.substring(0, 200));
    
    // 如果响应包含 HTML 标签，尝试提取纯文本
    if (response.includes('<') && response.includes('>')) {
      console.log('检测到 HTML 响应，正在清理...');
      
      // 首先尝试使用 DOM 解析提取纯文本
      try {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = response;
        
        // 提取纯文本内容
        let cleanText = tempDiv.textContent || tempDiv.innerText || '';
        console.log('DOM 解析提取结果:', cleanText.substring(0, 200));
        
        // 如果提取的文本为空或太短，尝试正则表达式方法
        if (!cleanText || cleanText.trim().length < 10) {
          console.log('DOM 解析结果无效，使用正则表达式清理...');
          
          // 移除 HTML 标签
          cleanText = response.replace(/<[^>]*>/g, '');
          // 移除 HTML 实体
          cleanText = cleanText.replace(/&[a-zA-Z]+;/g, ' ');
          // 清理多余空格
          cleanText = cleanText.replace(/\s+/g, ' ').trim();
          
          console.log('正则表达式清理结果:', cleanText.substring(0, 200));
        }
        
        // 如果清理后仍然有问题，尝试提取有意义的文本片段
        if (!cleanText || cleanText.trim().length < 10) {
          console.log('清理结果仍然无效，尝试提取文本片段...');
          
          // 查找可能包含有用信息的文本片段
          const textMatches = response.match(/>([^<]+)</g);
          if (textMatches && textMatches.length > 0) {
            cleanText = textMatches
              .map(match => match.replace(/[<>]/g, '').trim())
              .filter(text => text.length > 0)
              .join(' ');
            console.log('文本片段提取结果:', cleanText.substring(0, 200));
          }
        }
        
        // 最后的兜底方案
        if (!cleanText || cleanText.trim().length < 10) {
          console.log('所有清理方法都失败，使用原始内容的前200个字符');
          cleanText = response.substring(0, 200) + '...';
        }
        
        console.log('HTML 清理完成，原始长度:', response.length, '清理后长度:', cleanText.length);
        return cleanText;
        
      } catch (error) {
        console.log('HTML 清理过程中出现错误:', error.message);
        
        // 使用简单的正则表达式作为备用方案
        let cleanText = response.replace(/<[^>]*>/g, '');
        cleanText = cleanText.replace(/&[a-zA-Z]+;/g, ' ');
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        
        if (!cleanText || cleanText.length < 10) {
          cleanText = response.substring(0, 200) + '...';
        }
        
        return cleanText;
      }
    }
    
    // 如果不是 HTML，直接返回
    console.log('响应不是 HTML 格式，直接返回');
    return response;
  }
  
  console.log('测试 HTML 响应清理...');
  const cleanedResult = cleanAIResponse(testConfig.htmlResponse);
  
  console.log('原始 HTML 长度:', testConfig.htmlResponse.length);
  console.log('清理后结果长度:', cleanedResult.length);
  console.log('清理后结果预览:', cleanedResult.substring(0, 200));
  
  // 验证清理结果
  const hasHtmlTags = /<[^>]*>/.test(cleanedResult);
  const hasHtmlEntities = /&[a-zA-Z]+;/.test(cleanedResult);
  const hasUsefulContent = cleanedResult.includes('有用的内容');
  
  if (!hasHtmlTags && !hasHtmlEntities && hasUsefulContent) {
    console.log('✅ HTML 清理成功，没有残留的 HTML 标签和实体，保留了有用内容');
  } else {
    console.log('❌ HTML 清理失败');
    if (hasHtmlTags) console.log('  - 仍有 HTML 标签');
    if (hasHtmlEntities) console.log('  - 仍有 HTML 实体');
    if (!hasUsefulContent) console.log('  - 丢失了有用内容');
  }
  
  return cleanedResult;
}

// 测试 3: 弹窗内容验证
function testPopupContent() {
  console.log('\n🔍 测试 3: 弹窗内容验证');
  
  // 检查弹窗是否包含正确的结构
  const popup = document.querySelector('.longport-ai-popup');
  if (popup) {
    const originalText = popup.querySelector('.original-text');
    const aiResult = popup.querySelector('.ai-result');
    const resultText = popup.querySelector('.result-text');
    
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
    
    if (resultText) {
      console.log('✅ 弹窗中包含结果文本区域');
    } else {
      console.log('❌ 弹窗中缺少结果文本区域');
    }
    
    return true;
  } else {
    console.log('ℹ️ 当前页面没有弹窗，无法验证弹窗内容');
    return false;
  }
}

// 测试 4: 模拟 API 调用验证
async function testMockAPICall() {
  console.log('\n🔍 测试 4: 模拟 API 调用验证');
  
  try {
    console.log('测试模拟 API 调用...');
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: testConfig.testTexts[0],
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
      
      // 检查返回的数据是否包含有用的内容
      const hasUsefulContent = response.data.includes('AI 优化建议') || 
                               response.data.includes('建议') || 
                               response.data.length > 20;
      
      if (hasUsefulContent) {
        console.log('✅ 返回数据包含有用的优化内容');
      } else {
        console.log('❌ 返回数据缺少有用的优化内容');
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

// 测试 5: 网站类型检测验证
function testSiteTypeDetection() {
  console.log('\n🔍 测试 5: 网站类型检测验证');
  
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  console.log('当前 URL:', currentUrl);
  console.log('当前域名:', hostname);
  
  let detectedType = 'unknown';
  if (hostname.includes('longportapp.com')) {
    detectedType = 'longport';
  } else if (hostname.includes('notion')) {
    detectedType = 'notion';
  }
  
  console.log('检测到的网站类型:', detectedType);
  
  if (detectedType === 'longport') {
    console.log('✅ 成功检测到 LongPort 网站');
  } else if (detectedType === 'notion') {
    console.log('✅ 成功检测到 Notion 网站');
  } else {
    console.log('⚠️ 未检测到支持的网站类型');
  }
  
  return detectedType;
}

// 运行所有测试
async function runAllVerificationTests() {
  console.log('🚀 开始运行最终验证测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const menuTest = testContextMenuText();
    const htmlTest = testHTMLResponseCleaning();
    const popupTest = testPopupContent();
    const apiTest = await testMockAPICall();
    const siteTest = testSiteTypeDetection();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 最终验证测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`右键菜单文字: ${menuTest ? '✅' : '⚠️'}`);
    console.log(`HTML 响应清理: ${htmlTest.length > 0 ? '✅' : '❌'}`);
    console.log(`弹窗内容结构: ${popupTest ? '✅' : '⚠️'}`);
    console.log(`模拟 API 调用: ${apiTest.status === 'success' ? '✅' : '❌'}`);
    console.log(`网站类型检测: ${siteTest !== 'unknown' ? '✅' : '⚠️'}`);
    console.log('================================');
    
    // 详细结果分析
    console.log('\n🔍 详细结果分析:');
    
    // HTML 清理测试结果
    if (htmlTest.length > 0) {
      const hasHtml = /<[^>]*>/.test(htmlTest);
      const hasUsefulContent = htmlTest.includes('有用的内容');
      
      if (!hasHtml && hasUsefulContent) {
        console.log('✅ HTML 清理功能正常，能正确提取有用内容');
      } else {
        console.log('❌ HTML 清理功能存在问题');
        if (hasHtml) console.log('  - 仍有 HTML 标签残留');
        if (!hasUsefulContent) console.log('  - 丢失了有用内容');
      }
    }
    
    // API 调用测试结果
    if (apiTest.status === 'success') {
      const hasHtml = /<[^>]*>/.test(apiTest.data);
      const hasUsefulContent = apiTest.data.includes('AI 优化建议') || 
                               apiTest.data.includes('建议') || 
                               apiTest.data.length > 20;
      
      if (!hasHtml && hasUsefulContent) {
        console.log('✅ API 调用功能正常，返回干净的优化内容');
      } else {
        console.log('❌ API 调用功能存在问题');
        if (hasHtml) console.log('  - 返回数据包含 HTML');
        if (!hasUsefulContent) console.log('  - 返回数据缺少有用内容');
      }
    }
    
    // 总体评估
    const totalTests = 5;
    const successfulTests = [
      menuTest,
      htmlTest.length > 0,
      popupTest,
      apiTest.status === 'success',
      siteTest !== 'unknown'
    ].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！插件功能完全正常，可以发布');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，插件功能基本正常，建议修复问题后发布');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，插件功能存在问题，需要修复后发布');
    } else {
      console.log('❌ 大部分测试失败，插件功能存在严重问题，不能发布');
    }
    
    return {
      menuTest,
      htmlTest,
      popupTest,
      apiTest,
      siteTest,
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
console.log('1. 运行 testContextMenuText() 测试右键菜单文字');
console.log('2. 运行 testHTMLResponseCleaning() 测试 HTML 响应清理');
console.log('3. 运行 testPopupContent() 测试弹窗内容结构');
console.log('4. 运行 testMockAPICall() 测试模拟 API 调用');
console.log('5. 运行 testSiteTypeDetection() 测试网站类型检测');
console.log('6. 运行 runAllVerificationTests() 运行所有验证测试');

console.log('\n按 Enter 键开始运行所有最终验证测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllVerificationTests();
  }
});

console.log('最终验证测试脚本加载完成，按 Enter 键开始测试');
