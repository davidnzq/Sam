// 场景定义接口
export interface Scenario {
  id: string;
  name: string;
  description: string;
  priority: number;
}

// 术语定义接口
export interface Term {
  term: string;
  standard: string;
  alternatives: string[];
  explanation: string;
  category: string;
  scenarios: string[];
}

// 禁用词定义接口
export interface ForbiddenWord {
  word: string;
  reason: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  scenarios: string[];
}

// 语法规则定义接口
export interface GrammarRule {
  id: string;
  description: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  scenarios: string[];
}

// 政策定义接口
export interface Policy {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  scenarios: string[];
}

// 禁用词与规则集合
export interface ForbiddenRules {
  forbidden_words: ForbiddenWord[];
  grammar_rules: GrammarRule[];
}

// 文案校验结果
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  originalText: string;
  optimizedText?: string;
  policyHits: PolicyHit[];
}

// 验证问题
export interface ValidationIssue {
  type: 'forbidden_word' | 'grammar_rule' | 'term_inconsistency' | 'policy_violation';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  position?: {
    start: number;
    end: number;
  };
  suggestion?: string;
  ruleId?: string;
}

// 政策命中记录
export interface PolicyHit {
  policyId: string;
  policyName: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 文案优化选项
export interface OptimizeOptions {
  scenario: string;
  strictMode: boolean;
  text: string;
}

// 文案优化结果
export interface OptimizeResult {
  originalText: string;
  optimizedText: string;
  changes: TextChange[];
  policyHits: PolicyHit[];
}

// 文本变更
export interface TextChange {
  type: 'replacement' | 'suggestion' | 'correction';
  original: string;
  replacement: string;
  position: {
    start: number;
    end: number;
  };
  reason: string;
}

// 样式指南配置
export interface StyleGuideConfig {
  scenarios: Scenario[];
  terms: Term[];
  forbiddenRules: ForbiddenRules;
  policies: Policy[];
}
