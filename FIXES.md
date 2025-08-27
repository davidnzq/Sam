# 问题修复说明

## 🐛 已修复的问题

### 1. JSON 解析错误
**问题描述**: `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`

**原因**: 当 API 返回 HTML 页面而不是 JSON 响应时，`response.json()` 会失败

**修复方案**:
- 在 `background.js` 中添加了响应内容类型检查
- 如果返回非 JSON 内容，会给出明确的错误提示
- 添加了更好的错误处理和网络请求失败检测

**修复代码**:
```javascript
// 检查响应内容类型
const contentType = response.headers.get('content-type');
if (contentType && contentType.includes('application/json')) {
  const result = await response.json();
  return result.optimized_text || result.text || '无法获取优化结果';
} else {
  // 如果不是 JSON，尝试解析文本
  const text = await response.text();
  console.warn('API 返回非 JSON 响应:', text.substring(0, 200));
  throw new Error('API 返回格式错误，期望 JSON 响应');
}
```

### 2. 右键菜单不显示弹窗
**问题描述**: 在 Notion 页面中选择文本，右键点击后没有出现 AI 弹窗

**原因**: 
- 内联的 `onclick` 事件在内容脚本中不工作
- 事件绑定时机不正确
- 缺少调试信息

**修复方案**:
- 移除了所有内联的 `onclick` 事件
- 改用 `addEventListener` 绑定事件
- 调整了事件绑定的时机
- 添加了详细的调试日志

**修复代码**:
```javascript
// 绑定事件
function bindEvents() {
  const closeBtn = aiPopup.querySelector('#closeBtn');
  const replaceBtn = aiPopup.querySelector('#replaceBtn');
  const retryBtn = aiPopup.querySelector('#retryBtn');
  const cancelBtn = aiPopup.querySelector('#cancelBtn');

  // 关闭按钮
  closeBtn.addEventListener('click', () => {
    aiPopup.remove();
    aiPopup = null;
  });

  // 取消按钮
  cancelBtn.addEventListener('click', () => {
    aiPopup.remove();
    aiPopup = null;
  });

  // 其他按钮事件...
}
```

### 3. 调试信息不足
**问题描述**: 出现问题时难以定位具体原因

**修复方案**:
- 在 `background.js` 和 `content.js` 中添加了详细的 console.log
- 添加了 ping 消息机制来测试插件状态
- 创建了调试页面 `debug.html` 来帮助排查问题

## 🔧 新增功能

### 1. 调试页面
创建了 `debug.html` 页面，可以：
- 测试插件是否正常安装
- 检查右键菜单功能
- 验证内容脚本加载状态
- 提供常见问题排查指南

### 2. 增强的错误处理
- 网络请求失败检测
- API 响应格式验证
- 详细的错误信息提示

### 3. 状态监控
- 插件安装状态检查
- 内容脚本加载状态
- API 连接状态监控

## 📋 测试步骤

### 1. 重新安装插件
1. 在 Chrome 扩展管理页面中删除旧版本
2. 重新加载修复后的插件
3. 确保插件状态显示为"已启用"

### 2. 测试右键菜单
1. 打开 `debug.html` 页面
2. 选择任意文本
3. 右键点击，应该看到"AI 辅助协作"选项
4. 点击后应该出现 AI 弹窗

### 3. 测试 API 调用
1. 在设置页面配置 API 密钥
2. 测试连接功能
3. 在 Notion 页面中测试完整的 AI 功能

## 🚨 注意事项

### 1. 图标文件
- 需要将 `icons/` 目录中的占位符文件替换为真实的 PNG 图标
- 图标尺寸：16x16, 48x48, 128x128

### 2. API 配置
- 公司内部 API 需要正确的 URL 和密钥
- OpenAI API 需要有效的 API 密钥
- 建议先测试连接再使用

### 3. 权限问题
- 确保插件有访问 Notion 页面的权限
- 检查 `manifest.json` 中的权限配置

## 🔍 故障排除

### 如果右键菜单仍然不显示：
1. 检查浏览器控制台是否有错误信息
2. 确认插件已启用
3. 检查页面是否匹配 `https://*.notion.so/*` 模式
4. 尝试刷新页面

### 如果弹窗不出现：
1. 检查内容脚本是否正确注入
2. 查看控制台的调试信息
3. 确认消息传递是否正常

### 如果 API 调用失败：
1. 检查网络连接
2. 验证 API 配置
3. 查看控制台的详细错误信息

## 📝 更新日志

### v1.0.1 (修复版本)
- 修复 JSON 解析错误
- 修复右键菜单弹窗问题
- 添加详细的调试信息
- 改进错误处理机制
- 创建调试页面
- 优化事件绑定逻辑

---

**修复完成后，建议删除此 FIXES.md 文件**
