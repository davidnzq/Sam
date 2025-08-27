# API 文件盘点与重构方案

## 现有 API 相关文件职责盘点

### API 相关文件

| 文件名 | 主要职责 | 保留/合并/弃用 |
| ------ | ------- | ------------ |
| `api-call-monitor.js` | 监控和记录 API 调用过程，测试不同场景和模型 | 保留（作为测试工具） |
| `api-connection-diagnosis.js` | 诊断 API 连接问题，测试网络连接和端点可用性 | 保留（作为诊断工具） |
| `api-response-debug.js` | 检查 API 的实际返回格式，调试响应内容 | 保留（作为调试工具） |
| `api-debug.js` | 诊断 API 调用问题，测试不同端点 | 合并到 `api-connection-diagnosis.js` |
| `api-functionality-verification.js` | 检查 API 调用功能代码逻辑完备性 | 保留（作为验证工具） |
| `api-fallback-test.js` | 验证多 API 调用机制和优先级 | 保留（作为备用方案测试） |

### 连接相关文件

| 文件名 | 主要职责 | 保留/合并/弃用 |
| ------ | ------- | ------------ |
| `connection-test.js` | 验证内容脚本和后台脚本的连接 | 保留 |
| `connection-fix-test.js` | 验证修复后的连接问题 | 合并到 `connection-test.js` |

## 新增文件

| 文件名 | 主要职责 |
| ------ | ------- |
| `api-contract.js` | 提供统一的 API 接口，包含 Mock 实现 |
| `api-types.d.ts` | 提供 API 接口的类型定义 |
| `comprehensive-api-test.js` | 测试 API 统一接口的功能 |

## 统一接口设计

### 核心接口

```javascript
// 优化文本
async function optimizeText(inputText): Promise<{text: string, reason?: string}>

// 测试连接
async function ping(): Promise<boolean>

// 事件订阅
function onOptimize(cb: (result) => void): () => void
```

### 接口实现策略

1. **Mock 优先**：提供 Mock 实现，确保 UI 可以并行开发
2. **多 API 备用方案**：公司内部 API → OpenAI → 豆包 → 模拟响应
3. **错误处理**：自动切换 API，确保服务可用性
4. **优先级机制**：优先使用公司内部 API，降低成本

## 运行自测步骤

### Node.js 环境

```bash
# 进入项目目录
cd /Users/david/Desktop/CB/Sam

# 运行测试脚本
node comprehensive-api-test.js
```

### 浏览器控制台

1. 打开浏览器开发者工具（F12 或右键 → 检查）
2. 切换到控制台标签页
3. 复制以下代码并执行：

```javascript
// 导入 API 接口
const apiContract = require('./api-contract');

// 测试 API 接口
apiContract.ping().then(connected => {
  console.log('API 连接状态:', connected);
  
  if (connected) {
    apiContract.optimizeText('这是一个测试文本').then(result => {
      console.log('优化结果:', result.text);
      console.log('优化原因:', result.reason);
    });
  }
});
```

## 下一步计划

1. **实现真实 API 调用**：在 Mock 基础上实现真实 API 调用
2. **添加错误处理**：完善错误处理和备用方案
3. **优化性能**：添加缓存机制，提升响应速度
4. **增强稳定性**：添加重试机制，提高调用成功率
