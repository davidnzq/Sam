import {
  StyleGuideConfig,
  Scenario,
  Term,
  ForbiddenRules,
  Policy,
  ForbiddenWord,
  GrammarRule
} from './types';

/**
 * 样式指南加载器
 * 负责加载和解析YAML格式的样式指南文件
 */
export class StyleGuideLoader {
  private static instance: StyleGuideLoader;
  private config: StyleGuideConfig | null = null;
  private initialized = false;

  private constructor() {
    // 私有构造函数，防止直接实例化
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): StyleGuideLoader {
    if (!StyleGuideLoader.instance) {
      StyleGuideLoader.instance = new StyleGuideLoader();
    }
    return StyleGuideLoader.instance;
  }

  /**
   * 初始化样式指南
   * 加载所有YAML文件并解析
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 在实际应用中，这里应该通过fetch加载YAML文件
      // 但为了简化实现，我们直接使用内置的配置
      
      // 场景定义
      const scenarios = await this.loadScenarios();
      
      // 术语表
      const terms = await this.loadTerms();
      
      // 禁用词与规则
      const forbiddenRules = await this.loadForbiddenRules();
      
      // 政策
      const policies = await this.loadPolicies();

      // 组合配置
      this.config = {
        scenarios,
        terms,
        forbiddenRules,
        policies
      };

      this.initialized = true;
      console.log('样式指南加载成功');
    } catch (error) {
      console.error('加载样式指南失败:', error);
      throw new Error('加载样式指南失败');
    }
  }

  /**
   * 加载场景定义
   */
  private async loadScenarios(): Promise<Scenario[]> {
    // 这里应该从YAML文件加载，但为了简化实现，直接返回内置配置
    return [
      {
        id: 'general',
        name: '通用场景',
        description: '适用于一般性文案的规范',
        priority: 1
      },
      {
        id: 'marketing',
        name: '营销文案',
        description: '适用于产品推广、活动宣传等营销场景',
        priority: 2
      },
      {
        id: 'product',
        name: '产品说明',
        description: '适用于产品功能介绍、使用说明等',
        priority: 3
      },
      {
        id: 'legal',
        name: '法律合规',
        description: '适用于协议、条款、免责声明等法律文本',
        priority: 4
      },
      {
        id: 'financial',
        name: '金融专业',
        description: '适用于金融产品、市场分析等专业内容',
        priority: 5
      }
    ];
  }

  /**
   * 加载术语表
   */
  private async loadTerms(): Promise<Term[]> {
    // 这里应该从YAML文件加载，但为了简化实现，直接返回内置配置
    return [
      {
        term: '长桥证券',
        standard: '长桥证券',
        alternatives: ['长桥', 'Longbridge Securities'],
        explanation: '公司正式名称',
        category: 'brand',
        scenarios: ['general', 'marketing', 'product', 'legal', 'financial']
      },
      {
        term: '壹圆',
        standard: '壹圆',
        alternatives: ['壹圓', '一元'],
        explanation: '产品名称',
        category: 'product',
        scenarios: ['general', 'marketing', 'product']
      },
      {
        term: '市盈率',
        standard: '市盈率',
        alternatives: ['P/E比率', 'PE比'],
        explanation: '公司市值与其年度净利润的比值，反映投资回本周期',
        category: 'financial',
        scenarios: ['financial', 'general']
      }
    ];
  }

  /**
   * 加载禁用词与规则
   */
  private async loadForbiddenRules(): Promise<ForbiddenRules> {
    // 这里应该从YAML文件加载，但为了简化实现，直接返回内置配置
    return {
      forbidden_words: [
        {
          word: '稳赚不赔',
          reason: '违反金融合规要求，不得承诺收益',
          suggestion: '投资有风险',
          severity: 'critical',
          scenarios: ['general', 'marketing', 'financial', 'legal']
        },
        {
          word: '包赚',
          reason: '违反金融合规要求，不得承诺收益',
          suggestion: '可能带来收益',
          severity: 'critical',
          scenarios: ['general', 'marketing', 'financial', 'legal']
        },
        {
          word: '点下',
          reason: '不规范表述',
          suggestion: '点击',
          severity: 'low',
          scenarios: ['general', 'product']
        }
      ],
      grammar_rules: [
        {
          id: 'sentence_length',
          description: '句子长度不应超过40个字符',
          pattern: '^.{40,}$',
          severity: 'medium',
          scenarios: ['general', 'marketing']
        },
        {
          id: 'punctuation_spacing',
          description: '中文与英文之间需要有空格',
          pattern: '[\\u4e00-\\u9fa5][a-zA-Z]|[a-zA-Z][\\u4e00-\\u9fa5]',
          severity: 'low',
          scenarios: ['general', 'product', 'marketing']
        }
      ]
    };
  }

  /**
   * 加载政策
   */
  private async loadPolicies(): Promise<Policy[]> {
    // 这里应该从YAML文件加载，但为了简化实现，直接返回内置配置
    return [
      {
        id: 'no_guarantee',
        name: '不承诺收益',
        description: '不得使用"保证收益"、"稳赚不赔"等承诺性表述',
        severity: 'critical',
        scenarios: ['marketing', 'financial', 'legal']
      },
      {
        id: 'risk_disclosure',
        name: '风险提示',
        description: '金融产品相关内容必须包含风险提示',
        severity: 'high',
        scenarios: ['marketing', 'financial', 'legal']
      },
      {
        id: 'brand_consistency',
        name: '品牌一致性',
        description: '确保品牌名称、产品名称等使用正确且一致',
        severity: 'high',
        scenarios: ['general', 'marketing', 'product', 'legal']
      }
    ];
  }

  /**
   * 获取完整的样式指南配置
   */
  public getConfig(): StyleGuideConfig {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config;
  }

  /**
   * 获取所有场景
   */
  public getScenarios(): Scenario[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.scenarios;
  }

  /**
   * 获取特定场景
   * @param scenarioId 场景ID
   */
  public getScenario(scenarioId: string): Scenario | undefined {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.scenarios.find(s => s.id === scenarioId);
  }

  /**
   * 获取所有术语
   */
  public getTerms(): Term[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.terms;
  }

  /**
   * 获取特定场景的术语
   * @param scenarioId 场景ID
   */
  public getTermsForScenario(scenarioId: string): Term[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.terms.filter(term => term.scenarios.includes(scenarioId));
  }

  /**
   * 获取所有禁用词
   */
  public getForbiddenWords(): ForbiddenWord[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.forbiddenRules.forbidden_words;
  }

  /**
   * 获取特定场景的禁用词
   * @param scenarioId 场景ID
   */
  public getForbiddenWordsForScenario(scenarioId: string): ForbiddenWord[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.forbiddenRules.forbidden_words.filter(word => 
      word.scenarios.includes(scenarioId));
  }

  /**
   * 获取所有语法规则
   */
  public getGrammarRules(): GrammarRule[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.forbiddenRules.grammar_rules;
  }

  /**
   * 获取特定场景的语法规则
   * @param scenarioId 场景ID
   */
  public getGrammarRulesForScenario(scenarioId: string): GrammarRule[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.forbiddenRules.grammar_rules.filter(rule => 
      rule.scenarios.includes(scenarioId));
  }

  /**
   * 获取所有政策
   */
  public getPolicies(): Policy[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.policies;
  }

  /**
   * 获取特定场景的政策
   * @param scenarioId 场景ID
   */
  public getPoliciesForScenario(scenarioId: string): Policy[] {
    if (!this.initialized || !this.config) {
      throw new Error('样式指南尚未初始化');
    }
    return this.config.policies.filter(policy => 
      policy.scenarios.includes(scenarioId));
  }
}

// 导出单例实例
export const styleGuideLoader = StyleGuideLoader.getInstance();
