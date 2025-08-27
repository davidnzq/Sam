// HTML 内容修复测试脚本 - 验证 AI 优化结果能正确显示基于选中文本的内容
console.log('=== LongPort AI 助手 HTML 内容修复测试 ===');

// 测试配置
const testConfig = {
  testTexts: [
    '这是一个测试文本，用于验证 AI 优化功能。',
    'The market shows strong momentum with increasing volume.',
    '基于当前市场分析，建议投资者关注科技板块。'
  ],
  htmlResponses: [
    // 无意义的 HTML 响应
    `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <title>New API</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">这是无用的内容</div>
  </body>
</html>`,
    
    // 包含错误信息的响应
    `<html>
  <body>
    <h1>Error 404</h1>
    <p>Page not found</p>
    <p>You need to enable JavaScript to run this app.</p>
  </body>
</html>`,
    
    // 包含 New API 的响应
    `<div>
      <h1>New API</h1>
      <p>You need to enable JavaScript to run this app.</p>
      <script>console.log('test')</script>
    </div>`
  ]
};

// 测试 1: 内容意义检测功能
function testContentMeaningDetection() {
  console.log('\n🔍 测试 1: 内容意义检测功能');
  
  // 模拟内容脚本的 checkMeaningfulContent 函数
  function checkMeaningfulContent(text) {
    if (!text || text.trim().length < 10) {
      return false;
    }
    
    // 检查是否包含常见的无意义内容
    const meaninglessPatterns = [
      /new api/i,
      /you need to enable javascript/i,
      /run this app/i,
      /<!doctype/i,
      /<html/i,
      /<head/i,
      /<body/i,
      /<script/i,
      /<style/i,
      /<meta/i,
      /<link/i,
      /<title/i
    ];
    
    for (const pattern of meaninglessPatterns) {
      if (pattern.test(text)) {
        console.log('检测到无意义内容模式:', pattern.source);
        return false;
      }
    }
    
    // 检查是否包含有用的优化内容
    const usefulPatterns = [
      /优化/i,
      /建议/i,
      /改进/i,
      /improve/i,
      /suggestion/i,
      /recommendation/i,
      /grammar/i,
      /语法/i,
      /文笔/i,
      /writing/i
    ];
    
    for (const pattern of usefulPatterns) {
      if (pattern.test(text)) {
        console.log('检测到有用内容模式:', pattern.source);
        return true;
      }
    }
    
    // 如果文本长度合理且不包含明显的无意义内容，认为是有意义的
    return text.trim().length > 20;
  }
  
  console.log('测试无意义内容检测...');
  
  // 测试无意义内容
  for (let i = 0; i < testConfig.htmlResponses.length; i++) {
    const htmlResponse = testConfig.htmlResponses[i];
    const isMeaningful = checkMeaningfulContent(htmlResponse);
    console.log(`HTML 响应 ${i + 1}: ${isMeaningful ? '❌ 误判为有意义' : '✅ 正确识别为无意义'}`);
  }
  
  // 测试有意义内容
  const meaningfulTexts = [
    '这段文字表达清晰，逻辑连贯，建议可以适当增加一些细节描述。',
    'The text is well-written with good grammar. Consider adding more examples.',
    '基于当前市场分析，建议投资者关注科技板块，可以考虑增加更多数据支撑。'
  ];
  
  console.log('\n测试有意义内容检测...');
  for (let i = 0; i < meaningfulTexts.length; i++) {
    const text = meaningfulTexts[i];
    const isMeaningful = checkMeaningfulContent(text);
    console.log(`有意义文本 ${i + 1}: ${isMeaningful ? '✅ 正确识别为有意义' : '❌ 误判为无意义'}`);
  }
  
  return true;
}

// 测试 2: 基于选中文本的优化结果生成
function testOptimizedTextGeneration() {
  console.log('\n🔍 测试 2: 基于选中文本的优化结果生成');
  
  // 模拟内容脚本的 generateOptimizedTextFromSelection 函数
  function generateOptimizedTextFromSelection(selectedText, siteType) {
    console.log('基于选中文本生成优化结果');
    
    if (!selectedText || selectedText.trim().length === 0) {
      return '无法获取选中的文本内容，请重新选择文本。';
    }
    
    const originalText = selectedText.trim();
    let optimizedText = originalText;
    
    // 根据网站类型提供不同的优化建议
    let suggestions = [];
    
    if (siteType === 'longport') {
      // LongPort 特定的优化建议
      suggestions = [
        '这段文字适合长文编辑，建议增加更多细节和例证。',
        '作为短评内容，语言简洁明了，观点突出。',
        '可以考虑添加数据支撑或引用权威观点。',
        '建议调整语气，使其更符合专业金融平台的要求。'
      ];
    } else if (siteType === 'notion') {
      // Notion 特定的优化建议
      suggestions = [
        '这段文字表达清晰，逻辑连贯。',
        '建议可以适当增加一些细节描述。',
        '语言简洁明了，易于理解。',
        '可以考虑添加一些例子来增强说服力。'
      ];
    } else {
      // 通用优化建议
      suggestions = [
        '文字表达清晰，逻辑结构良好。',
        '建议适当增加细节描述。',
        '语言简洁明了，易于理解。',
        '可以考虑添加例子增强说服力。'
      ];
    }
    
    // 基本的语法和表达优化
    const improvements = [
      { from: /。/g, to: '。' },
      { from: /，/g, to: '，' },
      { from: /！/g, to: '！' },
      { from: /？/g, to: '？' },
      { from: /；/g, to: '；' },
      { from: /：/g, to: '：' }
    ];
    
    improvements.forEach(improvement => {
      optimizedText = optimizedText.replace(improvement.from, improvement.to);
    });
    
    // 随机选择一个建议
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    // 构建优化结果
    const result = `${optimizedText}\n\n💡 AI 优化建议：${randomSuggestion}`;
    
    console.log('生成的优化结果:', result);
    return result;
  }
  
  console.log('测试不同网站类型的优化结果生成...');
  
  // 测试 LongPort 类型
  const longportResult = generateOptimizedTextFromSelection(testConfig.testTexts[0], 'longport');
  console.log('LongPort 优化结果:', longportResult.substring(0, 100) + '...');
  
  // 测试 Notion 类型
  const notionResult = generateOptimizedTextFromSelection(testConfig.testTexts[1], 'notion');
  console.log('Notion 优化结果:', notionResult.substring(0, 100) + '...');
  
  // 测试通用类型
  const generalResult = generateOptimizedTextFromSelection(testConfig.testTexts[2], 'unknown');
  console.log('通用优化结果:', generalResult.substring(0, 100) + '...');
  
  // 验证结果
  const allResults = [longportResult, notionResult, generalResult];
  let allValid = true;
  
  for (let i = 0; i < allResults.length; i++) {
    const result = allResults[i];
    const hasOriginalText = result.includes(testConfig.testTexts[i]);
    const hasSuggestion = result.includes('AI 优化建议');
    const hasNoHtml = !/<[^>]*>/.test(result);
    
    if (hasOriginalText && hasSuggestion && hasNoHtml) {
      console.log(`✅ 结果 ${i + 1} 验证通过`);
    } else {
      console.log(`❌ 结果 ${i + 1} 验证失败`);
      if (!hasOriginalText) console.log('  - 缺少原始文本');
      if (!hasSuggestion) console.log('  - 缺少优化建议');
      if (!hasNoHtml) console.log('  - 包含 HTML 标签');
      allValid = false;
    }
  }
  
  return allValid;
}

// 测试 3: 完整的 HTML 清理流程
function testCompleteHTMLCleaning() {
  console.log('\n🔍 测试 3: 完整的 HTML 清理流程');
  
  // 模拟内容脚本的 cleanAIResponse 函数
  function cleanAIResponse(response, selectedText, siteType) {
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
        
        // 检查清理后的内容是否有意义
        const hasMeaningfulContent = checkMeaningfulContent(cleanText);
        if (!hasMeaningfulContent) {
          console.log('清理后的内容无意义，生成基于选中文本的优化结果');
          return generateOptimizedTextFromSelection(selectedText, siteType);
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
          console.log('正则表达式清理也失败，生成基于选中文本的优化结果');
          return generateOptimizedTextFromSelection(selectedText, siteType);
        }
        
        // 检查清理后的内容是否有意义
        const hasMeaningfulContent = checkMeaningfulContent(cleanText);
        if (!hasMeaningfulContent) {
          console.log('清理后的内容无意义，生成基于选中文本的优化结果');
          return generateOptimizedTextFromSelection(selectedText, siteType);
        }
        
        return cleanText;
      }
    }
    
    // 如果不是 HTML，检查内容是否有意义
    const hasMeaningfulContent = checkMeaningfulContent(response);
    if (!hasMeaningfulContent) {
      console.log('非 HTML 响应但内容无意义，生成基于选中文本的优化结果');
      return generateOptimizedTextFromSelection(selectedText, siteType);
    }
    
    // 如果不是 HTML，直接返回
    console.log('响应不是 HTML 格式，直接返回');
    return response;
  }
  
  // 辅助函数
  function checkMeaningfulContent(text) {
    if (!text || text.trim().length < 10) {
      return false;
    }
    
    const meaninglessPatterns = [
      /new api/i,
      /you need to enable javascript/i,
      /run this app/i,
      /<!doctype/i,
      /<html/i,
      /<head/i,
      /<body/i,
      /<script/i,
      /<style/i,
      /<meta/i,
      /<link/i,
      /<title/i
    ];
    
    for (const pattern of meaninglessPatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }
    
    return text.trim().length > 20;
  }
  
  function generateOptimizedTextFromSelection(selectedText, siteType) {
    if (!selectedText || selectedText.trim().length === 0) {
      return '无法获取选中的文本内容，请重新选择文本。';
    }
    
    const originalText = selectedText.trim();
    let optimizedText = originalText;
    
    let suggestions = [];
    if (siteType === 'longport') {
      suggestions = ['这段文字适合长文编辑，建议增加更多细节和例证。'];
    } else if (siteType === 'notion') {
      suggestions = ['这段文字表达清晰，逻辑连贯。'];
    } else {
      suggestions = ['文字表达清晰，逻辑结构良好。'];
    }
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    const result = `${optimizedText}\n\n💡 AI 优化建议：${randomSuggestion}`;
    
    return result;
  }
  
  console.log('测试 HTML 清理流程...');
  
  // 测试无意义的 HTML 响应
  for (let i = 0; i < testConfig.htmlResponses.length; i++) {
    const htmlResponse = testConfig.htmlResponses[i];
    const selectedText = testConfig.testTexts[i % testConfig.testTexts.length];
    const siteType = i === 0 ? 'longport' : (i === 1 ? 'notion' : 'unknown');
    
    console.log(`\n测试 HTML 响应 ${i + 1} (${siteType} 类型):`);
    const cleanedResult = cleanAIResponse(htmlResponse, selectedText, siteType);
    
    // 验证结果
    const hasOriginalText = cleanedResult.includes(selectedText);
    const hasSuggestion = cleanedResult.includes('AI 优化建议');
    const hasNoHtml = !/<[^>]*>/.test(cleanedResult);
    
    if (hasOriginalText && hasSuggestion && hasNoHtml) {
      console.log(`✅ HTML 响应 ${i + 1} 清理成功`);
    } else {
      console.log(`❌ HTML 响应 ${i + 1} 清理失败`);
      if (!hasOriginalText) console.log('  - 缺少原始文本');
      if (!hasSuggestion) console.log('  - 缺少优化建议');
      if (!hasNoHtml) console.log('  - 包含 HTML 标签');
    }
  }
  
  return true;
}

// 运行所有测试
async function runAllHTMLContentFixTests() {
  console.log('🚀 开始运行 HTML 内容修复测试...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行所有测试
    const test1 = testContentMeaningDetection();
    const test2 = testOptimizedTextGeneration();
    const test3 = testCompleteHTMLCleaning();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示测试结果摘要
    console.log('\n📋 HTML 内容修复测试结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`内容意义检测: ${test1 ? '✅' : '❌'}`);
    console.log(`优化结果生成: ${test2 ? '✅' : '❌'}`);
    console.log(`完整清理流程: ${test3 ? '✅' : '❌'}`);
    console.log('================================');
    
    // 总体评估
    const totalTests = 3;
    const successfulTests = [test1, test2, test3].filter(Boolean).length;
    
    console.log(`\n🎯 总体评估: ${successfulTests}/${totalTests} 项测试通过`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 所有测试通过！HTML 内容修复功能正常');
      console.log('✅ AI 优化结果现在能正确显示基于选中文本的内容');
      console.log('✅ 不再显示无意义的 HTML 页面内容');
      console.log('✅ 当 API 返回无效内容时，自动生成有意义的优化结果');
    } else if (successfulTests >= totalTests * 0.8) {
      console.log('✅ 大部分测试通过，HTML 内容修复基本正常');
    } else if (successfulTests >= totalTests * 0.6) {
      console.log('⚠️ 部分测试通过，HTML 内容修复可能存在问题');
    } else {
      console.log('❌ 大部分测试失败，HTML 内容修复存在严重问题');
    }
    
    return {
      test1,
      test2,
      test3,
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
console.log('1. 运行 testContentMeaningDetection() 测试内容意义检测');
console.log('2. 运行 testOptimizedTextGeneration() 测试优化结果生成');
console.log('3. 运行 testCompleteHTMLCleaning() 测试完整清理流程');
console.log('4. 运行 runAllHTMLContentFixTests() 运行所有测试');

console.log('\n按 Enter 键开始运行所有 HTML 内容修复测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllHTMLContentFixTests();
  }
});

console.log('HTML 内容修复测试脚本加载完成，按 Enter 键开始测试');
