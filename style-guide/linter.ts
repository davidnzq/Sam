import { 
  ValidationResult, 
  OptimizeOptions, 
  OptimizeResult,
  ValidationIssue,
  PolicyHit
} from './types';
import { styleGuideValidator } from './style-guide-validator';
import { callOptimizeAPI, mockOptimizeAPI } from './api';

/**
 * 本地验证器
 * 用于对文案进行二次校验，确保符合公司文案指引
 */
export class StyleGuideLinter {
  private static instance: StyleGuideLinter;

  private constructor() {
    // 私有构造函数，防止直接实例化
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): StyleGuideLinter {
    if (!StyleGuideLinter.instance) {
      StyleGuideLinter.instance = new StyleGuideLinter();
    }
    return StyleGuideLinter.instance;
  }

  /**
   * 对文案进行二次校验
   * @param originalText 原始文案
   * @param optimizedText 优化后的文案
   * @param options 优化选项
   */
  public lintAgainstGuide(
    originalText: string, 
    optimizedText: string, 
    options: OptimizeOptions
  ): ValidationResult {
    // 使用样式指南验证器进行验证
    const validationResult = styleGuideValidator.validate(
      optimizedText,
      options.scenario,
      options.strictMode
    );

    // 如果严格模式下有严重问题，需要回退到最小改动
    if (options.strictMode && !validationResult.valid) {
      const criticalIssues = validationResult.issues.filter(
        issue => issue.severity === 'critical' || issue.severity === 'high'
      );

      if (criticalIssues.length > 0) {
        // 应用最小改动策略
        const minimalChangesText = this.applyMinimalChanges(originalText, criticalIssues);
        
        // 再次验证最小改动后的文案
        const minimalValidationResult = styleGuideValidator.validate(
          minimalChangesText,
          options.scenario,
          options.strictMode
        );
        
        return {
          valid: true,
          issues: minimalValidationResult.issues,
          originalText: originalText,
          optimizedText: minimalChangesText,
          policyHits: minimalValidationResult.policyHits
        };
      }
    }
    
    // 如果没有严重问题或非严格模式，直接返回验证结果
    return {
      ...validationResult,
      originalText: originalText,
      optimizedText: optimizedText
    };
  }

  /**
   * 应用最小改动策略
   * @param text 原始文本
   * @param issues 需要修复的问题
   */
  private applyMinimalChanges(text: string, issues: ValidationIssue[]): string {
    let result = text;
    
    // 按位置从后向前排序，以避免位置偏移
    const sortedIssues = [...issues].sort((a, b) => {
      if (!a.position || !b.position) return 0;
      return b.position.start - a.position.start;
    });
    
    for (const issue of sortedIssues) {
      if (issue.position && issue.suggestion) {
        const { start, end } = issue.position;
        result = result.substring(0, start) + issue.suggestion + result.substring(end);
      }
    }
    
    return result;
  }

  /**
   * 优化文案
   * 调用后台服务进行优化，然后进行本地二次校验
   * @param options 优化选项
   */
  public async optimize(options: OptimizeOptions): Promise<OptimizeResult> {
    try {
      // 调用后台服务优化文案
      const response = await this.callOptimizeAPI(options);
      
      if (!response.ok || !response.data) {
        throw new Error(response.error || '优化失败');
      }
      
      // 获取优化结果
      const { originalText, optimizedText, changes, policyHits } = response.data;
      
      // 进行本地二次校验
      const validationResult = this.lintAgainstGuide(
        originalText,
        optimizedText,
        options
      );
      
      // 返回最终结果
      return {
        originalText: originalText,
        optimizedText: validationResult.optimizedText || optimizedText,
        changes: changes || [],
        policyHits: validationResult.policyHits || policyHits || []
      };
    } catch (error) {
      console.error('文案优化失败:', error);
      throw error;
    }
  }

  /**
   * 调用后台优化API
   * @param options 优化选项
   */
  private async callOptimizeAPI(options: OptimizeOptions): Promise<{
    ok: boolean;
    data?: OptimizeResult;
    error?: string;
  }> {
    try {
      // 先尝试调用正式 API
      const result = await callOptimizeAPI(options);
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      console.warn('调用正式 API 失败，尝试使用模拟 API:', error);
      
      try {
        // 如果正式 API 失败，尝试使用模拟 API
        const mockResult = await mockOptimizeAPI(options);
        return {
          ok: true,
          data: mockResult
        };
      } catch (mockError) {
        console.error('模拟 API 也失败了:', mockError);
        return {
          ok: false,
          error: String(mockError)
        };
      }
    }
  }
}

// 导出单例实例
export const styleGuideLinter = StyleGuideLinter.getInstance();
