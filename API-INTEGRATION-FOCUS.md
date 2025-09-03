# API 集成优化文档 - 聚焦于 AI 能力

## 修改目的

根据产品文档中的「基础文本优化实现机制」要求，我们需要确保文本优化功能严格基于 API 的 AI 能力实现，而不是依赖本地硬编码的备用方案。本次修改旨在移除所有本地备用处理逻辑，确保系统完全依赖 API 的 AI 能力进行文本优化。

## 修改内容

### 1. 恢复完整的 API 请求格式

根据产品文档中的基础文本优化机制要求，我们恢复了完整的 API 请求格式，确保包含所有必要的优化维度和原则：

```typescript
// 准备请求数据 - 按照产品文档中的基础文本优化机制要求构造请求
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
```

### 2. 移除本地备用处理逻辑

移除了在 API 调用失败时切换到本地处理的逻辑，确保系统完全依赖 API：

```typescript
// 检查是否是HTML响应
if (responseText.trim().toLowerCase().startsWith('<!doctype') || 
    responseText.trim().toLowerCase().startsWith('<html')) {
  console.warn('[测试页面] API返回了HTML内容，可能是错误页面或登录页面');
  // 返回错误，不使用备用方案
  throw new Error('API返回了HTML内容而非JSON数据，请检查API配置');
}
```

```typescript
// 尝试将文本解析为JSON
try {
  data = JSON.parse(responseText);
} catch (jsonError) {
  console.error('[测试页面] 解析JSON失败:', jsonError);
  // 返回错误，不使用备用方案
  throw new Error(`无法解析API响应: ${jsonError instanceof Error ? jsonError.message : '未知错误'}`);
}
```

### 3. 强化错误处理

改进了错误处理逻辑，确保在 API 调用失败时返回明确的错误信息，而不是静默降级到本地处理：

```typescript
// 如果是超时错误
if (apiError instanceof DOMException && apiError.name === 'AbortError') {
  throw new Error('请求超时，请检查网络连接或API服务器状态');
}

// 重新抛出错误，不使用备用方案
throw apiError;
```

```typescript
// 返回错误，不使用备用方案
return {
  success: false,
  error: error instanceof Error ? error.message : '未知错误'
};
```

## 调试方法

为了确保 API 调用成功，可以通过以下步骤进行调试：

1. 打开浏览器开发者工具的网络面板
2. 在测试页面执行文本优化
3. 查找对 API 端点的 POST 请求
4. 检查请求载荷是否包含完整的优化维度和原则
5. 检查响应内容是否符合预期格式

如果 API 调用失败，系统会返回明确的错误信息，而不是使用本地备用方案。这样可以帮助用户更好地理解和解决 API 配置问题。

## API 请求格式

根据产品文档中的基础文本优化实现机制，API 请求应包含以下内容：

```json
{
  "text": "用户输入的原始文本",
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

API 响应应包含以下内容：

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

## 配置要求

为了确保 API 调用成功，需要正确配置以下内容：

1. **API 端点**：必须是一个有效的 URL，指向能够处理文本优化请求的 API 服务
2. **API 密钥**：必须是有效的认证密钥，用于访问 API 服务
3. **网络连接**：确保网络连接正常，能够访问 API 服务器

## 故障排除

如果 API 调用失败，可能有以下原因：

1. **API 配置错误**：检查 API 端点和密钥是否正确
2. **网络问题**：检查网络连接是否正常
3. **API 服务器问题**：检查 API 服务器是否正常运行
4. **请求格式问题**：检查请求格式是否符合 API 要求
5. **响应格式问题**：检查 API 返回的响应格式是否符合预期

通过查看浏览器控制台中的错误信息，可以获取更详细的故障信息，帮助排查问题。
