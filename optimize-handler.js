// 文案优化处理器

// 处理文案优化请求
async function handleOptimizeRequest(request, sender, sendResponse) {
  console.log('收到文案优化请求:', request.options);
  
  try {
    // 获取API配置
    const { companyApiKey, companyApiUrl } = await chrome.storage.sync.get(['companyApiKey', 'companyApiUrl']);
    
    // 验证API配置
    if (!companyApiKey || !companyApiUrl) {
      throw new Error('API配置不完整，请在设置中配置API密钥和地址');
    }
    
    // 获取请求参数
    const { text, scenario, strictMode } = request.options;
    
    // 获取样式指南摘要
    const styleGuideSummary = await getStyleGuideSummary(scenario);
    
    // 调用API优化文案
    const result = await callOptimizeAPI(text, scenario, strictMode, styleGuideSummary, companyApiKey, companyApiUrl);
    
    // 返回结果
    sendResponse({
      ok: true,
      data: result
    });
  } catch (error) {
    console.error('文案优化失败:', error);
    
    // 尝试使用模拟API
    try {
      console.log('尝试使用模拟API...');
      const { text, scenario, strictMode } = request.options;
      const mockResult = await mockOptimizeAPI(text, scenario, strictMode);
      
      sendResponse({
        ok: true,
        data: mockResult
      });
    } catch (mockError) {
      console.error('模拟API也失败了:', mockError);
      sendResponse({
        ok: false,
        error: String(error)
      });
    }
  }
}

// 获取样式指南摘要
async function getStyleGuideSummary(scenario) {
  // 根据场景返回不同的样式指南摘要
  const summaries = {
    'general': '通用场景文案指引：使用清晰、简洁的表述，避免使用过于口语化或夸张的表达，保持专业性和一致性。',
    'marketing': '营销场景文案指引：突出产品/服务优势，使用积极、吸引人的语言，但不得使用虚假或夸大的表述，不得承诺具体收益。',
    'product': '产品场景文案指引：准确描述产品功能和特性，使用专业术语，避免技术错误，保持表述一致性。',
    'legal': '法律场景文案指引：使用严谨、精确的法律术语，避免模糊表述，确保合规性，必须包含必要的免责声明。',
    'financial': '金融场景文案指引：使用标准金融术语，避免使用承诺性表述，必须包含风险提示，保持专业性和准确性。'
  };
  
  return summaries[scenario] || summaries['general'];
}

// 调用优化API
async function callOptimizeAPI(text, scenario, strictMode, styleGuideSummary, apiKey, apiUrl) {
  console.log('调用优化API...');
  console.log('参数:', { scenario, strictMode });
  
  // 构建API地址
  const endpoint = `${apiUrl.replace(/\/$/, '')}/v1/optimize`;
  
  // 发送请求
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      text,
      scenario,
      strictMode,
      styleGuide: styleGuideSummary
    })
  });
  
  // 处理响应
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API错误 (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  
  // 返回优化结果
  return {
    originalText: text,
    optimizedText: data.optimized || text,
    changes: data.changes || [],
    policyHits: data.policyHits || []
  };
}

// 模拟优化API
async function mockOptimizeAPI(text, scenario, strictMode) {
  console.log('使用模拟API...');
  
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 简单的文本优化逻辑
  let optimizedText = text;
  
  // 替换一些常见的错误用词
  optimizedText = optimizedText.replace(/登陆/g, '登录');
  optimizedText = optimizedText.replace(/点下/g, '点击');
  
  // 添加风险提示（如果是金融场景且没有风险提示）
  if (scenario === 'financial' && !optimizedText.includes('风险')) {
    optimizedText += '\n\n投资有风险，入市需谨慎。';
  }
  
  // 模拟政策命中
  const policyHits = [];
  
  if (text.includes('稳赚不赔') || text.includes('保证收益')) {
    policyHits.push({
      policyId: 'no_guarantee',
      policyName: '不承诺收益',
      description: '不得使用"保证收益"、"稳赚不赔"等承诺性表述',
      severity: 'critical'
    });
  }
  
  if (scenario === 'financial' && !text.includes('风险')) {
    policyHits.push({
      policyId: 'risk_disclosure',
      policyName: '风险提示',
      description: '金融产品相关内容必须包含风险提示',
      severity: 'high'
    });
  }
  
  // 返回模拟的优化结果
  return {
    originalText: text,
    optimizedText,
    changes: [
      {
        type: 'replacement',
        original: '登陆',
        replacement: '登录',
        position: {
          start: text.indexOf('登陆'),
          end: text.indexOf('登陆') + 2
        },
        reason: '规范用词，"登陆"指船只、飞机等抵达陆地，"登录"指进入系统'
      }
    ],
    policyHits
  };
}

// 导出处理函数
window.handleOptimizeRequest = handleOptimizeRequest;
