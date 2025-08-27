import { OptimizeOptions, OptimizeResult } from './types';

/**
 * 调用服务端API优化文案
 * @param options 优化选项
 */
export async function callOptimizeAPI(options: OptimizeOptions): Promise<OptimizeResult> {
  try {
    // 获取API配置
    const { companyApiKey, companyApiUrl } = await chrome.storage.sync.get(['companyApiKey', 'companyApiUrl']);
    
    // 验证API配置
    if (!companyApiKey || typeof companyApiKey !== 'string') {
      throw new Error('API密钥未配置');
    }
    
    if (!companyApiUrl || typeof companyApiUrl !== 'string') {
      throw new Error('API地址未配置');
    }
    
    // 构建API地址
    const apiUrl = `${companyApiUrl.replace(/\/$/, '')}/v1/optimize`;
    
    // 获取样式指南摘要
    const styleGuideSummary = await getStyleGuideSummary(options.scenario);
    
    // 构建请求体
    const requestBody = {
      text: options.text,
      scenario: options.scenario,
      strictMode: options.strictMode,
      styleGuide: styleGuideSummary
    };
    
    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${companyApiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // 处理响应
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 返回优化结果
    return {
      originalText: options.text,
      optimizedText: data.optimized || options.text,
      changes: data.changes || [],
      policyHits: data.policyHits || []
    };
  } catch (error) {
    console.error('调用优化API失败:', error);
    throw error;
  }
}

/**
 * 获取样式指南摘要
 * @param scenario 场景ID
 */
async function getStyleGuideSummary(scenario: string): Promise<string> {
  // 根据场景返回不同的样式指南摘要
  const summaries: Record<string, string> = {
    'general': '通用场景文案指引：使用清晰、简洁的表述，避免使用过于口语化或夸张的表达，保持专业性和一致性。',
    'marketing': '营销场景文案指引：突出产品/服务优势，使用积极、吸引人的语言，但不得使用虚假或夸大的表述，不得承诺具体收益。',
    'product': '产品场景文案指引：准确描述产品功能和特性，使用专业术语，避免技术错误，保持表述一致性。',
    'legal': '法律场景文案指引：使用严谨、精确的法律术语，避免模糊表述，确保合规性，必须包含必要的免责声明。',
    'financial': '金融场景文案指引：使用标准金融术语，避免使用承诺性表述，必须包含风险提示，保持专业性和准确性。'
  };
  
  return summaries[scenario] || summaries['general'];
}

/**
 * 模拟优化API（备用方案）
 * @param options 优化选项
 */
export async function mockOptimizeAPI(options: OptimizeOptions): Promise<OptimizeResult> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 简单的文本优化逻辑
  let optimizedText = options.text;
  
  // 替换一些常见的错误用词
  optimizedText = optimizedText.replace(/登陆/g, '登录');
  optimizedText = optimizedText.replace(/点下/g, '点击');
  
  // 添加风险提示（如果是金融场景且没有风险提示）
  if (options.scenario === 'financial' && !optimizedText.includes('风险')) {
    optimizedText += '\n\n投资有风险，入市需谨慎。';
  }
  
  // 返回模拟的优化结果
  return {
    originalText: options.text,
    optimizedText,
    changes: [
      {
        type: 'replacement',
        original: '登陆',
        replacement: '登录',
        position: {
          start: options.text.indexOf('登陆'),
          end: options.text.indexOf('登陆') + 2
        },
        reason: '规范用词，"登陆"指船只、飞机等抵达陆地，"登录"指进入系统'
      }
    ],
    policyHits: []
  };
}
