/**
 * LongPort AI 助手 - 错误处理工具
 */

// 错误类型枚举
export enum ErrorType {
  API_NOT_CONFIGURED = 'API_NOT_CONFIGURED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  SCRIPT_INJECTION_ERROR = 'SCRIPT_INJECTION_ERROR',
  MESSAGE_ERROR = 'MESSAGE_ERROR',
  RESPONSE_ERROR = 'RESPONSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  details?: string;
  suggestion?: string;
}

// 错误处理类
export class ErrorHandler {
  // 根据错误类型获取用户友好的错误信息
  static getErrorInfo(error: any): ErrorInfo {
    // API未配置
    if (error === ErrorType.API_NOT_CONFIGURED || error === 'API_NOT_CONFIGURED') {
      return {
        type: ErrorType.API_NOT_CONFIGURED,
        message: 'API 未配置',
        details: '请先在设置页面配置 API 地址和密钥',
        suggestion: '点击"前往设置"按钮进行配置'
      };
    }
    
    // 网络错误
    if (error instanceof Error && (error.message.includes('network') || error.message.includes('fetch'))) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: '网络连接错误',
        details: '无法连接到 API 服务器，请检查网络连接',
        suggestion: '请确保您的网络连接正常，然后重试'
      };
    }
    
    // API错误
    if (typeof error === 'string' && error.startsWith('API错误:')) {
      const statusCode = error.split(':')[1]?.trim();
      return {
        type: ErrorType.API_ERROR,
        message: `API 服务器错误 (${statusCode})`,
        details: '服务器返回了错误响应',
        suggestion: '请稍后重试，或联系管理员检查 API 服务状态'
      };
    }
    
    // 超时错误
    if (error instanceof Error && error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT_ERROR,
        message: '请求超时',
        details: 'API 请求响应时间过长',
        suggestion: '请稍后重试，或检查网络连接'
      };
    }
    
    // 权限错误
    if (error instanceof Error && error.message.includes('permission')) {
      return {
        type: ErrorType.PERMISSION_ERROR,
        message: '权限错误',
        details: '扩展程序缺少必要的权限',
        suggestion: '请在扩展管理页面检查权限设置'
      };
    }
    
    // 连接错误
    if (error === ErrorType.CONNECTION_ERROR || 
        (typeof error === 'string' && (
          error.includes('connection') || 
          error.includes('Could not establish connection') ||
          error.includes('Receiving end does not exist')
        ))) {
      return {
        type: ErrorType.CONNECTION_ERROR,
        message: '通信连接错误',
        details: '无法建立扩展内部组件之间的连接',
        suggestion: '请刷新页面或重新加载扩展后重试'
      };
    }
    
    // 脚本注入错误
    if (error === ErrorType.SCRIPT_INJECTION_ERROR || 
        (error instanceof Error && error.message.includes('script'))) {
      return {
        type: ErrorType.SCRIPT_INJECTION_ERROR,
        message: '脚本注入错误',
        details: '无法在当前页面注入内容脚本',
        suggestion: '请检查当前页面是否允许扩展程序运行'
      };
    }
    
    // 消息错误
    if (error === ErrorType.MESSAGE_ERROR || 
        (error instanceof Error && error.message.includes('message'))) {
      return {
        type: ErrorType.MESSAGE_ERROR,
        message: '消息传递错误',
        details: '扩展内部组件之间的消息传递失败',
        suggestion: '请刷新页面或重新启动浏览器后重试'
      };
    }
    
    // 响应错误
    if (error === ErrorType.RESPONSE_ERROR || 
        (error instanceof Error && error.message.includes('response'))) {
      return {
        type: ErrorType.RESPONSE_ERROR,
        message: '响应处理错误',
        details: '无法处理服务器响应',
        suggestion: '请稍后重试，如果问题持续存在，请联系管理员'
      };
    }
    
    // 未知错误
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: '发生未知错误',
      details: error instanceof Error ? error.message : String(error),
      suggestion: '请重试，如果问题持续存在，请联系管理员'
    };
  }
  
  // 记录错误日志
  static logError(error: any): void {
    const errorInfo = this.getErrorInfo(error);
    // 使用JSON.stringify确保对象被正确序列化
    console.error('[LongPort AI 助手] 错误:', JSON.stringify(errorInfo, null, 2));
    
    // 也输出原始错误对象，方便调试
    if (error instanceof Error) {
      console.error('[LongPort AI 助手] 原始错误:', error.message, error.stack);
    } else if (typeof error === 'object') {
      console.error('[LongPort AI 助手] 原始错误:', JSON.stringify(error, null, 2));
    } else {
      console.error('[LongPort AI 助手] 原始错误:', error);
    }
    
    // 可以在这里添加更多错误处理逻辑，如错误上报等
  }
  
  // 处理连接错误
  static handleConnectionError(error: any, retryCallback?: () => void): ErrorInfo {
    const errorInfo = this.getErrorInfo(error);
    this.logError(error);
    
    // 如果是连接错误并且提供了重试回调，则尝试重试
    if (errorInfo.type === ErrorType.CONNECTION_ERROR && retryCallback) {
      console.log('[LongPort AI 助手] 尝试重新连接...');
      setTimeout(retryCallback, 500); // 延迟500ms后重试
    }
    
    return errorInfo;
  }
  
  // 重试函数
  static retry<T>(fn: () => Promise<T>, maxRetries: number = 3, delay: number = 500): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const attempt = (attemptCount: number) => {
        fn()
          .then(resolve)
          .catch((error) => {
            if (attemptCount < maxRetries) {
              console.log(`[LongPort AI 助手] 重试 ${attemptCount + 1}/${maxRetries}...`);
              setTimeout(() => attempt(attemptCount + 1), delay * Math.pow(2, attemptCount)); // 指数退避
            } else {
              reject(error);
            }
          });
      };
      
      attempt(0);
    });
  }
}

// 导出错误处理相关内容
export default ErrorHandler;
