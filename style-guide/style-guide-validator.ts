import {
  ValidationResult,
  ValidationIssue,
  OptimizeOptions,
  PolicyHit,
  ForbiddenWord,
  GrammarRule,
  Term,
  Policy
} from './types';
import { styleGuideLoader } from './style-guide-loader';

/**
 * 样式指南验证器
 * 负责根据样式指南验证文案内容
 */
export class StyleGuideValidator {
  private static instance: StyleGuideValidator;

  private constructor() {
    // 私有构造函数，防止直接实例化
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): StyleGuideValidator {
    if (!StyleGuideValidator.instance) {
      StyleGuideValidator.instance = new StyleGuideValidator();
    }
    return StyleGuideValidator.instance;
  }

  /**
   * 验证文案是否符合样式指南
   * @param text 要验证的文案
   * @param scenarioId 场景ID
   * @param strictMode 是否启用严格模式
   */
  public validate(text: string, scenarioId: string, strictMode: boolean = false): ValidationResult {
    const issues: ValidationIssue[] = [];
    const policyHits: PolicyHit[] = [];

    // 检查禁用词
    const forbiddenWordIssues = this.checkForbiddenWords(text, scenarioId, strictMode);
    issues.push(...forbiddenWordIssues);

    // 检查语法规则
    const grammarRuleIssues = this.checkGrammarRules(text, scenarioId, strictMode);
    issues.push(...grammarRuleIssues);

    // 检查术语一致性
    const termIssues = this.checkTermConsistency(text, scenarioId);
    issues.push(...termIssues);

    // 检查政策合规
    const { policyIssues, hits } = this.checkPolicyCompliance(text, scenarioId, strictMode);
    issues.push(...policyIssues);
    policyHits.push(...hits);

    // 确定验证结果
    const valid = issues.length === 0 || 
      (strictMode ? !issues.some(i => i.severity === 'critical') : true);

    return {
      valid,
      issues,
      originalText: text,
      policyHits
    };
  }

  /**
   * 检查禁用词
   * @param text 要检查的文本
   * @param scenarioId 场景ID
   * @param strictMode 是否启用严格模式
   */
  private checkForbiddenWords(text: string, scenarioId: string, strictMode: boolean): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const forbiddenWords = styleGuideLoader.getForbiddenWordsForScenario(scenarioId);

    for (const forbiddenWord of forbiddenWords) {
      // 如果非严格模式且严重程度为低或中，则跳过
      if (!strictMode && (forbiddenWord.severity === 'low' || forbiddenWord.severity === 'medium')) {
        continue;
      }

      // 查找所有匹配
      const regex = new RegExp(forbiddenWord.word, 'g');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        issues.push({
          type: 'forbidden_word',
          message: `禁用词: "${forbiddenWord.word}" - ${forbiddenWord.reason}`,
          severity: forbiddenWord.severity,
          position: {
            start: match.index,
            end: match.index + forbiddenWord.word.length
          },
          suggestion: forbiddenWord.suggestion
        });
      }
    }

    return issues;
  }

  /**
   * 检查语法规则
   * @param text 要检查的文本
   * @param scenarioId 场景ID
   * @param strictMode 是否启用严格模式
   */
  private checkGrammarRules(text: string, scenarioId: string, strictMode: boolean): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const grammarRules = styleGuideLoader.getGrammarRulesForScenario(scenarioId);

    for (const rule of grammarRules) {
      // 如果非严格模式且严重程度为低或中，则跳过
      if (!strictMode && (rule.severity === 'low' || rule.severity === 'medium')) {
        continue;
      }

      // 查找所有匹配
      const regex = new RegExp(rule.pattern, 'g');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        issues.push({
          type: 'grammar_rule',
          message: `语法规则: ${rule.description}`,
          severity: rule.severity,
          position: {
            start: match.index,
            end: match.index + match[0].length
          },
          ruleId: rule.id
        });
      }
    }

    return issues;
  }

  /**
   * 检查术语一致性
   * @param text 要检查的文本
   * @param scenarioId 场景ID
   */
  private checkTermConsistency(text: string, scenarioId: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const terms = styleGuideLoader.getTermsForScenario(scenarioId);

    for (const term of terms) {
      // 检查是否使用了非标准术语
      for (const alternative of term.alternatives) {
        const regex = new RegExp(alternative, 'g');
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          issues.push({
            type: 'term_inconsistency',
            message: `术语不一致: 使用 "${alternative}" 替代标准术语 "${term.standard}"`,
            severity: 'medium',
            position: {
              start: match.index,
              end: match.index + alternative.length
            },
            suggestion: term.standard
          });
        }
      }
    }

    return issues;
  }

  /**
   * 检查政策合规
   * @param text 要检查的文本
   * @param scenarioId 场景ID
   * @param strictMode 是否启用严格模式
   */
  private checkPolicyCompliance(
    text: string, 
    scenarioId: string, 
    strictMode: boolean
  ): { policyIssues: ValidationIssue[], hits: PolicyHit[] } {
    const policyIssues: ValidationIssue[] = [];
    const hits: PolicyHit[] = [];
    const policies = styleGuideLoader.getPoliciesForScenario(scenarioId);

    // 这里简单实现一些政策检查逻辑
    // 实际应用中可能需要更复杂的逻辑或调用AI服务
    
    // 检查不承诺收益政策
    const noGuaranteePolicy = policies.find(p => p.id === 'no_guarantee');
    if (noGuaranteePolicy) {
      const guaranteeTerms = [
        '保证收益', '稳赚不赔', '必赚', '肯定赚', '绝对收益',
        '稳定回报', '确保盈利', '百分百', '100%', '零风险'
      ];
      
      for (const term of guaranteeTerms) {
        if (text.includes(term)) {
          policyIssues.push({
            type: 'policy_violation',
            message: `违反政策 "${noGuaranteePolicy.name}": 不得使用承诺性表述`,
            severity: noGuaranteePolicy.severity,
            position: {
              start: text.indexOf(term),
              end: text.indexOf(term) + term.length
            },
            suggestion: '投资有风险，请谨慎决策'
          });
          
          hits.push({
            policyId: noGuaranteePolicy.id,
            policyName: noGuaranteePolicy.name,
            description: noGuaranteePolicy.description,
            severity: noGuaranteePolicy.severity
          });
          
          break;
        }
      }
    }
    
    // 检查风险提示政策
    const riskDisclosurePolicy = policies.find(p => p.id === 'risk_disclosure');
    if (riskDisclosurePolicy && scenarioId === 'financial') {
      const riskTerms = ['风险', '亏损', '损失', '波动', '不确定'];
      const hasRiskDisclosure = riskTerms.some(term => text.includes(term));
      
      if (!hasRiskDisclosure && text.length > 50) {
        policyIssues.push({
          type: 'policy_violation',
          message: `违反政策 "${riskDisclosurePolicy.name}": 金融内容缺少风险提示`,
          severity: riskDisclosurePolicy.severity,
          suggestion: '请添加适当的风险提示语'
        });
        
        hits.push({
          policyId: riskDisclosurePolicy.id,
          policyName: riskDisclosurePolicy.name,
          description: riskDisclosurePolicy.description,
          severity: riskDisclosurePolicy.severity
        });
      }
    }

    return { policyIssues, hits };
  }
}

// 导出单例实例
export const styleGuideValidator = StyleGuideValidator.getInstance();
