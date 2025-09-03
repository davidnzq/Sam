# API 集成文档

## 修复内容

本次修复主要解决了测试页面中 API 调用功能的问题。之前的实现中，测试页面使用的是模拟的文本处理逻辑，而没有真正调用外部 API。现在已经修改为严格按照产品文档中的基础文本优化实现机制执行，确保 API 的 AI 能力可用。

## 主要修改

### 1. 替换模拟 API 调用为真实 API 调用

将原来的模拟文本处理逻辑替换为真正的 API 调用实现：

```typescript
// 真实 API 调用
const startCallTime = Date.now();

// 检查 API 配置
if (!apiSettings.apiEndpoint || !apiSettings.apiKey) {
  throw new Error('API 未配置');
}

console.log(`[测试页面] 发起API调用，端点: ${apiSettings.apiEndpoint}`);

// 准备请求数据
const requestData = {
  text,
  isStrictMode,
  optimizationDimensions: {
    grammarCorrection: true,      // 语法校正
    punctuationNormalization: true, // 标点规范
    mixedTextFormatting: true,    // 中英混排规则
    styleRefinement: true,        // 语言风格
    toneControl: true             // 语调控制
  },
  optimizationPrinciples: {
    maintainSemantics: true,      // 保持与原文语义一致
    preserveLength: true,         // 字数相当（不大幅增减）
    enhanceClarity: true,         // 提升表达清晰度
    increaseProfessionalism: true // 提升专业性
  }
};

// 创建 AbortController 用于超时控制
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

try {
  // 发送真实API请求
  const response = await fetch(apiSettings.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiSettings.apiKey}`,
      'X-Request-ID': `test-${Date.now()}`,
      'X-Client-Version': '1.0.0'
    },
    body: JSON.stringify(requestData),
    signal: controller.signal
  });
  
  // 清除超时
  clearTimeout(timeoutId);
  
  // 检查响应状态
  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`);
  }
  
  // 验证响应内容类型
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('API返回了非JSON格式数据');
  }
  
  // 解析响应数据
  const data = await response.json();
  
  // 验证必要字段
  if (!data.optimizedText) {
    console.error('API响应缺少必要字段:', data);
    throw new Error('API响应缺少必要字段');
  }
  
  console.log(`[测试页面] API调用成功，返回优化文本`);
  
  // 使用API返回的优化文本
  const optimizedText = data.optimizedText;
```

### 2. 增强错误处理

改进了错误处理机制，更好地处理 API 调用过程中可能出现的各种错误：

```typescript
try {
  // API 调用代码...
} catch (apiError) {
  // 清除超时
  clearTimeout(timeoutId);
  
  console.error('[测试页面] API调用出错:', apiError);
  
  // 如果是超时错误
  if (apiError instanceof DOMException && apiError.name === 'AbortError') {
    throw new Error('请求超时，请稍后重试');
  }
  
  // 重新抛出错误
  throw apiError;
}
```

### 3. 优化性能监控

修复了性能监控中的计时问题，确保正确记录 API 调用的响应时间：

```typescript
// 记录响应完成
this.performanceMonitor.recordResponse(
  requestStartTime,
  true,
  Date.now() - startCallTime
);
```

## API 请求格式

测试页面现在发送的 API 请求格式如下：

```json
{
  "text": "用户输入的文本",
  "isStrictMode": false,
  "optimizationDimensions": {
    "grammarCorrection": true,
    "punctuationNormalization": true,
    "mixedTextFormatting": true,
    "styleRefinement": true,
    "toneControl": true
  },
  "optimizationPrinciples": {
    "maintainSemantics": true,
    "preserveLength": true,
    "enhanceClarity": true,
    "increaseProfessionalism": true
  }
}
```

## API 响应格式

测试页面期望的 API 响应格式如下：

```json
{
  "optimizedText": "优化后的文本内容",
  "stats": {
    "originalLength": 100,
    "optimizedLength": 102,
    "lengthDifference": 2,
    "percentageChange": 2
  }
}
```

其中 `optimizedText` 字段是必须的，其他字段可选。

## 使用说明

1. 在测试页面中输入需要优化的文本
2. 在设置中配置正确的 API 端点和密钥
3. 选择优化模式（基础/严格）
4. 点击"执行优化"按钮
5. 系统将调用 API 进行文本优化
6. 查看优化结果和性能指标

## 注意事项

1. API 端点必须支持 POST 请求
2. API 必须返回 JSON 格式的响应
3. 响应中必须包含 `optimizedText` 字段
4. API 调用有 30 秒的超时限制
5. 测试页面支持缓存功能，可通过开关控制

## 测试验证

可以通过以下步骤验证 API 调用是否正常工作：

1. 打开浏览器开发者工具的网络面板
2. 在测试页面执行文本优化
3. 观察是否有对 API 端点的请求
4. 检查请求的载荷和响应内容

如果一切正常，你应该能看到对 API 端点的请求，以及 API 返回的优化文本结果。
