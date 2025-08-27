// 设置页面脚本 - LongPort AI 助手 v1.3.1
document.addEventListener('DOMContentLoaded', function() {
  console.log('LongPort AI 助手设置页面加载完成');
  
  // 加载保存的设置
  loadSettings();
  
  // 绑定事件
  bindEvents();
});

// 绑定事件
function bindEvents() {
  console.log('绑定事件监听器...');
  
  // 公司内部 API 相关事件
  const saveCompanyApiBtn = document.getElementById('saveCompanyApi');
  const testCompanyApiBtn = document.getElementById('testCompanyApi');
  const resetToDefaultBtn = document.getElementById('resetToDefault');
  
  // 快捷键设置相关事件
  const editShowAiPopupBtn = document.getElementById('edit-show-ai-popup');
  const editOptimizeSelectionBtn = document.getElementById('edit-optimize-selection');
  const resetShortcutsBtn = document.getElementById('reset-shortcuts');
  
  if (editShowAiPopupBtn) {
    editShowAiPopupBtn.addEventListener('click', () => editShortcut('show-ai-popup'));
    console.log('✅ 绑定编辑弹窗快捷键按钮');
  }
  
  if (editOptimizeSelectionBtn) {
    editOptimizeSelectionBtn.addEventListener('click', () => editShortcut('optimize-selection'));
    console.log('✅ 绑定编辑优化快捷键按钮');
  }
  
  if (resetShortcutsBtn) {
    resetShortcutsBtn.addEventListener('click', resetShortcutSettings);
    console.log('✅ 绑定重置快捷键按钮');
  }
  
  if (saveCompanyApiBtn) {
    saveCompanyApiBtn.addEventListener('click', saveCompanyApiSettings);
    console.log('✅ 绑定公司 API 保存按钮');
  }
  
  if (testCompanyApiBtn) {
    testCompanyApiBtn.addEventListener('click', testCompanyApiConnection);
    console.log('✅ 绑定公司 API 测试按钮');
  }
  
  if (resetToDefaultBtn) {
    resetToDefaultBtn.addEventListener('click', resetToDefault);
    console.log('✅ 绑定重置默认按钮');
  }
  
  // AI 文案优化测试相关事件
  const startTestBtn = document.getElementById('startTest');
  const clearTestBtn = document.getElementById('clearTest');
  const loadSampleTextBtn = document.getElementById('loadSampleText');
  const copyOptimizedBtn = document.getElementById('copyOptimized');
  const newTestBtn = document.getElementById('newTest');
  const exportResultBtn = document.getElementById('exportResult');
  
  if (startTestBtn) {
    startTestBtn.addEventListener('click', startAITest);
    console.log('✅ 绑定开始测试按钮');
  }
  
  if (clearTestBtn) {
    clearTestBtn.addEventListener('click', clearTestContent);
    console.log('✅ 绑定清空内容按钮');
  }
  
  if (loadSampleTextBtn) {
    loadSampleTextBtn.addEventListener('click', loadSampleText);
    console.log('✅ 绑定加载示例文案按钮');
  }
  
  if (copyOptimizedBtn) {
    copyOptimizedBtn.addEventListener('click', copyOptimizedResult);
    console.log('✅ 绑定复制结果按钮');
  }
  
  if (newTestBtn) {
    newTestBtn.addEventListener('click', startNewTest);
    console.log('✅ 绑定新测试按钮');
  }
  
  if (exportResultBtn) {
    exportResultBtn.addEventListener('click', exportTestResult);
    console.log('✅ 绑定导出结果按钮');
  }
  
  console.log('事件绑定完成');
}

// 加载保存的设置
async function loadSettings() {
  console.log('加载保存的设置...');
  
  try {
    const result = await chrome.storage.sync.get([
      'companyApiUrl',
      'companyApiKey',
      'shortcuts'
    ]);
    
    console.log('从存储中获取的配置:', result);
    
    // 设置默认值
    const defaultCompanyUrl = 'https://lboneapi.longbridge-inc.com/';
    const defaultCompanyKey = 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM';
    
    // 填充公司内部 API 表单
    const companyApiUrlInput = document.getElementById('companyApiUrl');
    const companyApiKeyInput = document.getElementById('companyApiKey');
    
    if (companyApiUrlInput) {
      companyApiUrlInput.value = result.companyApiUrl || defaultCompanyUrl;
    }
    
    if (companyApiKeyInput) {
      companyApiKeyInput.value = result.companyApiKey || defaultCompanyKey;
    }
    
    // 加载快捷键设置
    loadShortcutSettings(result.shortcuts);
    
    // 更新当前配置显示
    updateCurrentConfigDisplay(result);
    
    console.log('✅ 设置加载完成');
    
  } catch (error) {
    console.error('❌ 加载设置失败:', error);
    showStatus('companyApiStatus', '加载设置失败: ' + error.message, 'error');
  }
}

// 更新当前配置信息显示
function updateCurrentConfigDisplay(result) {
  const currentCompanyApi = document.getElementById('currentCompanyApi');
  const apiStatus = document.getElementById('apiStatus');
  
  if (currentCompanyApi) {
    if (result.companyApiUrl && result.companyApiKey) {
      currentCompanyApi.textContent = '已配置';
      currentCompanyApi.className = 'status success';
    } else {
      currentCompanyApi.textContent = '未配置';
      currentCompanyApi.className = 'status warning';
    }
  }
  
  if (apiStatus) {
    if (result.companyApiUrl && result.companyApiKey) {
      apiStatus.textContent = '公司内部 AI 已就绪';
      apiStatus.className = 'status success';
    } else {
      apiStatus.textContent = '需要配置公司内部 AI';
      apiStatus.className = 'status warning';
    }
  }
}

// 保存公司内部 API 设置
async function saveCompanyApiSettings() {
  console.log('保存公司内部 API 设置...');
  
  const url = document.getElementById('companyApiUrl')?.value?.trim();
  const key = document.getElementById('companyApiKey')?.value?.trim();
  
  if (!url || !key) {
    showStatus('companyApiStatus', '请填写完整的 API 信息', 'error');
    return;
  }
  
  try {
    await chrome.storage.sync.set({
      companyApiUrl: url,
      companyApiKey: key
    });
    
    showStatus('companyApiStatus', '公司内部 API 设置已保存', 'success');
    console.log('公司内部 API 设置保存成功');
    
    // 更新显示
    setTimeout(() => {
      loadSettings();
    }, 1000);
    
  } catch (error) {
    console.error('保存公司内部 API 设置失败:', error);
    showStatus('companyApiStatus', '保存设置失败: ' + error.message, 'error');
  }
}

// 重置为默认配置
async function resetToDefault() {
  console.log('重置为默认配置...');
  
  try {
    const defaultUrl = 'https://lboneapi.longbridge-inc.com/';
    const defaultKey = 'sk-7jSHih7SXoQcjMekQyTd3urc2G2BdtVzrzzdI6MotEpfWhyM';
    
    await chrome.storage.sync.set({
      companyApiUrl: defaultUrl,
      companyApiKey: defaultKey
    });
    
    showStatus('companyApiStatus', '已重置为默认配置', 'success');
    console.log('配置重置成功');
    
    // 更新显示
    setTimeout(() => {
      loadSettings();
    }, 1000);
    
  } catch (error) {
    console.error('重置配置失败:', error);
    showStatus('companyApiStatus', '重置配置失败: ' + error.message, 'error');
  }
}

// 测试公司内部 API 连接
async function testCompanyApiConnection() {
  console.log('测试公司内部 API 连接...');
  
  const url = document.getElementById('companyApiUrl')?.value?.trim();
  const key = document.getElementById('companyApiKey')?.value?.trim();
  
  if (!url || !key) {
    showStatus('companyApiStatus', '请先填写 API 信息', 'error');
    return;
  }
  
  const testBtn = document.getElementById('testCompanyApi');
  if (!testBtn) return;
  
  const originalText = testBtn.textContent;
  
  testBtn.disabled = true;
  testBtn.textContent = '测试中...';
  showStatus('companyApiStatus', '正在测试连接...', 'info');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: '测试连接',
      apiType: 'company',
      siteType: 'notion'
    });
    
    if (response && response.success) {
      showStatus('companyApiStatus', '连接成功！公司内部 API 工作正常', 'success');
    } else {
      const errorMsg = response?.error || '未知错误';
      showStatus('companyApiStatus', `连接失败: ${errorMsg}`, 'error');
    }
  } catch (error) {
    console.error('测试公司内部 API 连接失败:', error);
    showStatus('companyApiStatus', '测试连接失败，请检查网络和配置', 'error');
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = originalText;
  }
}

// 显示状态信息
function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn('状态显示元素不存在:', elementId);
    return;
  }
  
  element.textContent = message;
  element.className = `status ${type}`;
  element.style.display = 'block';
  
  // 自动隐藏成功和错误消息
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

// ==================== AI 文案优化测试功能 ====================

// 开始 AI 测试
async function startAITest() {
  console.log('🚀 开始 AI 文案优化测试...');
  
  const inputText = document.getElementById('testInputText')?.value?.trim();
  const siteType = document.getElementById('testSiteType')?.value || 'general';
  const optimizationType = document.getElementById('testOptimizationType')?.value || 'deep_optimization';
  
  if (!inputText) {
    alert('请输入需要优化的文案内容');
    return;
  }
  
  if (inputText.length < 10) {
    alert('文案内容太短，建议输入至少10个字符');
    return;
  }
  
  if (inputText.length > 1000) {
    alert('文案内容太长，建议不超过1000个字符');
    return;
  }
  
  // 显示测试状态
  showTestStatus();
  
  // 记录开始时间
  const startTime = Date.now();
  
  try {
    // 调用 AI 进行优化
    const response = await chrome.runtime.sendMessage({
      action: 'callAI',
      text: inputText,
      apiType: 'company',
      siteType: siteType,
      optimizationType: optimizationType
    });
    
    // 计算处理时间
    const processingTime = Date.now() - startTime;
    
    console.log('AI 响应:', response);
    
    if (response && response.success) {
      // 安全地获取优化后的文本 - 支持多种可能的字段名
      let optimizedText = '';
      
      // 按优先级尝试不同的字段
      if (response.optimizedText && typeof response.optimizedText === 'string' && response.optimizedText.trim().length > 0) {
        optimizedText = response.optimizedText;
      } else if (response.result && typeof response.result === 'string' && response.result.trim().length > 0) {
        optimizedText = response.result;
      } else if (response.text && typeof response.text === 'string' && response.text.trim().length > 0) {
        optimizedText = response.text;
      } else if (response.optimized_text && typeof response.optimized_text === 'string' && response.optimized_text.trim().length > 0) {
        optimizedText = response.optimized_text;
      } else if (response.data && typeof response.data === 'string' && response.data.trim().length > 0) {
        optimizedText = response.data;
      }
      
      // 检查是否成功获取到优化文本
      if (optimizedText && optimizedText.trim().length > 0) {
        // 显示优化结果
        showTestResult(inputText, optimizedText, processingTime, siteType);
      } else {
        // 优化结果为空或无效
        console.error('❌ AI返回的优化结果为空或格式无效');
        console.error('❌ 响应对象:', response);
        console.error('❌ 响应类型:', typeof response);
        console.error('❌ 响应键:', Object.keys(response || {}));
        
        // 构建详细的错误信息
        let errorDetails = 'AI 返回的优化结果为空或格式无效';
        if (response && typeof response === 'object') {
          errorDetails += `\n响应类型: ${typeof response}`;
          errorDetails += `\n响应键: ${Object.keys(response).join(', ')}`;
          if (response.optimizedText !== undefined) {
            errorDetails += `\noptimizedText: ${typeof response.optimizedText} - ${response.optimizedText}`;
          }
          if (response.result !== undefined) {
            errorDetails += `\nresult: ${typeof response.result} - ${response.result}`;
          }
          if (response.text !== undefined) {
            errorDetails += `\ntext: ${typeof response.text} - ${response.text}`;
          }
        }
        
        showTestError(inputText, errorDetails, processingTime);
      }
    } else {
      // 显示错误结果
      const errorMessage = response?.error || response?.message || 'AI 优化失败';
      showTestError(inputText, errorMessage, processingTime);
    }
    
  } catch (error) {
    console.error('❌ AI 测试失败:', error);
    const processingTime = Date.now() - startTime;
    showTestError(inputText, `测试失败: ${error.message}`, processingTime);
  }
}

// 显示测试状态
function showTestStatus() {
  const testStatus = document.getElementById('testStatus');
  const inputSection = document.querySelector('.input-section');
  const resultSection = document.querySelector('.result-section');
  
  if (testStatus) testStatus.style.display = 'block';
  if (inputSection) inputSection.style.display = 'none';
  if (resultSection) resultSection.style.display = 'none';
  
  // 更新状态消息
  updateStatusMessage('正在调用公司内部 AI 进行文案优化...');
}

// 更新状态消息
function updateStatusMessage(message) {
  const statusMessage = document.getElementById('statusMessage');
  if (statusMessage) {
    statusMessage.textContent = message;
  }
}

// 显示测试结果
function showTestResult(originalText, optimizedText, processingTime, siteType) {
  console.log('✅ 显示测试结果:', { originalText, optimizedText, processingTime, siteType });
  
  // 验证参数
  if (!originalText || typeof originalText !== 'string') {
    console.error('❌ 原始文本无效:', originalText);
    showTestError('', '原始文本无效', processingTime);
    return;
  }
  
  if (!optimizedText || typeof optimizedText !== 'string') {
    console.error('❌ 优化后文本无效:', optimizedText);
    showTestError(originalText, '优化后文本无效', processingTime);
    return;
  }
  
  // 隐藏测试状态
  const testStatus = document.getElementById('testStatus');
  if (testStatus) testStatus.style.display = 'none';
  
  // 显示结果区域
  const resultSection = document.querySelector('.result-section');
  if (resultSection) resultSection.style.display = 'block';
  
  // 安全地填充原始文案
  const originalTextEl = document.getElementById('originalText');
  const originalLengthEl = document.getElementById('originalLength');
  if (originalTextEl) originalTextEl.textContent = originalText;
  if (originalLengthEl) originalLengthEl.textContent = `${originalText.length} 字符`;
  
  // 安全地填充优化后文案
  const optimizedTextEl = document.getElementById('optimizedText');
  const optimizedLengthEl = document.getElementById('optimizedLength');
  if (optimizedTextEl) optimizedTextEl.textContent = optimizedText;
  if (optimizedLengthEl) optimizedLengthEl.textContent = `${optimizedText.length} 字符`;
  
  // 更新优化状态
  const optimizationStatusEl = document.getElementById('optimizationStatus');
  if (optimizationStatusEl) {
    optimizationStatusEl.textContent = '优化完成';
    optimizationStatusEl.style.background = '#f0fdf4';
    optimizationStatusEl.style.color = '#166534';
  }
  
  // 分析优化效果
  analyzeOptimizationEffect(originalText, optimizedText, processingTime, siteType);
  
  // 启用结果操作按钮
  const copyOptimizedBtn = document.getElementById('copyOptimized');
  const exportResultBtn = document.getElementById('exportResult');
  if (copyOptimizedBtn) copyOptimizedBtn.disabled = false;
  if (exportResultBtn) exportResultBtn.disabled = false;
}

// 显示测试错误
function showTestError(originalText, errorMessage, processingTime) {
  console.log('❌ 显示测试错误:', { originalText, errorMessage, processingTime });
  
  // 确保错误信息是字符串
  const safeErrorMessage = typeof errorMessage === 'string' ? errorMessage : String(errorMessage);
  console.log('❌ 安全错误信息:', safeErrorMessage);
  
  // 隐藏测试状态
  const testStatus = document.getElementById('testStatus');
  if (testStatus) testStatus.style.display = 'none';
  
  // 显示结果区域
  const resultSection = document.querySelector('.result-section');
  if (resultSection) resultSection.style.display = 'block';
  
  // 安全地填充原始文案
  const originalTextEl = document.getElementById('originalText');
  const originalLengthEl = document.getElementById('originalLength');
  if (originalTextEl) originalTextEl.textContent = originalText || '无原始文案';
  if (originalLengthEl) originalLengthEl.textContent = `${originalText ? originalText.length : 0} 字符`;
  
  // 显示错误信息
  const optimizedTextEl = document.getElementById('optimizedText');
  const optimizedLengthEl = document.getElementById('optimizedLength');
  if (optimizedTextEl) optimizedTextEl.textContent = `❌ ${safeErrorMessage}`;
  if (optimizedLengthEl) optimizedLengthEl.textContent = '0 字符';
  
  // 更新优化状态
  const optimizationStatusEl = document.getElementById('optimizationStatus');
  if (optimizationStatusEl) {
    optimizationStatusEl.textContent = '优化失败';
    optimizationStatusEl.style.background = '#fef2f2';
    optimizationStatusEl.style.color = '#dc2626';
  }
  
  // 显示错误详情
  showErrorDetails(errorMessage, processingTime);
  
  // 禁用结果操作按钮
  const copyOptimizedBtn = document.getElementById('copyOptimized');
  const exportResultBtn = document.getElementById('exportResult');
  if (copyOptimizedBtn) copyOptimizedBtn.disabled = true;
  if (exportResultBtn) exportResultBtn.disabled = true;
}

// 分析优化效果
function analyzeOptimizationEffect(originalText, optimizedText, processingTime, siteType) {
  console.log('🔍 分析优化效果...');
  
  // 验证参数
  if (!originalText || typeof originalText !== 'string' || !optimizedText || typeof optimizedText !== 'string') {
    console.error('❌ 分析优化效果失败：参数无效', { originalText, optimizedText });
    showAnalysisError('参数无效，无法分析优化效果');
    return;
  }
  
  try {
    // 文本长度对比
    const lengthComparison = document.getElementById('lengthComparison');
    if (lengthComparison) {
      const lengthDiff = optimizedText.length - originalText.length;
      const lengthRatio = (optimizedText.length / originalText.length * 100).toFixed(1);
      
      if (lengthDiff > 0) {
        lengthComparison.textContent = `+${lengthDiff} 字符 (+${lengthRatio}%)`;
      } else if (lengthDiff < 0) {
        lengthComparison.textContent = `${lengthDiff} 字符 (${lengthRatio}%)`;
      } else {
        lengthComparison.textContent = '无变化 (100%)';
      }
    }
    
    // 语法改进分析
    const grammarImprovements = document.getElementById('grammarImprovements');
    if (grammarImprovements) {
      const improvements = analyzeGrammarImprovements(originalText, optimizedText);
      grammarImprovements.textContent = improvements;
    }
    
    // 表达优化分析
    const expressionImprovements = document.getElementById('expressionImprovements');
    if (expressionImprovements) {
      const improvements = analyzeExpressionImprovements(originalText, optimizedText);
      expressionImprovements.textContent = improvements;
    }
    
    // 处理时间
    const processingTimeEl = document.getElementById('processingTime');
    if (processingTimeEl) {
      processingTimeEl.textContent = `${processingTime}ms`;
    }
    
  } catch (error) {
    console.error('❌ 分析优化效果时发生错误:', error);
    showAnalysisError(`分析失败: ${error.message}`);
  }
}

// 显示分析错误
function showAnalysisError(errorMessage) {
  const lengthComparison = document.getElementById('lengthComparison');
  const grammarImprovements = document.getElementById('grammarImprovements');
  const expressionImprovements = document.getElementById('expressionImprovements');
  const processingTime = document.getElementById('processingTime');
  
  if (lengthComparison) lengthComparison.textContent = '分析失败';
  if (grammarImprovements) grammarImprovements.textContent = '分析失败';
  if (expressionImprovements) expressionImprovements.textContent = '分析失败';
  if (processingTime) processingTime.textContent = '未知';
}

// 分析语法改进
function analyzeGrammarImprovements(originalText, optimizedText) {
  try {
    // 简单的语法改进检测
    const improvements = [];
    
    // 检查标点符号改进
    const originalPunctuation = (originalText.match(/[，。！？；：""''（）【】]/g) || []).length;
    const optimizedPunctuation = (optimizedText.match(/[，。！？；：""''（）【】]/g) || []).length;
    
    if (optimizedPunctuation > originalPunctuation) {
      improvements.push('标点符号规范化');
    }
    
    // 检查空格改进
    const originalSpaces = (originalText.match(/\s+/g) || []).length;
    const optimizedSpaces = (optimizedText.match(/\s+/g) || []).length;
    
    if (originalSpaces > optimizedSpaces) {
      improvements.push('多余空格清理');
    }
    
    // 检查重复字符
    const originalRepeats = (originalText.match(/(.)\1{2,}/g) || []).length;
    const optimizedRepeats = (optimizedText.match(/(.)\1{2,}/g) || []).length;
    
    if (originalRepeats > optimizedRepeats) {
      improvements.push('重复字符修正');
    }
    
    return improvements.length > 0 ? improvements.join('、') : '无明显改进';
  } catch (error) {
    console.error('❌ 分析语法改进失败:', error);
    return '分析失败';
  }
}

// 分析表达优化
function analyzeExpressionImprovements(originalText, optimizedText) {
  try {
    const improvements = [];
    
    // 检查句子长度优化
    const originalSentences = originalText.split(/[。！？]/).filter(s => s.trim().length > 0);
    const optimizedSentences = optimizedText.split(/[。！？]/).filter(s => s.trim().length > 0);
    
    if (originalSentences.length > 0 && optimizedSentences.length > 0) {
      const originalAvgLength = originalSentences.reduce((sum, s) => sum + s.length, 0) / originalSentences.length;
      const optimizedAvgLength = optimizedSentences.reduce((sum, s) => sum + s.length, 0) / optimizedSentences.length;
      
      if (Math.abs(optimizedAvgLength - originalAvgLength) > 5) {
        improvements.push('句式结构优化');
      }
    }
    
    // 检查词汇丰富度
    const originalWords = originalText.split(/[\s，。！？；：""''（）【】]/).filter(w => w.trim().length > 0);
    const optimizedWords = optimizedText.split(/[\s，。！？；：""''（）【】]/).filter(w => w.trim().length > 0);
    
    if (originalWords.length > 0 && optimizedWords.length > 0) {
      const originalUniqueWords = new Set(originalWords).size;
      const optimizedUniqueWords = new Set(optimizedWords).size;
      
      if (optimizedUniqueWords > originalUniqueWords) {
        improvements.push('词汇表达丰富化');
      }
    }
    
    return improvements.length > 0 ? improvements.join('、') : '表达更加清晰';
  } catch (error) {
    console.error('❌ 分析表达优化失败:', error);
    return '分析失败';
  }
}

// 显示错误详情
function showErrorDetails(errorMessage, processingTime) {
  // 文本长度对比
  const lengthComparison = document.getElementById('lengthComparison');
  if (lengthComparison) lengthComparison.textContent = '无法计算';
  
  // 语法改进
  const grammarImprovements = document.getElementById('grammarImprovements');
  if (grammarImprovements) grammarImprovements.textContent = '优化失败';
  
  // 表达优化
  const expressionImprovements = document.getElementById('expressionImprovements');
  if (expressionImprovements) expressionImprovements.textContent = '优化失败';
  
  // 处理时间
  const processingTimeEl = document.getElementById('processingTime');
  if (processingTimeEl) processingTimeEl.textContent = `${processingTime}ms`;
}

// 清空测试内容
function clearTestContent() {
  console.log('🗑️ 清空测试内容...');
  
  const testInputText = document.getElementById('testInputText');
  if (testInputText) testInputText.value = '';
  
  // 隐藏结果区域
  const resultSection = document.querySelector('.result-section');
  if (resultSection) resultSection.style.display = 'none';
  
  // 隐藏测试状态
  const testStatus = document.getElementById('testStatus');
  if (testStatus) testStatus.style.display = 'none';
  
  // 显示输入区域
  const inputSection = document.querySelector('.input-section');
  if (inputSection) inputSection.style.display = 'block';
}

// 加载示例文案
function loadSampleText() {
  console.log('📋 加载示例文案...');
  
  const sampleTexts = {
    longport: `投资理财需要谨慎，我们要做好风险控制。首先，要了解自己的风险承受能力，然后选择合适的投资产品。其次，要分散投资，不要把鸡蛋放在一个篮子里。最后，要定期评估投资组合的表现，及时调整策略。`,
    notion: `项目管理的核心是团队协作和进度控制。首先，我们需要明确项目目标和范围，制定详细的项目计划。其次，要建立有效的沟通机制，确保团队成员之间的信息同步。最后，要建立监控和反馈机制，及时发现和解决问题。`,
    general: `写作是一门艺术，需要不断的练习和改进。首先，我们要多读书，积累丰富的词汇和表达方式。其次，要勤于写作，在实践中提高写作技巧。最后，要善于反思和总结，从错误中学习，不断进步。`
  };
  
  const siteType = document.getElementById('testSiteType')?.value || 'general';
  const testInputText = document.getElementById('testInputText');
  
  if (testInputText) {
    testInputText.value = sampleTexts[siteType] || sampleTexts.general;
  }
}

// 复制优化结果
async function copyOptimizedResult() {
  console.log('📋 复制优化结果...');
  
  const optimizedText = document.getElementById('optimizedText')?.textContent;
  
  if (!optimizedText || optimizedText.startsWith('❌')) {
    alert('没有可复制的优化结果');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(optimizedText);
    alert('优化结果已复制到剪贴板！');
  } catch (error) {
    console.error('复制失败:', error);
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = optimizedText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('优化结果已复制到剪贴板！');
  }
}

// 开始新测试
function startNewTest() {
  console.log('🆕 开始新测试...');
  
  // 清空输入
  const testInputText = document.getElementById('testInputText');
  if (testInputText) testInputText.value = '';
  
  // 重置选项
  const testSiteType = document.getElementById('testSiteType');
  const testOptimizationType = document.getElementById('testOptimizationType');
  if (testSiteType) testSiteType.value = 'longport';
  if (testOptimizationType) testOptimizationType.value = 'deep_optimization';
  
  // 隐藏结果区域
  const resultSection = document.querySelector('.result-section');
  if (resultSection) resultSection.style.display = 'none';
  
  // 显示输入区域
  const inputSection = document.querySelector('.input-section');
  if (inputSection) inputSection.style.display = 'block';
}

// 导出测试结果
function exportTestResult() {
  console.log('💾 导出测试结果...');
  
  const originalText = document.getElementById('originalText')?.textContent;
  const optimizedText = document.getElementById('optimizedText')?.textContent;
  
  if (!originalText || !optimizedText || optimizedText.startsWith('❌')) {
    alert('没有可导出的测试结果');
    return;
  }
  
  const exportData = {
    timestamp: new Date().toISOString(),
    originalText: originalText,
    optimizedText: optimizedText,
    originalLength: originalText.length,
    optimizedLength: optimizedText.length,
    siteType: document.getElementById('testSiteType')?.value || 'general',
    optimizationType: document.getElementById('testOptimizationType')?.value || 'deep_optimization'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-optimization-result-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('测试结果已导出！');
}

// ==================== 快捷键设置功能 ====================

// 加载快捷键设置
async function loadShortcutSettings(savedShortcuts) {
  console.log('加载快捷键设置...');
  
  try {
    // 获取 manifest.json 中的默认快捷键
    const manifest = await fetch(chrome.runtime.getURL('manifest.json'))
      .then(response => response.json())
      .catch(() => null);
    
    // 默认快捷键设置
    const defaultShortcuts = {
      'show-ai-popup': {
        default: manifest?.commands?.['show-ai-popup']?.suggested_key?.default || 'Alt+Shift+1',
        mac: manifest?.commands?.['show-ai-popup']?.suggested_key?.mac || 'Alt+Shift+1'
      },
      'optimize-selection': {
        default: manifest?.commands?.['optimize-selection']?.suggested_key?.default || 'Alt+O',
        mac: manifest?.commands?.['optimize-selection']?.suggested_key?.mac || 'Alt+O'
      }
    };
    
    console.log('默认快捷键设置:', defaultShortcuts);
    console.log('保存的快捷键设置:', savedShortcuts);
    
    // 合并保存的快捷键和默认快捷键
    const shortcuts = savedShortcuts || defaultShortcuts;
    
    // 更新快捷键显示
    updateShortcutDisplay('show-ai-popup-shortcut', shortcuts['show-ai-popup']);
    updateShortcutDisplay('optimize-selection-shortcut', shortcuts['optimize-selection']);
    
    console.log('✅ 快捷键设置加载完成');
    
  } catch (error) {
    console.error('❌ 加载快捷键设置失败:', error);
  }
}

// 更新快捷键显示
function updateShortcutDisplay(elementId, shortcut) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? shortcut.mac : shortcut.default;
  
  element.textContent = shortcutKey;
}

// 编辑快捷键
function editShortcut(commandId) {
  console.log('编辑快捷键:', commandId);
  
  // 获取当前快捷键
  const shortcutElement = document.getElementById(`${commandId}-shortcut`);
  if (!shortcutElement) return;
  
  const currentShortcut = shortcutElement.textContent;
  
  // 弹出对话框
  const newShortcut = prompt(
    `请输入新的快捷键组合 (当前: ${currentShortcut})\n\n` +
    '要求:\n' +
    '- 必须包含修饰键 (Alt、Ctrl/Command、Shift)\n' +
    '- 不能使用单个按键\n' +
    '- 避免使用浏览器已占用的快捷键\n' +
    '- 格式示例: Alt+Shift+L、Ctrl+K、Alt+1\n\n' +
    '注意: 修改后需要重启浏览器才能生效',
    currentShortcut
  );
  
  if (!newShortcut || newShortcut === currentShortcut) {
    console.log('快捷键未更改');
    return;
  }
  
  // 验证快捷键格式
  if (!validateShortcut(newShortcut)) {
    alert('快捷键格式无效，请确保包含修饰键 (Alt、Ctrl/Command、Shift)');
    return;
  }
  
  // 更新显示
  shortcutElement.textContent = newShortcut;
  
  // 保存到 Chrome 存储
  saveShortcutSettings(commandId, newShortcut);
}

// 验证快捷键格式
function validateShortcut(shortcut) {
  // 检查是否包含修饰键
  const hasModifier = 
    shortcut.includes('Alt+') || 
    shortcut.includes('Ctrl+') || 
    shortcut.includes('Command+') || 
    shortcut.includes('Shift+');
  
  // 检查是否包含键名
  const hasKey = shortcut.split('+').length > 1;
  
  return hasModifier && hasKey;
}

// 保存快捷键设置
async function saveShortcutSettings(commandId, newShortcut) {
  console.log('保存快捷键设置:', commandId, newShortcut);
  
  try {
    // 获取当前快捷键设置
    const result = await chrome.storage.sync.get(['shortcuts']);
    const shortcuts = result.shortcuts || {};
    
    // 更新快捷键
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    if (!shortcuts[commandId]) {
      shortcuts[commandId] = { default: newShortcut, mac: newShortcut };
    } else {
      if (isMac) {
        shortcuts[commandId].mac = newShortcut;
      } else {
        shortcuts[commandId].default = newShortcut;
      }
    }
    
    // 保存更新后的快捷键设置
    await chrome.storage.sync.set({ shortcuts });
    
    // 提示用户需要重启浏览器
    alert('快捷键已更新！请重启浏览器或在 chrome://extensions/shortcuts 页面手动设置以使更改生效。');
    
    console.log('✅ 快捷键设置保存成功');
    
  } catch (error) {
    console.error('❌ 保存快捷键设置失败:', error);
    alert('保存快捷键设置失败: ' + error.message);
  }
}

// 重置快捷键设置
async function resetShortcutSettings() {
  console.log('重置快捷键设置...');
  
  try {
    // 获取 manifest.json 中的默认快捷键
    const manifest = await fetch(chrome.runtime.getURL('manifest.json'))
      .then(response => response.json())
      .catch(() => null);
    
    if (!manifest || !manifest.commands) {
      throw new Error('无法获取默认快捷键设置');
    }
    
    // 默认快捷键设置
    const defaultShortcuts = {
      'show-ai-popup': {
        default: manifest.commands['show-ai-popup']?.suggested_key?.default || 'Alt+Shift+1',
        mac: manifest.commands['show-ai-popup']?.suggested_key?.mac || 'Alt+Shift+1'
      },
      'optimize-selection': {
        default: manifest.commands['optimize-selection']?.suggested_key?.default || 'Alt+O',
        mac: manifest.commands['optimize-selection']?.suggested_key?.mac || 'Alt+O'
      }
    };
    
    // 保存默认快捷键设置
    await chrome.storage.sync.set({ shortcuts: defaultShortcuts });
    
    // 更新显示
    updateShortcutDisplay('show-ai-popup-shortcut', defaultShortcuts['show-ai-popup']);
    updateShortcutDisplay('optimize-selection-shortcut', defaultShortcuts['optimize-selection']);
    
    alert('已重置为默认快捷键设置！请重启浏览器或在 chrome://extensions/shortcuts 页面手动设置以使更改生效。');
    
    console.log('✅ 快捷键设置重置成功');
    
  } catch (error) {
    console.error('❌ 重置快捷键设置失败:', error);
    alert('重置快捷键设置失败: ' + error.message);
  }
}
