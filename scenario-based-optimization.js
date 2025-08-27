// 场景化优化规则系统
// 为不同平台提供专属的优化策略和AI指令

class ScenarioBasedOptimization {
  constructor() {
    // 场景配置
    this.scenarios = {
      // LongPort 金融专业场景
      longport: {
        name: 'LongPort金融专业',
        description: '金融投资平台的专业内容优化',
        platform: 'longportapp.com',
        optimizationRules: {
          tone: 'professional_financial',
          language: 'zh-CN',
          style: 'authoritative_credible',
          targetAudience: 'financial_investors',
          compliance: 'financial_regulations'
        },
        aiInstructions: [
          '使用专业金融术语，提升内容的权威性',
          '强调风险提示和合规要求',
          '优化数据表达，使用精确的金融指标',
          '保持客观专业的语调，避免过度营销',
          '符合金融监管要求，添加必要的免责声明'
        ],
        contentEnhancements: {
          terminology: ['投资组合', '风险收益', '资产配置', '市场分析', '投资策略'],
          structure: ['风险提示', '投资建议', '市场展望', '操作指南'],
          compliance: ['投资有风险', '过往业绩不代表未来表现', '请谨慎投资']
        }
      },
      
      // Notion 文档协作场景
      notion: {
        name: 'Notion文档协作',
        description: '团队协作文档的内容优化',
        platform: 'notion.so',
        optimizationRules: {
          tone: 'collaborative_clear',
          language: 'zh-CN',
          style: 'structured_readable',
          targetAudience: 'team_collaborators',
          compliance: 'document_standards'
        },
        aiInstructions: [
          '优化文档结构，提升可读性和逻辑性',
          '使用清晰的标题层级和列表格式',
          '添加协作提示和操作指引',
          '保持简洁明了的表达风格',
          '增强文档的可维护性和可扩展性'
        ],
        contentEnhancements: {
          structure: ['标题层级', '列表格式', '表格布局', '流程图'],
          collaboration: ['协作提示', '操作指引', '注意事项', '更新记录'],
          readability: ['简洁表达', '逻辑清晰', '易于理解', '便于维护']
        }
      },
      
      // 通用场景
      general: {
        name: '通用优化',
        description: '适用于一般场景的内容优化',
        platform: 'general',
        optimizationRules: {
          tone: 'neutral_clear',
          language: 'zh-CN',
          style: 'standard_improved',
          targetAudience: 'general_users',
          compliance: 'basic_standards'
        },
        aiInstructions: [
          '优化语法和标点符号使用',
          '改进语言表达的流畅性',
          '提升内容的可读性',
          '保持原文的核心含义',
          '调整句式结构，使表达更清晰'
        ],
        contentEnhancements: {
          grammar: ['语法优化', '标点符号', '句式结构', '表达流畅'],
          clarity: ['清晰度提升', '逻辑优化', '结构改进', '可读性增强']
        }
      },
      
      // 新增：社交媒体场景
      social_media: {
        name: '社交媒体',
        description: '社交媒体平台的内容优化',
        platform: 'social_media',
        optimizationRules: {
          tone: 'engaging_interactive',
          language: 'zh-CN',
          style: 'viral_shareable',
          targetAudience: 'social_users',
          compliance: 'social_media_guidelines'
        },
        aiInstructions: [
          '增加互动性和参与感',
          '使用热门话题和标签',
          '优化分享传播性',
          '保持真实性和可信度',
          '符合平台内容规范'
        ],
        contentEnhancements: {
          engagement: ['互动元素', '热门话题', '情感共鸣', '分享价值'],
          virality: ['传播性', '话题性', '时效性', '共鸣点']
        }
      },
      
      // 新增：电商产品场景
      ecommerce: {
        name: '电商产品',
        description: '电商平台的产品描述优化',
        platform: 'ecommerce',
        optimizationRules: {
          tone: 'persuasive_trustworthy',
          language: 'zh-CN',
          style: 'sales_oriented',
          targetAudience: 'potential_buyers',
          compliance: 'advertising_standards'
        },
        aiInstructions: [
          '突出产品优势和卖点',
          '使用吸引人的产品描述',
          '增加购买动机和紧迫感',
          '保持真实可信的产品信息',
          '符合广告法规要求'
        ],
        contentEnhancements: {
          sales: ['产品卖点', '购买动机', '紧迫感', '信任建立'],
          description: ['产品特性', '使用场景', '价值主张', '用户评价']
        }
      }
    };
  }
  
  // 获取场景配置
  getScenario(scenarioKey) {
    return this.scenarios[scenarioKey] || this.scenarios.general;
  }
  
  // 根据URL自动识别场景
  detectScenarioFromUrl(url) {
    if (!url) return 'general';
    
    const hostname = url.toLowerCase();
    
    if (hostname.includes('longportapp.com') || hostname.includes('longport.com')) {
      return 'longport';
    } else if (hostname.includes('notion.so') || hostname.includes('notion.site') || hostname.includes('notion.com')) {
      return 'notion';
    } else if (hostname.includes('weibo.com') || hostname.includes('wechat.com') || hostname.includes('douyin.com')) {
      return 'social_media';
    } else if (hostname.includes('taobao.com') || hostname.includes('jd.com') || hostname.includes('tmall.com')) {
      return 'ecommerce';
    }
    
    return 'general';
  }
  
  // 生成场景化的AI指令
  generateScenarioInstructions(scenarioKey, originalText) {
    const scenario = this.getScenario(scenarioKey);
    const baseInstructions = scenario.aiInstructions;
    
    // 根据原文内容动态调整指令
    const dynamicInstructions = this.generateDynamicInstructions(scenario, originalText);
    
    return {
      base: baseInstructions,
      dynamic: dynamicInstructions,
      combined: [...baseInstructions, ...dynamicInstructions]
    };
  }
  
  // 生成动态指令
  generateDynamicInstructions(scenario, originalText) {
    const instructions = [];
    
    // 根据原文长度调整指令
    if (originalText.length < 50) {
      instructions.push('内容较短，建议适当扩展，增加细节和说明');
    } else if (originalText.length > 500) {
      instructions.push('内容较长，建议精简表达，突出重点信息');
    }
    
    // 根据内容类型调整指令
    if (scenario.key === 'longport') {
      if (originalText.includes('投资') || originalText.includes('理财')) {
        instructions.push('检测到投资相关内容，请加强风险提示和合规要求');
      }
      if (originalText.includes('收益') || originalText.includes('回报')) {
        instructions.push('涉及收益相关内容，请添加"过往业绩不代表未来表现"等免责声明');
      }
    }
    
    if (scenario.key === 'notion') {
      if (originalText.includes('首先') || originalText.includes('其次')) {
        instructions.push('检测到流程性内容，请优化列表格式和步骤说明');
      }
      if (originalText.includes('团队') || originalText.includes('协作')) {
        instructions.push('涉及团队协作，请增加协作提示和操作指引');
      }
    }
    
    return instructions;
  }
  
  // 生成场景化的请求体
  generateScenarioRequest(scenarioKey, originalText, customRequirements = {}) {
    const scenario = this.getScenario(scenarioKey);
    const instructions = this.generateScenarioInstructions(scenarioKey, originalText);
    
    return {
      text: originalText,
      scenario: {
        key: scenarioKey,
        name: scenario.name,
        platform: scenario.platform,
        description: scenario.description
      },
      optimization_rules: {
        ...scenario.optimizationRules,
        ...customRequirements
      },
      ai_instructions: {
        base: instructions.base,
        dynamic: instructions.dynamic,
        combined: instructions.combined
      },
      content_enhancements: scenario.contentEnhancements,
      quality_standards: {
        originality: '保持原文核心含义',
        professionalism: '符合平台专业标准',
        compliance: '满足相关法规要求',
        user_experience: '提升用户阅读体验'
      }
    };
  }
  
  // 执行场景化优化
  async executeScenarioOptimization(scenarioKey, originalText, customRequirements = {}) {
    try {
      const scenario = this.getScenario(scenarioKey);
      const requestBody = this.generateScenarioRequest(scenarioKey, originalText, customRequirements);
      
      console.log(`🚀 执行${scenario.name}场景优化...`);
      console.log('优化规则:', scenario.optimizationRules);
      console.log('AI指令:', requestBody.ai_instructions.combined);
      
      // 这里应该调用真实的AI API
      // 目前先返回模拟结果
      const optimizedResult = await this.simulateScenarioOptimization(scenario, originalText);
      
      return {
        success: true,
        scenario: scenario.name,
        originalText: originalText,
        optimizedText: optimizedResult,
        optimizationDetails: {
          rules: scenario.optimizationRules,
          instructions: requestBody.ai_instructions.combined,
          enhancements: scenario.contentEnhancements
        },
        qualityMetrics: {
          lengthChange: ((optimizedResult.length - originalText.length) / originalText.length * 100).toFixed(1) + '%',
          improvementAreas: Object.keys(scenario.contentEnhancements)
        }
      };
      
    } catch (error) {
      console.error('场景化优化执行失败:', error);
      return {
        success: false,
        error: error.message,
        scenario: scenarioKey
      };
    }
  }
  
  // 模拟场景化优化（实际应该调用AI API）
  async simulateScenarioOptimization(scenario, originalText) {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let optimizedText = originalText;
    
    // 根据场景应用不同的优化策略
    switch (scenario.key) {
      case 'longport':
        optimizedText = this.applyLongPortOptimization(originalText);
        break;
      case 'notion':
        optimizedText = this.applyNotionOptimization(originalText);
        break;
      case 'social_media':
        optimizedText = this.applySocialMediaOptimization(originalText);
        break;
      case 'ecommerce':
        optimizedText = this.applyEcommerceOptimization(originalText);
        break;
      default:
        optimizedText = this.applyGeneralOptimization(originalText);
    }
    
    return optimizedText;
  }
  
  // LongPort金融专业优化
  applyLongPortOptimization(text) {
    let optimized = text;
    
    // 金融术语专业化
    optimized = optimized.replace(/投资/g, '投资理财');
    optimized = optimized.replace(/收益/g, '投资回报');
    optimized = optimized.replace(/风险/g, '投资风险');
    optimized = optimized.replace(/市场/g, '金融市场');
    
    // 格式优化
    optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
    optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
    
    // 添加金融专业性
    if (!optimized.includes('专业') && !optimized.includes('权威')) {
      optimized += '\n\n📊 专业分析：以上内容基于专业金融分析，仅供参考。';
    }
    
    // 添加合规要求
    if (!optimized.includes('风险') || !optimized.includes('谨慎')) {
      optimized += '\n⚠️ 风险提示：投资有风险，入市需谨慎。过往业绩不代表未来表现。';
    }
    
    return optimized;
  }
  
  // Notion文档协作优化
  applyNotionOptimization(text) {
    let optimized = text;
    
    // 格式优化
    optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
    optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
    
    // 文档结构优化
    if (optimized.includes('首先') || optimized.includes('其次')) {
      optimized = optimized.replace(/。/g, '。\n');
    }
    
    // 添加协作提示
    if (!optimized.includes('协作') && !optimized.includes('团队')) {
      optimized += '\n\n🤝 协作提示：请团队成员及时更新和完善此文档。';
    }
    
    // 添加操作指引
    if (!optimized.includes('建议') && !optimized.includes('注意')) {
      optimized += '\n💡 建议：请根据实际情况调整和完善以上内容。';
    }
    
    return optimized;
  }
  
  // 社交媒体优化
  applySocialMediaOptimization(text) {
    let optimized = text;
    
    // 增加互动性
    if (!optimized.includes('?') && !optimized.includes('？')) {
      optimized += '\n\n💭 你觉得怎么样？欢迎在评论区分享你的想法！';
    }
    
    // 添加热门话题标签
    if (!optimized.includes('#')) {
      optimized += '\n\n#热门话题 #分享 #讨论';
    }
    
    return optimized;
  }
  
  // 电商产品优化
  applyEcommerceOptimization(text) {
    let optimized = text;
    
    // 增加购买动机
    if (!optimized.includes('限时') && !optimized.includes('优惠')) {
      optimized += '\n\n🔥 限时优惠，错过再等一年！';
    }
    
    // 添加信任元素
    if (!optimized.includes('保证') && !optimized.includes('承诺')) {
      optimized += '\n\n✅ 正品保证，7天无理由退换！';
    }
    
    return optimized;
  }
  
  // 通用优化
  applyGeneralOptimization(text) {
    let optimized = text;
    
    // 格式优化
    optimized = optimized.replace(/，/g, '， ').replace(/。/g, '。 ');
    optimized = optimized.replace(/：/g, '： ').replace(/；/g, '； ');
    
    // 添加优化说明
    if (!optimized.includes('优化') && !optimized.includes('改进')) {
      optimized += '\n\n✨ 以上内容已进行语言优化，提升了表达清晰度。';
    }
    
    return optimized;
  }
  
  // 获取所有可用场景
  getAllScenarios() {
    return Object.keys(this.scenarios).map(key => ({
      key: key,
      ...this.scenarios[key]
    }));
  }
  
  // 添加新场景
  addScenario(key, config) {
    if (this.scenarios[key]) {
      console.warn(`场景 ${key} 已存在，将被覆盖`);
    }
    
    this.scenarios[key] = {
      key: key,
      ...config
    };
    
    console.log(`✅ 新场景 ${key} 添加成功`);
    return this.scenarios[key];
  }
  
  // 更新场景配置
  updateScenario(key, updates) {
    if (!this.scenarios[key]) {
      throw new Error(`场景 ${key} 不存在`);
    }
    
    this.scenarios[key] = {
      ...this.scenarios[key],
      ...updates
    };
    
    console.log(`✅ 场景 ${key} 更新成功`);
    return this.scenarios[key];
  }
}

// 导出场景化优化系统
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioBasedOptimization;
} else if (typeof window !== 'undefined') {
  window.ScenarioBasedOptimization = ScenarioBasedOptimization;
}

console.log('🎯 场景化优化规则系统已加载');
