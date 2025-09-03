/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/options/options.css":
/*!*********************************!*\
  !*** ./src/options/options.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./src/options/index.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _options_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./options.css */ "./src/options/options.css");
/**
 * LongPort AI 助手 - 选项页脚本
 */

// 默认设置
const defaultSettings = {
    apiEndpoint: 'https://lboneapi.longbridge-inc.com', // 默认API地址
    apiKey: '',
    modelSelection: 'auto', // 默认自动模式
    strictMode: false,
    shortcuts: {
        optimize: {
            key: 'L', // 默认Ctrl+Shift+L
            altKey: false,
            ctrlKey: true,
            shiftKey: true,
            metaKey: false
        },
        replace: {
            key: ' ', // 默认空格键
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false
        }
    }
};
// 常见浏览器快捷键，用于冲突检测
const commonBrowserShortcuts = [
    { key: 'F', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+F (查找)
    { key: 'P', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+P (打印)
    { key: 'S', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+S (保存)
    { key: 'T', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+T (新标签页)
    { key: 'W', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+W (关闭标签页)
    { key: 'N', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+N (新窗口)
    { key: 'R', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+R (刷新)
    { key: 'Tab', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false }, // Ctrl+Tab (切换标签页)
];
// 格式化快捷键显示
function formatShortcut(shortcut) {
    const parts = [];
    if (shortcut.ctrlKey)
        parts.push('Ctrl');
    if (shortcut.altKey)
        parts.push('Alt');
    if (shortcut.shiftKey)
        parts.push('Shift');
    if (shortcut.metaKey)
        parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Win');
    // 特殊按键显示处理
    let keyDisplay = shortcut.key;
    if (shortcut.key === ' ')
        keyDisplay = '空格';
    if (shortcut.key === 'ArrowUp')
        keyDisplay = '↑';
    if (shortcut.key === 'ArrowDown')
        keyDisplay = '↓';
    if (shortcut.key === 'ArrowLeft')
        keyDisplay = '←';
    if (shortcut.key === 'ArrowRight')
        keyDisplay = '→';
    if (shortcut.key === 'Escape')
        keyDisplay = 'Esc';
    parts.push(keyDisplay);
    return parts.join(' + ');
}
// 检查快捷键冲突
function checkShortcutConflict(shortcut) {
    // 检查是否为空快捷键
    if (!shortcut.key) {
        return null;
    }
    // 检查浏览器常用快捷键冲突
    for (const browserShortcut of commonBrowserShortcuts) {
        if (shortcut.key === browserShortcut.key &&
            shortcut.ctrlKey === browserShortcut.ctrlKey &&
            shortcut.altKey === browserShortcut.altKey &&
            shortcut.shiftKey === browserShortcut.shiftKey &&
            shortcut.metaKey === browserShortcut.metaKey) {
            return '与浏览器快捷键冲突';
        }
    }
    // 检查两个快捷键之间的冲突
    const optimizeShortcut = currentSettings?.shortcuts?.optimize;
    const replaceShortcut = currentSettings?.shortcuts?.replace;
    if (optimizeShortcut && replaceShortcut) {
        // 检查优化快捷键和替换快捷键是否冲突
        if (shortcut !== optimizeShortcut &&
            shortcut !== replaceShortcut &&
            shortcut.key === optimizeShortcut.key &&
            shortcut.ctrlKey === optimizeShortcut.ctrlKey &&
            shortcut.altKey === optimizeShortcut.altKey &&
            shortcut.shiftKey === optimizeShortcut.shiftKey &&
            shortcut.metaKey === optimizeShortcut.metaKey) {
            return '与润色文本快捷键冲突';
        }
        if (shortcut !== replaceShortcut &&
            shortcut !== optimizeShortcut &&
            shortcut.key === replaceShortcut.key &&
            shortcut.ctrlKey === replaceShortcut.ctrlKey &&
            shortcut.altKey === replaceShortcut.altKey &&
            shortcut.shiftKey === replaceShortcut.shiftKey &&
            shortcut.metaKey === replaceShortcut.metaKey) {
            return '与替换文本快捷键冲突';
        }
    }
    return null;
}
// 当前设置
let currentSettings = null;
// 更新快捷键显示
function updateShortcutDisplay(type, shortcut) {
    const recorder = document.getElementById(`${type}ShortcutRecorder`);
    const display = document.getElementById(`${type}ShortcutDisplay`);
    const keyCombo = display?.querySelector('.shortcut-key-combo');
    const placeholder = document.getElementById(`${type}ShortcutPlaceholder`);
    const conflictElement = document.getElementById(`${type}ShortcutConflict`);
    if (!recorder || !display || !keyCombo || !placeholder || !conflictElement)
        return;
    // 检查是否有快捷键
    if (shortcut && shortcut.key) {
        // 显示快捷键
        recorder.classList.add('has-shortcut');
        // 创建快捷键显示元素
        keyCombo.innerHTML = '';
        // 添加修饰键
        if (shortcut.ctrlKey || shortcut.altKey || shortcut.shiftKey || shortcut.metaKey) {
            const modifiers = [];
            if (shortcut.ctrlKey)
                modifiers.push('Ctrl');
            if (shortcut.altKey)
                modifiers.push('Alt');
            if (shortcut.shiftKey)
                modifiers.push('Shift');
            if (shortcut.metaKey)
                modifiers.push(navigator.platform.includes('Mac') ? '⌘' : 'Win');
            modifiers.forEach((mod, index) => {
                const modKey = document.createElement('span');
                modKey.className = 'shortcut-key';
                modKey.textContent = mod;
                keyCombo.appendChild(modKey);
                if (index < modifiers.length - 1) {
                    const plus = document.createElement('span');
                    plus.className = 'shortcut-plus';
                    plus.textContent = '+';
                    keyCombo.appendChild(plus);
                }
            });
            // 添加加号
            const plus = document.createElement('span');
            plus.className = 'shortcut-plus';
            plus.textContent = '+';
            keyCombo.appendChild(plus);
        }
        // 添加主键
        const mainKey = document.createElement('span');
        mainKey.className = 'shortcut-key';
        // 特殊按键显示处理
        let keyDisplay = shortcut.key;
        if (shortcut.key === ' ')
            keyDisplay = '空格';
        if (shortcut.key === 'ArrowUp')
            keyDisplay = '↑';
        if (shortcut.key === 'ArrowDown')
            keyDisplay = '↓';
        if (shortcut.key === 'ArrowLeft')
            keyDisplay = '←';
        if (shortcut.key === 'ArrowRight')
            keyDisplay = '→';
        if (shortcut.key === 'Escape')
            keyDisplay = 'Esc';
        mainKey.textContent = keyDisplay;
        keyCombo.appendChild(mainKey);
        // 检查冲突
        const conflict = checkShortcutConflict(shortcut);
        if (conflict) {
            conflictElement.textContent = conflict;
            conflictElement.classList.add('show');
        }
        else {
            conflictElement.classList.remove('show');
        }
    }
    else {
        // 隐藏快捷键显示
        recorder.classList.remove('has-shortcut');
        conflictElement.classList.remove('show');
    }
}
// 设置快捷键录入模式
function setupShortcutRecorder(type) {
    const recorder = document.getElementById(`${type}ShortcutRecorder`);
    const clearBtn = document.getElementById(`${type}ShortcutClear`);
    if (!recorder || !clearBtn || !currentSettings)
        return;
    // 点击录入区域开始录入
    recorder.addEventListener('click', () => {
        // 添加录入中样式
        recorder.classList.add('recording');
        recorder.focus();
        // 显示提示
        const placeholder = document.getElementById(`${type}ShortcutPlaceholder`);
        if (placeholder) {
            placeholder.textContent = '请按下快捷键...';
        }
    });
    // 按键事件处理
    recorder.addEventListener('keydown', (e) => {
        // 阻止默认行为
        e.preventDefault();
        // 忽略单独的修饰键
        if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
            return;
        }
        // 创建新的快捷键
        const newShortcut = {
            key: e.key,
            ctrlKey: e.ctrlKey,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey
        };
        // 更新当前设置
        if (currentSettings) {
            if (type === 'optimize') {
                currentSettings.shortcuts.optimize = newShortcut;
            }
            else {
                currentSettings.shortcuts.replace = newShortcut;
            }
        }
        // 更新显示
        updateShortcutDisplay(type, newShortcut);
        // 移除录入中样式
        recorder.classList.remove('recording');
        // 失去焦点
        recorder.blur();
    });
    // 失去焦点时取消录入
    recorder.addEventListener('blur', () => {
        recorder.classList.remove('recording');
        // 恢复提示
        const placeholder = document.getElementById(`${type}ShortcutPlaceholder`);
        if (placeholder) {
            placeholder.textContent = '点击此处录入快捷键';
        }
    });
    // 清除按钮
    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        // 创建空快捷键
        const emptyShortcut = {
            key: '',
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false
        };
        // 更新当前设置
        if (currentSettings) {
            if (type === 'optimize') {
                currentSettings.shortcuts.optimize = emptyShortcut;
            }
            else {
                currentSettings.shortcuts.replace = emptyShortcut;
            }
        }
        // 更新显示
        updateShortcutDisplay(type, emptyShortcut);
    });
}
// 加载设置
function loadSettings() {
    chrome.storage.sync.get(defaultSettings, (items) => {
        const settings = items;
        currentSettings = settings;
        // 填充表单
        const apiEndpointInput = document.getElementById('apiEndpoint');
        const apiKeyInput = document.getElementById('apiKey');
        const modelSelectionSelect = document.getElementById('modelSelection');
        const strictModeCheckbox = document.getElementById('strictMode');
        if (apiEndpointInput)
            apiEndpointInput.value = settings.apiEndpoint;
        if (apiKeyInput)
            apiKeyInput.value = settings.apiKey;
        if (modelSelectionSelect)
            modelSelectionSelect.value = settings.modelSelection;
        if (strictModeCheckbox)
            strictModeCheckbox.checked = settings.strictMode;
        // 填充快捷键设置
        updateShortcutDisplay('optimize', settings.shortcuts.optimize);
        updateShortcutDisplay('replace', settings.shortcuts.replace);
    });
}
// 保存设置
function saveSettings() {
    const apiEndpointInput = document.getElementById('apiEndpoint');
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelectionSelect = document.getElementById('modelSelection');
    const strictModeCheckbox = document.getElementById('strictMode');
    // 获取当前设置以保留快捷键设置
    chrome.storage.sync.get(defaultSettings, (items) => {
        const currentSettings = items;
        const settings = {
            apiEndpoint: apiEndpointInput ? apiEndpointInput.value : '',
            apiKey: apiKeyInput ? apiKeyInput.value : '',
            modelSelection: modelSelectionSelect ? modelSelectionSelect.value : 'auto',
            strictMode: strictModeCheckbox ? strictModeCheckbox.checked : false,
            shortcuts: currentSettings.shortcuts // 保留现有快捷键设置
        };
        chrome.storage.sync.set(settings, () => {
            // 显示保存成功提示
            alert('设置已保存');
        });
    });
}
// 重置设置
function resetSettings() {
    chrome.storage.sync.set(defaultSettings, () => {
        loadSettings();
        alert('设置已重置');
    });
}
// 测试API连接
async function testApiConnection() {
    const apiEndpointInput = document.getElementById('apiEndpoint');
    const apiKeyInput = document.getElementById('apiKey');
    const apiTestResult = document.getElementById('apiTestResult');
    const testStatusIcon = document.getElementById('testStatusIcon');
    const testStatusText = document.getElementById('testStatusText');
    const testDetails = document.getElementById('testDetails');
    // 检查API设置是否完整
    if (!apiEndpointInput.value || !apiKeyInput.value) {
        if (apiTestResult)
            apiTestResult.className = 'api-test-result error';
        if (testStatusText)
            testStatusText.textContent = '测试失败';
        if (testDetails)
            testDetails.textContent = 'API地址和密钥不能为空';
        if (apiTestResult)
            apiTestResult.classList.remove('hidden');
        return;
    }
    // 显示测试中状态
    if (apiTestResult)
        apiTestResult.className = 'api-test-result';
    if (testStatusText)
        testStatusText.textContent = '测试中...';
    if (testDetails)
        testDetails.textContent = '正在连接API服务器...';
    if (apiTestResult)
        apiTestResult.classList.remove('hidden');
    try {
        // 记录开始时间
        const startTime = performance.now();
        // 构建OpenAI标准的API端点
        const baseUrl = apiEndpointInput.value.endsWith('/')
            ? apiEndpointInput.value.slice(0, -1)
            : apiEndpointInput.value;
        // 使用OpenAI标准的chat/completions端点
        const openaiEndpoint = `${baseUrl}/v1/chat/completions`;
        console.log('[设置页面] 使用OpenAI标准端点:', openaiEndpoint);
        // 首先进行网络连接性测试
        console.log('[设置页面] 开始网络连接性测试...');
        try {
            // 测试1：检查端点是否可访问（HEAD请求）
            const headResponse = await fetch(openaiEndpoint, {
                method: 'HEAD',
                mode: 'cors',
                cache: 'no-cache'
            });
            console.log('[设置页面] HEAD请求结果:', headResponse.status, headResponse.statusText);
        }
        catch (headError) {
            console.warn('[设置页面] HEAD请求失败，可能是CORS限制:', headError);
        }
        // 准备OpenAI标准的测试数据格式 - 按优先级排序
        const openaiTestFormats = [
            // 格式1：GPT-4.1 (最高优先级)
            {
                model: "gpt-4.1",
                messages: [
                    {
                        role: "user",
                        content: "这是一个API连接测试。"
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            },
            // 格式2：GPT-4o (第二优先级)
            {
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: "这是一个API连接测试。"
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            },
            // 格式3：Claude-3.7-sonnet (第三优先级)
            {
                model: "claude-3-7-sonnet-20250219",
                messages: [
                    {
                        role: "user",
                        content: "这是一个API连接测试。"
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            },
            // 格式4：GPT-4o-mini (第四优先级)
            {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: "这是一个API连接测试。"
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            },
            // 格式5：GPT-5-mini (第五优先级)
            {
                model: "gpt-5-mini",
                messages: [
                    {
                        role: "user",
                        content: "这是一个API连接测试。"
                    }
                ],
                max_tokens: 50,
                temperature: 0.7
            }
        ];
        console.log(`[设置页面] 将尝试 ${openaiTestFormats.length} 种OpenAI标准请求格式`);
        // 创建 AbortController 用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20秒超时
        // 准备OpenAI标准的请求头
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyInput.value}`,
            'X-Request-ID': `settings-test-${Date.now()}`,
            'X-Client-Version': '1.0.0',
            'Accept': 'application/json',
            'User-Agent': 'LongPort-AI-Extension/1.0.0'
        };
        let successfulFormat = null;
        let responseData = null;
        let lastError = null;
        // 尝试多种OpenAI标准请求格式
        for (let i = 0; i < openaiTestFormats.length; i++) {
            const currentFormat = openaiTestFormats[i];
            console.log(`[设置页面] 尝试OpenAI格式 ${i + 1}:`, currentFormat);
            try {
                // 发送OpenAI标准测试请求
                const response = await fetch(openaiEndpoint, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(currentFormat),
                    signal: controller.signal,
                    mode: 'cors',
                    cache: 'no-cache'
                });
                console.log(`[设置页面] 格式 ${i + 1} 响应状态:`, response.status, response.statusText);
                // 记录响应头信息
                const responseHeaders = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                console.log(`[设置页面] 格式 ${i + 1} 响应头:`, responseHeaders);
                // 检查响应状态
                if (!response.ok) {
                    const errorText = await response.text().catch(() => '无法读取错误详情');
                    console.warn(`[设置页面] 格式 ${i + 1} 返回错误状态: ${response.status} ${response.statusText}`);
                    console.warn(`[设置页面] 格式 ${i + 1} 错误详情:`, errorText.substring(0, 200));
                    lastError = `HTTP ${response.status}: ${response.statusText}`;
                    continue; // 尝试下一个格式
                }
                // 验证响应内容类型
                const contentType = response.headers.get('content-type') || '';
                console.log(`[设置页面] 格式 ${i + 1} 响应内容类型: ${contentType}`);
                // 尝试解析响应
                try {
                    const responseText = await response.text();
                    console.log(`[设置页面] 格式 ${i + 1} 响应原始内容:`, responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
                    // 检查是否是HTML响应
                    if (responseText.trim().toLowerCase().startsWith('<!doctype') ||
                        responseText.trim().toLowerCase().startsWith('<html')) {
                        console.warn(`[设置页面] 格式 ${i + 1} 返回了HTML内容，跳过`);
                        lastError = 'API返回了HTML页面而非JSON数据';
                        continue; // 尝试下一个格式
                    }
                    // 尝试将文本解析为JSON
                    try {
                        const data = JSON.parse(responseText);
                        console.log(`[设置页面] 格式 ${i + 1} 解析成功:`, data);
                        // 检查OpenAI标准响应格式
                        const hasValidOpenAIResponse = data && (data.choices && Array.isArray(data.choices) && data.choices.length > 0 ||
                            data.usage ||
                            data.model ||
                            data.id ||
                            data.object === 'chat.completion');
                        if (hasValidOpenAIResponse) {
                            successfulFormat = i + 1;
                            responseData = data;
                            console.log(`[设置页面] 格式 ${i + 1} 成功获取有效OpenAI响应，停止尝试`);
                            break; // 找到有效格式，停止尝试
                        }
                        else {
                            console.warn(`[设置页面] 格式 ${i + 1} 响应不符合OpenAI标准格式`);
                            lastError = '响应不符合OpenAI标准格式';
                            continue; // 尝试下一个格式
                        }
                    }
                    catch (jsonError) {
                        console.error(`[设置页面] 格式 ${i + 1} 解析JSON失败:`, jsonError);
                        lastError = `JSON解析失败: ${jsonError instanceof Error ? jsonError.message : '未知错误'}`;
                        continue; // 尝试下一个格式
                    }
                }
                catch (parseError) {
                    console.error(`[设置页面] 格式 ${i + 1} 解析响应失败:`, parseError);
                    lastError = `响应解析失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`;
                    continue; // 尝试下一个格式
                }
            }
            catch (fetchError) {
                console.error(`[设置页面] 格式 ${i + 1} 请求失败:`, fetchError);
                lastError = `网络请求失败: ${fetchError instanceof Error ? fetchError.message : '未知错误'}`;
                // 如果是网络错误，提供更具体的诊断
                if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
                    lastError = '网络连接失败，请检查API端点是否可访问';
                }
                else if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
                    lastError = '请求超时，请检查网络连接或API服务器状态';
                }
                continue; // 尝试下一个格式
            }
        }
        // 清除超时
        clearTimeout(timeoutId);
        // 计算响应时间
        const responseTime = Math.round(performance.now() - startTime);
        // 检查是否找到有效的响应格式
        if (successfulFormat && responseData) {
            // 测试成功
            if (apiTestResult)
                apiTestResult.className = 'api-test-result success';
            if (testStatusText)
                testStatusText.textContent = '连接成功';
            const modelInfo = successfulFormat === 1
                ? `使用OpenAI格式 GPT-4.1`
                : `使用OpenAI格式 GPT-4o`;
            if (testDetails)
                testDetails.textContent = `响应时间: ${responseTime}ms，${modelInfo}`;
            console.log(`[设置页面] OpenAI API连接测试成功，${modelInfo}，响应数据:`, responseData);
        }
        else {
            // 所有格式都失败
            if (apiTestResult)
                apiTestResult.className = 'api-test-result error';
            if (testStatusText)
                testStatusText.textContent = '连接失败';
            // 提供更详细的错误信息
            let errorMessage = '所有OpenAI请求格式都失败了，请检查API配置和网络连接';
            if (lastError) {
                errorMessage += `\n\n最后错误: ${lastError}`;
            }
            errorMessage += `\n\n建议检查:\n1. API端点是否正确 (应该是 https://lboneapi.longbridge-inc.com)\n2. API密钥是否有效\n3. 网络连接是否正常\n4. API服务是否运行`;
            if (testDetails)
                testDetails.textContent = errorMessage;
            console.error('[设置页面] 所有OpenAI请求格式都失败了，最后错误:', lastError);
        }
    }
    catch (error) {
        // 网络错误或其他异常
        if (apiTestResult)
            apiTestResult.className = 'api-test-result error';
        if (testStatusText)
            testStatusText.textContent = '连接失败';
        let errorMessage = error instanceof Error ?
            `错误: ${error.message}` :
            '发生未知错误';
        // 提供更具体的错误诊断
        if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = '网络连接失败，请检查API端点是否可访问';
        }
        else if (error instanceof DOMException && error.name === 'AbortError') {
            errorMessage = '请求超时，请检查网络连接或API服务器状态';
        }
        if (testDetails)
            testDetails.textContent = errorMessage;
        console.error('[设置页面] OpenAI API连接测试出错:', error);
    }
}
// 切换密码显示/隐藏
function togglePasswordVisibility() {
    const apiKeyInput = document.getElementById('apiKey');
    const toggleButton = document.getElementById('togglePassword');
    if (apiKeyInput && toggleButton) {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleButton.setAttribute('aria-label', '隐藏密码');
            toggleButton.classList.add('show');
        }
        else {
            apiKeyInput.type = 'password';
            toggleButton.setAttribute('aria-label', '显示密码');
            toggleButton.classList.remove('show');
        }
    }
}
// 打开文案优化测试页面
function openTestPage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('test/test.html') });
}
// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载设置
    loadSettings();
    // 添加保存按钮事件监听
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    // 添加重置按钮事件监听
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }
    // 添加测试API按钮事件监听
    const testApiBtn = document.getElementById('testApiBtn');
    if (testApiBtn) {
        testApiBtn.addEventListener('click', testApiConnection);
    }
    // 添加切换密码显示/隐藏按钮事件监听
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
    // 设置快捷键录入
    setupShortcutRecorder('optimize');
    setupShortcutRecorder('replace');
    // 添加文案优化测试页面按钮事件监听
    const testPageBtn = document.getElementById('testPageBtn');
    if (testPageBtn) {
        testPageBtn.addEventListener('click', openTestPage);
    }
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map