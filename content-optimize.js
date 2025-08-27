// 文案优化UI组件
class ContentOptimizer {
  constructor() {
    this.container = null;
    this.contentEl = null;
    this.selectedScenario = 'general';
    this.strictMode = false;
    this.optimizing = false;
  }
  
  // 初始化
  async initialize() {
    // 创建UI
    this.createUI();
    
    // 加载用户设置
    await this.loadSettings();
    
    // 绑定事件
    this.bindEvents();
  }
  
  // 创建UI
  createUI() {
    // 创建容器
    this.container = document.createElement('div');
    this.container.className = 'content-optimizer';
    this.container.setAttribute('data-yiyuan-skip', '1');
    this.container.style.display = 'none';
    
    // 创建内容
    this.container.innerHTML = `
      <div class="optimizer-header">
        <h3 class="optimizer-title">文案优化</h3>
        <button class="optimizer-close">&times;</button>
      </div>
      <div class="optimizer-content">
        <div class="optimizer-settings">
          <div class="setting-group">
            <label for="scenario-select">场景：</label>
            <select id="scenario-select" class="scenario-select">
              <option value="general">通用场景</option>
              <option value="marketing">营销文案</option>
              <option value="product">产品说明</option>
              <option value="legal">法律合规</option>
              <option value="financial">金融专业</option>
            </select>
          </div>
          <div class="setting-group">
            <label for="strict-mode">严格边界：</label>
            <label class="switch">
              <input type="checkbox" id="strict-mode">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
        
        <div class="optimizer-input-area">
          <textarea class="optimizer-input" placeholder="请输入需要优化的文案内容..."></textarea>
        </div>
        
        <div class="optimizer-buttons">
          <button class="optimizer-button optimize-btn">优化文案</button>
          <button class="optimizer-button reset-btn">重置</button>
        </div>
        
        <div class="optimizer-result-area" style="display: none;">
          <div class="result-header">
            <h4>优化结果</h4>
            <button class="copy-result-btn">复制</button>
          </div>
          <div class="optimizer-result"></div>
          
          <div class="policy-hits-container" style="display: none;">
            <h4>政策命中 <span class="policy-hits-count">(0)</span></h4>
            <div class="policy-hits-list"></div>
          </div>
        </div>
        
        <div class="optimizer-loading" style="display: none;">
          <div class="spinner"></div>
          <div class="loading-text">正在优化中...</div>
        </div>
      </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .content-optimizer {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 600px;
        max-width: 90vw;
        max-height: 90vh;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .optimizer-header {
        padding: 16px 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
      }
      
      .optimizer-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
      
      .optimizer-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        line-height: 1;
      }
      
      .optimizer-content {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      
      .optimizer-settings {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .setting-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .scenario-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }
      
      /* 开关样式 */
      .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
      }
      
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .4s;
      }
      
      input:checked + .slider {
        background-color: #4caf50;
      }
      
      input:focus + .slider {
        box-shadow: 0 0 1px #4caf50;
      }
      
      input:checked + .slider:before {
        transform: translateX(20px);
      }
      
      .slider.round {
        border-radius: 24px;
      }
      
      .slider.round:before {
        border-radius: 50%;
      }
      
      .optimizer-input-area {
        margin-bottom: 20px;
      }
      
      .optimizer-input {
        width: 100%;
        min-height: 120px;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        line-height: 1.5;
        resize: vertical;
      }
      
      .optimizer-buttons {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }
      
      .optimizer-button {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .optimize-btn {
        background: #4caf50;
        color: white;
        flex: 3;
      }
      
      .optimize-btn:hover {
        background: #45a049;
      }
      
      .reset-btn {
        background: #f5f5f5;
        color: #333;
        flex: 1;
      }
      
      .reset-btn:hover {
        background: #e8e8e8;
      }
      
      .optimizer-result-area {
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 20px;
      }
      
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      
      .result-header h4 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
      
      .copy-result-btn {
        padding: 6px 12px;
        background: #f0f0f0;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }
      
      .copy-result-btn:hover {
        background: #e0e0e0;
      }
      
      .optimizer-result {
        background: #f9f9f9;
        padding: 12px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 1.6;
        white-space: pre-wrap;
      }
      
      .policy-hits-container {
        margin-top: 20px;
        border-top: 1px solid #eee;
        padding-top: 16px;
      }
      
      .policy-hits-container h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #333;
        display: flex;
        align-items: center;
      }
      
      .policy-hits-count {
        font-size: 14px;
        color: #666;
        margin-left: 8px;
      }
      
      .policy-hit-item {
        padding: 10px;
        border-left: 3px solid;
        background: #f9f9f9;
        margin-bottom: 8px;
        border-radius: 0 4px 4px 0;
      }
      
      .policy-hit-item.critical {
        border-left-color: #f44336;
      }
      
      .policy-hit-item.high {
        border-left-color: #ff9800;
      }
      
      .policy-hit-item.medium {
        border-left-color: #2196f3;
      }
      
      .policy-hit-item.low {
        border-left-color: #4caf50;
      }
      
      .policy-hit-name {
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .policy-hit-description {
        font-size: 13px;
        color: #666;
      }
      
      .optimizer-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4caf50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-text {
        font-size: 14px;
        color: #666;
      }
    `;
    
    // 添加到页面
    document.head.appendChild(style);
    document.body.appendChild(this.container);
    
    // 保存内容元素的引用
    this.contentEl = this.container.querySelector('.optimizer-content');
  }
  
  // 加载设置
  async loadSettings() {
    try {
      const { selectedScenario, strictMode } = await chrome.storage.sync.get([
        'selectedScenario',
        'strictMode'
      ]);
      
      this.selectedScenario = selectedScenario || 'general';
      this.strictMode = strictMode || false;
      
      // 更新UI
      const scenarioSelect = document.getElementById('scenario-select');
      const strictModeCheckbox = document.getElementById('strict-mode');
      
      if (scenarioSelect) {
        scenarioSelect.value = this.selectedScenario;
      }
      
      if (strictModeCheckbox) {
        strictModeCheckbox.checked = this.strictMode;
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }
  
  // 保存设置
  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        selectedScenario: this.selectedScenario,
        strictMode: this.strictMode
      });
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }
  
  // 绑定事件
  bindEvents() {
    if (!this.container) return;
    
    // 关闭按钮
    const closeBtn = this.container.querySelector('.optimizer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
    
    // 场景选择
    const scenarioSelect = this.container.querySelector('#scenario-select');
    if (scenarioSelect) {
      scenarioSelect.addEventListener('change', () => {
        this.selectedScenario = scenarioSelect.value;
        this.saveSettings();
      });
    }
    
    // 严格模式开关
    const strictModeCheckbox = this.container.querySelector('#strict-mode');
    if (strictModeCheckbox) {
      strictModeCheckbox.addEventListener('change', () => {
        this.strictMode = strictModeCheckbox.checked;
        this.saveSettings();
      });
    }
    
    // 优化按钮
    const optimizeBtn = this.container.querySelector('.optimize-btn');
    if (optimizeBtn) {
      optimizeBtn.addEventListener('click', () => this.optimizeContent());
    }
    
    // 重置按钮
    const resetBtn = this.container.querySelector('.reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetForm());
    }
    
    // 复制结果按钮
    const copyBtn = this.container.querySelector('.copy-result-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyResult());
    }
  }
  
  // 显示优化器
  show() {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }
  
  // 隐藏优化器
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
  
  // 优化内容
  async optimizeContent() {
    if (!this.container || this.optimizing) return;
    
    // 获取输入内容
    const inputEl = this.container.querySelector('.optimizer-input');
    const text = inputEl?.value.trim();
    
    if (!text) {
      this.showMessage('请输入需要优化的文案内容', 'error');
      return;
    }
    
    // 显示加载状态
    this.showLoading(true);
    this.optimizing = true;
    
    try {
      // 准备优化选项
      const options = {
        text,
        scenario: this.selectedScenario,
        strictMode: this.strictMode
      };
      
      // 调用优化服务
      const response = await chrome.runtime.sendMessage({
        action: 'optimizeText',
        options
      });
      
      if (response.ok && response.data) {
        // 显示结果
        this.showResult(response.data);
      } else {
        throw new Error(response.error || '优化失败');
      }
    } catch (error) {
      console.error('优化失败:', error);
      this.showMessage(`优化失败: ${error.message || '未知错误'}`, 'error');
    } finally {
      // 隐藏加载状态
      this.showLoading(false);
      this.optimizing = false;
    }
  }
  
  // 显示结果
  showResult(result) {
    if (!this.container) return;
    
    // 获取结果区域
    const resultArea = this.container.querySelector('.optimizer-result-area');
    const resultEl = this.container.querySelector('.optimizer-result');
    const policyHitsContainer = this.container.querySelector('.policy-hits-container');
    const policyHitsList = this.container.querySelector('.policy-hits-list');
    const policyHitsCount = this.container.querySelector('.policy-hits-count');
    
    if (!resultArea || !resultEl) return;
    
    // 显示优化后的内容
    resultEl.textContent = result.optimizedText;
    resultArea.style.display = 'block';
    
    // 显示政策命中
    if (result.policyHits && result.policyHits.length > 0) {
      policyHitsContainer.style.display = 'block';
      policyHitsCount.textContent = `(${result.policyHits.length})`;
      
      // 清空现有内容
      policyHitsList.innerHTML = '';
      
      // 添加政策命中项
      result.policyHits.forEach(hit => {
        const hitItem = document.createElement('div');
        hitItem.className = `policy-hit-item ${hit.severity}`;
        hitItem.innerHTML = `
          <div class="policy-hit-name">${hit.policyName}</div>
          <div class="policy-hit-description">${hit.description}</div>
        `;
        policyHitsList.appendChild(hitItem);
      });
    } else {
      policyHitsContainer.style.display = 'none';
    }
  }
  
  // 重置表单
  resetForm() {
    if (!this.container) return;
    
    // 重置输入
    const inputEl = this.container.querySelector('.optimizer-input');
    if (inputEl) {
      inputEl.value = '';
    }
    
    // 隐藏结果区域
    const resultArea = this.container.querySelector('.optimizer-result-area');
    if (resultArea) {
      resultArea.style.display = 'none';
    }
  }
  
  // 复制结果
  copyResult() {
    if (!this.container) return;
    
    const resultEl = this.container.querySelector('.optimizer-result');
    if (!resultEl || !resultEl.textContent) return;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(resultEl.textContent)
      .then(() => {
        this.showMessage('已复制到剪贴板', 'success');
      })
      .catch(err => {
        console.error('复制失败:', err);
        this.showMessage('复制失败', 'error');
      });
  }
  
  // 显示加载状态
  showLoading(show) {
    if (!this.container) return;
    
    const loadingEl = this.container.querySelector('.optimizer-loading');
    if (loadingEl) {
      loadingEl.style.display = show ? 'flex' : 'none';
    }
  }
  
  // 显示消息
  showMessage(message, type) {
    const messageEl = document.createElement('div');
    messageEl.className = `optimizer-message optimizer-message-${type}`;
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.padding = '12px 20px';
    messageEl.style.borderRadius = '6px';
    messageEl.style.color = 'white';
    messageEl.style.fontWeight = '500';
    messageEl.style.zIndex = '999999';
    messageEl.style.animation = 'slideIn 0.3s ease';
    
    if (type === 'success') {
      messageEl.style.background = '#4caf50';
    } else {
      messageEl.style.background = '#f44336';
    }
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }
}

// 创建并导出实例
const contentOptimizer = new ContentOptimizer();

// 初始化
(async function() {
  try {
    await contentOptimizer.initialize();
    console.log('文案优化器初始化成功');
  } catch (error) {
    console.error('文案优化器初始化失败:', error);
  }
})();

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showOptimizer') {
    contentOptimizer.show();
  } else if (message.action === 'hideOptimizer') {
    contentOptimizer.hide();
  } else if (message.action === 'optimizeText') {
    contentOptimizer.show();
    
    // 填充文本
    const inputEl = document.querySelector('.optimizer-input');
    if (inputEl && message.text) {
      inputEl.value = message.text;
    }
  }
});

// 监听自定义事件
document.addEventListener('showOptimizer', () => {
  contentOptimizer.show();
});

document.addEventListener('hideOptimizer', () => {
  contentOptimizer.hide();
});

document.addEventListener('optimizeText', (event) => {
  contentOptimizer.show();
  
  // 填充文本
  const inputEl = document.querySelector('.optimizer-input');
  if (inputEl && event.detail && event.detail.text) {
    inputEl.value = event.detail.text;
  }
});
