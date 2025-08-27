// 导出所有样式指南相关的类型和功能
export * from './types';
export * from './style-guide-loader';
export * from './style-guide-validator';
export * from './linter';
export * from './api';

// 默认导出
import { styleGuideLinter } from './linter';
import { styleGuideLoader } from './style-guide-loader';
import { styleGuideValidator } from './style-guide-validator';

export default {
  linter: styleGuideLinter,
  loader: styleGuideLoader,
  validator: styleGuideValidator
};
