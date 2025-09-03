/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content/content.css":
/*!*********************************!*\
  !*** ./src/content/content.css ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/utils/record-manager.ts":
/*!*************************************!*\
  !*** ./src/utils/record-manager.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OptimizationMode: () => (/* binding */ OptimizationMode),
/* harmony export */   recordManager: () => (/* binding */ recordManager)
/* harmony export */ });
/**
 * LongPort AI 助手 - 优化记录管理器
 *
 * 用于管理文本优化历史记录，提供记录的保存、查询、删除等功能
 */
// 优化模式枚举
var OptimizationMode;
(function (OptimizationMode) {
    OptimizationMode["BASIC"] = "basic";
    OptimizationMode["STRICT"] = "strict";
})(OptimizationMode || (OptimizationMode = {}));
// 记录管理器类
class RecordManager {
    // 单例模式
    static getInstance() {
        if (!RecordManager.instance) {
            RecordManager.instance = new RecordManager();
        }
        return RecordManager.instance;
    }
    // 私有构造函数
    constructor() {
        this.STORAGE_KEY = 'optimizationRecords';
        this.MAX_RECORDS = 100; // 最大记录数量
        this.DEFAULT_RETENTION_DAYS = 30; // 默认保留天数
    }
    /**
     * 保存优化记录
     * @param record 要保存的记录（不包含id和timestamp）
     * @returns 保存后的完整记录
     */
    async saveRecord(record) {
        // 获取现有记录
        const records = await this.getAllRecords();
        // 创建新记录
        const newRecord = {
            ...record,
            id: this.generateId(),
            timestamp: Date.now()
        };
        // 添加到记录列表
        records.unshift(newRecord);
        // 如果记录数量超过最大值，删除最旧的记录
        if (records.length > this.MAX_RECORDS) {
            records.splice(this.MAX_RECORDS);
        }
        // 保存记录
        await this.saveAllRecords(records);
        return newRecord;
    }
    /**
     * 获取所有优化记录
     * @returns 优化记录数组
     */
    async getAllRecords() {
        return new Promise((resolve) => {
            chrome.storage.local.get(this.STORAGE_KEY, (result) => {
                const records = result[this.STORAGE_KEY] || [];
                resolve(records);
            });
        });
    }
    /**
     * 根据ID获取单条记录
     * @param id 记录ID
     * @returns 找到的记录，如果不存在则返回null
     */
    async getRecordById(id) {
        const records = await this.getAllRecords();
        return records.find(record => record.id === id) || null;
    }
    /**
     * 根据条件筛选记录
     * @param filter 筛选条件
     * @returns 符合条件的记录数组
     */
    async filterRecords(filter) {
        const records = await this.getAllRecords();
        return records.filter(record => {
            // 按日期范围筛选
            if (filter.startDate && record.timestamp < filter.startDate) {
                return false;
            }
            if (filter.endDate && record.timestamp > filter.endDate) {
                return false;
            }
            // 按域名筛选
            if (filter.domain && record.sourceDomain !== filter.domain) {
                return false;
            }
            // 按优化模式筛选
            if (filter.mode && record.mode !== filter.mode) {
                return false;
            }
            // 按文本内容搜索
            if (filter.searchText) {
                const searchLower = filter.searchText.toLowerCase();
                const originalLower = record.originalText.toLowerCase();
                const optimizedLower = record.optimizedText.toLowerCase();
                if (!originalLower.includes(searchLower) && !optimizedLower.includes(searchLower)) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * 删除单条记录
     * @param id 要删除的记录ID
     * @returns 是否成功删除
     */
    async deleteRecord(id) {
        const records = await this.getAllRecords();
        const initialLength = records.length;
        const filteredRecords = records.filter(record => record.id !== id);
        if (filteredRecords.length === initialLength) {
            // 没有记录被删除
            return false;
        }
        await this.saveAllRecords(filteredRecords);
        return true;
    }
    /**
     * 清空所有记录
     * @returns 是否成功清空
     */
    async clearAllRecords() {
        return new Promise((resolve) => {
            chrome.storage.local.remove(this.STORAGE_KEY, () => {
                if (chrome.runtime.lastError) {
                    console.error('清空记录失败:', chrome.runtime.lastError);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    /**
     * 清理过期记录
     * @param retentionDays 保留天数，默认为30天
     * @returns 删除的记录数量
     */
    async cleanupExpiredRecords(retentionDays = this.DEFAULT_RETENTION_DAYS) {
        const records = await this.getAllRecords();
        const initialLength = records.length;
        // 计算截止时间戳
        const cutoffTimestamp = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
        // 过滤掉过期记录
        const filteredRecords = records.filter(record => record.timestamp >= cutoffTimestamp);
        // 计算删除的记录数量
        const deletedCount = initialLength - filteredRecords.length;
        if (deletedCount > 0) {
            await this.saveAllRecords(filteredRecords);
        }
        return deletedCount;
    }
    /**
     * 导出记录为JSON字符串
     * @returns JSON格式的记录数据
     */
    async exportRecords() {
        const records = await this.getAllRecords();
        return JSON.stringify(records, null, 2);
    }
    /**
     * 导入记录
     * @param jsonData JSON格式的记录数据
     * @param replace 是否替换现有记录，默认为false（合并）
     * @returns 导入的记录数量
     */
    async importRecords(jsonData, replace = false) {
        try {
            const importedRecords = JSON.parse(jsonData);
            if (!Array.isArray(importedRecords)) {
                throw new Error('导入数据格式错误');
            }
            // 验证记录格式
            for (const record of importedRecords) {
                if (!this.isValidRecord(record)) {
                    throw new Error('导入数据包含无效记录');
                }
            }
            if (replace) {
                // 替换现有记录
                await this.saveAllRecords(importedRecords);
            }
            else {
                // 合并记录
                const existingRecords = await this.getAllRecords();
                // 使用Map去重，以ID为键
                const recordMap = new Map();
                // 先添加现有记录
                existingRecords.forEach(record => {
                    recordMap.set(record.id, record);
                });
                // 再添加导入记录（如有重复ID则覆盖）
                importedRecords.forEach(record => {
                    recordMap.set(record.id, record);
                });
                // 转换回数组并按时间戳排序
                const mergedRecords = Array.from(recordMap.values())
                    .sort((a, b) => b.timestamp - a.timestamp);
                // 如果超过最大记录数，截断
                const finalRecords = mergedRecords.slice(0, this.MAX_RECORDS);
                await this.saveAllRecords(finalRecords);
            }
            return importedRecords.length;
        }
        catch (error) {
            console.error('导入记录失败:', error);
            throw error;
        }
    }
    /**
     * 获取记录统计信息
     * @returns 记录统计信息
     */
    async getRecordStats() {
        const records = await this.getAllRecords();
        if (records.length === 0) {
            return {
                totalCount: 0,
                oldestTimestamp: null,
                newestTimestamp: null,
                domainCounts: {},
                modeCounts: {}
            };
        }
        // 初始化统计
        let oldestTimestamp = records[0].timestamp;
        let newestTimestamp = records[0].timestamp;
        const domainCounts = {};
        const modeCounts = {};
        // 遍历记录进行统计
        for (const record of records) {
            // 更新时间戳
            if (record.timestamp < oldestTimestamp) {
                oldestTimestamp = record.timestamp;
            }
            if (record.timestamp > newestTimestamp) {
                newestTimestamp = record.timestamp;
            }
            // 统计域名
            if (domainCounts[record.sourceDomain]) {
                domainCounts[record.sourceDomain]++;
            }
            else {
                domainCounts[record.sourceDomain] = 1;
            }
            // 统计模式
            if (modeCounts[record.mode]) {
                modeCounts[record.mode]++;
            }
            else {
                modeCounts[record.mode] = 1;
            }
        }
        return {
            totalCount: records.length,
            oldestTimestamp,
            newestTimestamp,
            domainCounts,
            modeCounts
        };
    }
    // 私有方法：保存所有记录
    async saveAllRecords(records) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [this.STORAGE_KEY]: records }, () => {
                if (chrome.runtime.lastError) {
                    console.error('保存记录失败:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }
    // 私有方法：生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }
    // 私有方法：验证记录格式
    isValidRecord(record) {
        return (typeof record === 'object' &&
            typeof record.id === 'string' &&
            typeof record.timestamp === 'number' &&
            typeof record.sourceUrl === 'string' &&
            typeof record.sourceDomain === 'string' &&
            typeof record.originalText === 'string' &&
            typeof record.optimizedText === 'string' &&
            typeof record.mode === 'string' &&
            typeof record.stats === 'object' &&
            typeof record.stats.originalLength === 'number' &&
            typeof record.stats.optimizedLength === 'number');
    }
}
// 导出单例实例
const recordManager = RecordManager.getInstance();


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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
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
  !*** ./src/content/index.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _content_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./content.css */ "./src/content/content.css");
/* harmony import */ var _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/record-manager */ "./src/utils/record-manager.ts");
/**
 * longPort AI - 内容脚本
 * 在网页中注入并执行
 */


// 初始化日志
console.log('longPort AI 内容脚本已加载', window.location.href);
// 保存当前选中的文本和范围
let currentSelection = null;
// 创建弹窗元素
let popupElement = null;
let shadowRoot = null;
let shadowHost = null;
// 监听选中文本变化
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
        currentSelection = {
            text: selection.toString(),
            range: selection.getRangeAt(0)
        };
    }
    else {
        currentSelection = null;
    }
});
// 保存快捷键配置
let optimizeShortcut = { altKey: true, ctrlKey: false, shiftKey: false, metaKey: false, key: 'o' };
let replaceShortcut = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false, key: ' ' };
// 加载快捷键配置
function loadShortcuts() {
    chrome.storage.sync.get(['settings'], (result) => {
        if (result.settings && result.settings.shortcuts) {
            optimizeShortcut = result.settings.shortcuts.optimize;
            replaceShortcut = result.settings.shortcuts.replace;
            console.log('LongPort AI: 已加载快捷键配置', optimizeShortcut, replaceShortcut);
        }
    });
}
// 初始加载快捷键配置
loadShortcuts();
// 监听快捷键
document.addEventListener('keydown', (event) => {
    // 检查是否匹配优化快捷键
    if (matchesShortcut(event, optimizeShortcut)) {
        const selectedText = window.getSelection()?.toString();
        if (selectedText && selectedText.trim().length > 0) {
            optimizeText(selectedText);
            event.preventDefault(); // 阻止默认行为
        }
    }
    // 检查是否匹配替换快捷键，且弹窗已显示
    if (matchesShortcut(event, replaceShortcut) && popupElement) {
        const replaceButton = popupElement.querySelector('.longport-ai-btn-primary');
        if (replaceButton) {
            replaceButton.click();
            event.preventDefault(); // 阻止默认行为
        }
    }
});
// 检查事件是否匹配快捷键配置
function matchesShortcut(event, shortcut) {
    return event.altKey === shortcut.altKey &&
        event.ctrlKey === shortcut.ctrlKey &&
        event.shiftKey === shortcut.shiftKey &&
        event.metaKey === shortcut.metaKey &&
        event.key.toLowerCase() === shortcut.key.toLowerCase();
}
// 监听设置变更
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.settings) {
        const newSettings = changes.settings.newValue;
        if (newSettings && newSettings.shortcuts) {
            optimizeShortcut = newSettings.shortcuts.optimize;
            replaceShortcut = newSettings.shortcuts.replace;
            console.log('LongPort AI: 快捷键配置已更新', optimizeShortcut, replaceShortcut);
        }
    }
});
// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('longPort AI: 收到消息', message);
    try {
        // 处理PING消息，用于检查内容脚本是否已加载
        if (message.type === 'PING') {
            console.log('longPort AI: 收到PING消息，回复PONG');
            try {
                sendResponse({ pong: true });
                console.log('longPort AI: PONG响应已发送');
            }
            catch (pingError) {
                console.error('发送PING响应时出错:', pingError);
            }
            return true;
        }
        // 处理替换文本命令
        else if (message.type === 'REPLACE_TEXT') {
            console.log('longPort AI: 收到替换文本命令');
            try {
                // 立即回复，表示消息已收到
                try {
                    sendResponse({ received: true });
                }
                catch (responseError) {
                    console.error('发送接收确认响应时出错:', responseError);
                }
                // 如果弹窗已显示，模拟点击替换按钮
                if (popupElement) {
                    const replaceButton = popupElement.querySelector('.longport-ai-btn-primary');
                    if (replaceButton) {
                        console.log('执行替换操作');
                        replaceButton.click();
                    }
                    else {
                        console.warn('未找到替换按钮');
                    }
                }
                else {
                    console.warn('弹窗未显示，无法执行替换操作');
                }
            }
            catch (error) {
                console.error('处理替换文本命令时出错:', error);
            }
            return true;
        }
        // 处理优化文本消息
        else if (message.type === 'CONTEXT_MENU_OPTIMIZE' && message.text) {
            console.log('longPort AI: 收到右键菜单优化文本消息', message.text.substring(0, 20) + '...');
            try {
                // 立即回复，表示消息已收到
                try {
                    sendResponse({ received: true });
                    console.log('已发送接收确认响应');
                }
                catch (responseError) {
                    console.error('发送接收确认响应时出错:', responseError);
                }
                // 保存选中文本和范围
                // 直接使用传入的文本，不再尝试获取选中区域
                // 这样可以避免在右键菜单点击后选中区域丢失的问题
                currentSelection = {
                    text: message.text,
                    range: null // 稍后在优化文本函数中处理
                };
                console.log('已保存选中文本:', message.text.substring(0, 20) + '...');
                // 然后异步处理优化文本，避免阻塞消息响应
                setTimeout(() => {
                    try {
                        console.log('开始异步处理优化文本...');
                        optimizeText(message.text);
                    }
                    catch (error) {
                        console.error('处理优化文本时出错:', error);
                        showErrorPopup('处理文本时出错: ' + (error instanceof Error ? error.message : String(error)));
                    }
                }, 100); // 增加延迟到100ms，给更多时间处理响应
            }
            catch (processingError) {
                console.error('处理优化文本消息时出错:', processingError);
                try {
                    sendResponse({ error: String(processingError) });
                }
                catch (responseError) {
                    console.error('发送错误响应时出错:', responseError);
                }
            }
            return true;
        }
        // 对于未知消息类型，也返回响应
        console.warn('收到未知类型的消息:', message.type);
        try {
            sendResponse({ received: true, unknown: true });
        }
        catch (unknownResponseError) {
            console.error('发送未知类型响应时出错:', unknownResponseError);
        }
        // 返回 true 表示将异步发送响应
        return true;
    }
    catch (error) {
        // 捕获所有异常，确保消息处理不会崩溃
        console.error('处理消息时出错:', error);
        try {
            sendResponse({ error: String(error) });
        }
        catch (responseError) {
            console.error('发送错误响应时出错:', responseError);
        }
        return true;
    }
});
// 文本优化函数
function optimizeText(text) {
    console.log('开始优化文本:', text.substring(0, 20) + '...');
    // 如果currentSelection未设置或range为null，则尝试获取当前选中区域
    if (!currentSelection || currentSelection.range === null) {
        console.log('尝试获取选中区域或查找可编辑元素');
        // 尝试获取当前选中区域
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
            console.log('检测到有效的选中区域');
            if (!currentSelection) {
                currentSelection = {
                    text,
                    range: selection.getRangeAt(0).cloneRange()
                };
            }
            else {
                currentSelection.range = selection.getRangeAt(0).cloneRange();
            }
        }
        else {
            // 尝试查找 Notion 特定的编辑器元素
            console.log('尝试查找 Notion 特定的编辑器元素');
            // Notion 编辑器特定选择器
            const notionSelectors = [
                '.notion-page-content [contenteditable="true"]',
                '.notion-frame [contenteditable="true"]',
                '.notion-selectable [contenteditable="true"]',
                '.notranslate [contenteditable="true"]'
            ];
            let notionEditor = null;
            // 尝试每个 Notion 选择器
            for (const selector of notionSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    notionEditor = elements[0];
                    console.log(`找到 Notion 编辑器元素: ${selector}`);
                    break;
                }
            }
            if (notionEditor) {
                // 找到 Notion 编辑器元素
                const range = document.createRange();
                try {
                    range.selectNodeContents(notionEditor);
                    console.log('已选择 Notion 编辑器内容');
                    if (!currentSelection) {
                        currentSelection = { text, range };
                    }
                    else {
                        currentSelection.range = range;
                    }
                }
                catch (e) {
                    console.warn('无法选择 Notion 编辑器内容，尝试其他方法', e);
                    // 继续尝试其他方法
                }
            }
            // 如果仍未找到有效范围，尝试查找一般可编辑元素
            if (!currentSelection || !currentSelection.range) {
                console.log('尝试查找一般可编辑元素');
                // 查找常见的编辑器元素
                const editableElements = document.querySelectorAll('[contenteditable="true"], textarea, input[type="text"]');
                let targetElement = null;
                // 查找焦点元素
                Array.from(editableElements).forEach(el => {
                    if (el === document.activeElement) {
                        targetElement = el;
                        console.log('找到焦点可编辑元素');
                    }
                });
                // 如果没有找到焦点元素，使用第一个可编辑元素
                if (!targetElement && editableElements.length > 0) {
                    targetElement = editableElements[0];
                    console.log('使用第一个可编辑元素');
                }
                // 创建范围
                const range = document.createRange();
                if (targetElement) {
                    try {
                        range.selectNodeContents(targetElement);
                        console.log('已选择可编辑元素内容');
                        if (!currentSelection) {
                            currentSelection = { text, range };
                        }
                        else {
                            currentSelection.range = range;
                        }
                    }
                    catch (e) {
                        console.debug('无法选择可编辑元素内容，创建虚拟范围处理', e);
                        createVirtualRange();
                    }
                }
                else {
                    console.debug('未找到可编辑元素，创建虚拟范围处理');
                    createVirtualRange();
                }
            }
        }
    }
    // 创建虚拟范围的辅助函数
    function createVirtualRange() {
        // 创建一个临时元素作为范围的容器
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.textContent = text;
        document.body.appendChild(tempDiv);
        const range = document.createRange();
        range.selectNodeContents(tempDiv);
        console.log('已创建虚拟范围');
        if (!currentSelection) {
            currentSelection = { text, range };
        }
        else {
            currentSelection.range = range;
        }
        // 不立即移除临时元素，等待替换操作完成后再移除
        // 将引用存储在全局变量中
        window.tempRangeElement = tempDiv;
    }
    // 清除任何已存在的弹窗
    if (popupElement && popupElement.parentNode) {
        // 直接移除而不使用动画效果，避免闪现
        popupElement.parentNode.removeChild(popupElement);
        popupElement = null;
        shadowRoot = null;
        shadowHost = null;
    }
    // 显示加载中弹窗
    try {
        // 延迟一点显示弹窗，确保DOM已经准备好
        setTimeout(() => {
            showLoadingPopup();
            console.log('已显示加载中弹窗');
        }, 50);
    }
    catch (popupError) {
        console.error('显示加载中弹窗失败:', popupError);
        // 如果失败，再次延迟重试
        setTimeout(() => {
            try {
                showLoadingPopup();
                console.log('延迟重试显示加载中弹窗成功');
            }
            catch (retryError) {
                console.error('延迟重试显示加载中弹窗失败:', retryError);
                // 如果仍然失败，无法继续
            }
        }, 150);
    }
    // 添加超时处理
    const timeoutId = setTimeout(() => {
        console.warn('请求超时，显示错误弹窗');
        showErrorPopup('请求超时，请重试');
    }, 30000); // 30秒超时
    try {
        console.log('发送消息到后台脚本');
        // 发送消息到后台脚本
        chrome.runtime.sendMessage({
            type: 'OPTIMIZE_TEXT',
            text
        }, (response) => {
            // 清除超时
            clearTimeout(timeoutId);
            console.log('收到后台响应:', response);
            // 检查runtime.lastError
            if (chrome.runtime.lastError) {
                console.error('消息响应错误:', chrome.runtime.lastError.message);
                showErrorPopup('通信错误: ' + chrome.runtime.lastError.message);
                return;
            }
            // 检查响应是否存在
            if (!response) {
                console.error('未收到有效响应');
                showErrorPopup('未收到有效响应，请重试');
                return;
            }
            if (response.success && response.optimizedText) {
                // 显示优化结果弹窗
                console.log('显示优化结果弹窗');
                // 清除任何已存在的弹窗
                if (popupElement && popupElement.parentNode) {
                    // 直接移除而不使用动画效果，避免闪现
                    popupElement.parentNode.removeChild(popupElement);
                    popupElement = null;
                    shadowRoot = null;
                    shadowHost = null;
                }
                // 延迟一点显示结果弹窗，避免闪现
                setTimeout(() => {
                    try {
                        showResultPopup(text, response.optimizedText || "", response.stats);
                        console.log('显示结果弹窗成功');
                    }
                    catch (resultError) {
                        console.error('显示结果弹窗失败:', resultError);
                        // 如果失败，再次延迟重试
                        setTimeout(() => {
                            try {
                                showResultPopup(text, response.optimizedText || "", response.stats);
                                console.log('延迟重试显示结果弹窗成功');
                            }
                            catch (retryError) {
                                console.error('延迟重试显示结果弹窗失败:', retryError);
                                alert('优化成功，但无法显示结果弹窗。请刷新页面后重试。');
                            }
                        }, 150);
                    }
                }, 50);
            }
            else {
                // 显示错误弹窗，包含详细信息
                const errorMessage = response.error || '优化失败，请重试';
                const errorDetails = response.details ? `\n\n详细信息: ${response.details}` : '';
                console.error('优化失败:', errorMessage, errorDetails);
                // 如果是API配置错误，提供更具体的指导
                if (errorMessage.includes('API配置可能有误') || errorMessage.includes('API未配置')) {
                    showApiConfigErrorPopup(errorMessage, errorDetails);
                }
                else {
                    showErrorPopup(errorMessage + errorDetails);
                }
            }
        });
    }
    catch (error) {
        // 清除超时
        clearTimeout(timeoutId);
        // 处理异常
        console.error('发送请求失败:', error);
        showErrorPopup('发送请求失败: ' + (error instanceof Error ? error.message : String(error)));
    }
}
// 显示加载中弹窗
function showLoadingPopup() {
    // 如果已有弹窗，先移除
    removePopup();
    // 创建弹窗元素
    popupElement = document.createElement('div');
    popupElement.className = 'longport-ai-popup';
    popupElement.style.zIndex = '2147483647'; // 最大z-index值
    // 弹窗头部
    const header = document.createElement('div');
    header.className = 'longport-ai-popup-header';
    const title = document.createElement('h3');
    title.className = 'longport-ai-popup-title';
    title.textContent = 'LongPort AI';
    const closeButton = document.createElement('button');
    closeButton.className = 'longport-ai-popup-close';
    closeButton.innerHTML = ''; // 使用CSS伪元素来添加X符号
    closeButton.addEventListener('click', removePopup);
    header.appendChild(title);
    header.appendChild(closeButton);
    // 弹窗内容
    const content = document.createElement('div');
    content.className = 'longport-ai-loading';
    const spinner = document.createElement('div');
    spinner.className = 'longport-ai-spinner';
    const loadingText = document.createElement('p');
    loadingText.className = 'longport-ai-loading-text';
    loadingText.textContent = '正在润色文本...';
    content.appendChild(spinner);
    content.appendChild(loadingText);
    // 组装弹窗
    popupElement.appendChild(header);
    popupElement.appendChild(content);
    // 添加到页面前设置初始样式
    popupElement.style.opacity = '0';
    // 智能定位弹窗
    positionPopupIntelligently();
    document.body.appendChild(popupElement);
    // 设置拖拽功能
    makeElementDraggable(popupElement, header);
    // 添加动画效果
    setTimeout(() => {
        if (popupElement) {
            popupElement.style.opacity = '1';
        }
    }, 10);
    console.log('弹窗已创建并添加到DOM');
}
// 智能定位弹窗
function positionPopupIntelligently() {
    if (!popupElement) {
        console.log('无法智能定位弹窗：缺少弹窗元素');
        return;
    }
    // 如果没有选中区域或范围，则居中显示
    if (!currentSelection || !currentSelection.range) {
        console.log('无选中区域，居中显示弹窗');
        popupElement.style.top = '50%';
        popupElement.style.left = '50%';
        popupElement.style.transform = 'translate(-50%, -50%)';
        return;
    }
    try {
        // 获取选中文本的范围
        const selectionRect = currentSelection.range.getBoundingClientRect();
        const popupWidth = 450; // 弹窗默认宽度
        const popupHeight = 300; // 弹窗默认高度估计值
        // 获取视口尺寸
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        // 默认尝试显示在选中文本下方
        let top = selectionRect.bottom + 10 + scrollY; // 选中文本底部加10px间距，考虑滚动位置
        let left = selectionRect.left + (selectionRect.width / 2); // 水平居中
        let transformValue = 'translate(-50%, 0)';
        // 检查下方空间是否足够
        if (selectionRect.bottom + popupHeight > viewportHeight) {
            // 下方空间不足，尝试显示在选中文本上方
            top = selectionRect.top - popupHeight - 10 + scrollY; // 选中文本顶部减去弹窗高度再减10px间距
            // 检查上方空间是否足够
            if (selectionRect.top - popupHeight < 0) {
                // 上下方都空间不足，居中显示
                console.log('上下方都空间不足，居中显示弹窗');
                popupElement.style.top = `${viewportHeight / 2 + scrollY}px`;
                popupElement.style.left = '50%';
                popupElement.style.transform = 'translate(-50%, -50%)';
                return;
            }
            else {
                console.log('在选中文本上方显示弹窗');
                transformValue = 'translate(-50%, 0)';
            }
        }
        else {
            console.log('在选中文本下方显示弹窗');
            transformValue = 'translate(-50%, 0)';
        }
        // 确保弹窗水平方向不超出视口
        if (left - (popupWidth / 2) < 20) {
            left = 20 + (popupWidth / 2); // 靠左对齐，保的20px边距
        }
        else if (left + (popupWidth / 2) > viewportWidth - 20) {
            left = viewportWidth - 20 - (popupWidth / 2); // 靠右对齐，保的20px边距
        }
        // 设置弹窗位置
        popupElement.style.top = `${top}px`;
        popupElement.style.left = `${left}px`;
        popupElement.style.transform = transformValue;
    }
    catch (error) {
        console.error('智能定位弹窗失败:', error);
        // 如果失败，回退到默认中心定位
        popupElement.style.top = '50%';
        popupElement.style.left = '50%';
        popupElement.style.transform = 'translate(-50%, -50%)';
    }
}
// 显示结果弹窗
function showResultPopup(originalText, optimizedText, stats) {
    // 如果已有弹窗，先移除
    removePopup();
    // 创建弹窗元素
    popupElement = document.createElement('div');
    popupElement.className = 'longport-ai-popup';
    popupElement.style.zIndex = '2147483647'; // 最大z-index值
    popupElement.style.opacity = '0'; // 初始透明，等待动画效果
    // 弹窗头部
    const header = document.createElement('div');
    header.className = 'longport-ai-popup-header';
    const title = document.createElement('h3');
    title.className = 'longport-ai-popup-title';
    title.textContent = 'LongPort AI';
    const closeButton = document.createElement('button');
    closeButton.className = 'longport-ai-popup-close';
    closeButton.innerHTML = ''; // 使用CSS伪元素来添加X符号
    closeButton.addEventListener('click', removePopup);
    header.appendChild(title);
    header.appendChild(closeButton);
    // 弹窗内容
    const content = document.createElement('div');
    content.className = 'longport-ai-popup-content';
    // 创建文本容器
    const textContainer = document.createElement('div');
    textContainer.className = 'longport-ai-text-container';
    // 优化后文本部分
    const optimizedSection = document.createElement('div');
    optimizedSection.className = 'longport-ai-text-section';
    const optimizedTextarea = document.createElement('textarea');
    optimizedTextarea.className = 'longport-ai-text-area longport-ai-optimized';
    optimizedTextarea.value = optimizedText;
    optimizedTextarea.readOnly = true;
    optimizedSection.appendChild(optimizedTextarea);
    // 添加到文本容器
    textContainer.appendChild(optimizedSection);
    // 字数统计信息
    const statsElement = document.createElement('div');
    statsElement.className = 'longport-ai-stats';
    if (stats) {
        // 类型断言为扩展的统计类型
        const extendedStats = stats;
        // 创建统计信息容器
        const statsContainer = document.createElement('div');
        statsContainer.className = 'longport-ai-stats-container';
        // 基本字数统计部分
        const basicStatsDiv = document.createElement('div');
        basicStatsDiv.className = 'longport-ai-stats-row';
        // 只显示字数变化
        const changeStats = document.createElement('div');
        changeStats.className = 'longport-ai-stats-item';
        // 使用API返回的变化量，如果没有则计算
        const changeAmount = extendedStats.lengthDifference !== undefined ?
            extendedStats.lengthDifference :
            stats.optimizedLength - stats.originalLength;
        // 只显示变化量，不显示百分比
        const changeText = changeAmount > 0 ?
            `+${changeAmount}` :
            `${changeAmount}`;
        // 将字数变化显示在一行
        changeStats.innerHTML = `<span class="longport-ai-stats-label">字数变化：</span><span class="longport-ai-stats-change ${changeAmount >= 0 ? 'longport-ai-positive' : 'longport-ai-negative'}">${changeText}</span>`;
        // 添加字数变化到行
        basicStatsDiv.appendChild(changeStats);
        // 添加基本统计到容器
        statsContainer.appendChild(basicStatsDiv);
        // 不显示详细的中英文统计
        // 添加统计容器到主元素
        statsElement.appendChild(statsContainer);
        // 保存优化记录
        saveOptimizationRecord(originalText, optimizedText, stats);
    }
    content.appendChild(textContainer);
    content.appendChild(statsElement);
    // 弹窗底部
    const footer = document.createElement('div');
    footer.className = 'longport-ai-popup-footer';
    const cancelButton = document.createElement('button');
    cancelButton.className = 'longport-ai-btn longport-ai-btn-default';
    cancelButton.textContent = '取消';
    cancelButton.addEventListener('click', removePopup);
    const replaceButton = document.createElement('button');
    replaceButton.className = 'longport-ai-btn longport-ai-btn-primary';
    replaceButton.textContent = '替换';
    replaceButton.addEventListener('click', () => {
        replaceSelectedText(optimizedText);
        removePopup();
    });
    footer.appendChild(cancelButton);
    footer.appendChild(replaceButton);
    // 组装弹窗
    popupElement.appendChild(header);
    popupElement.appendChild(content);
    popupElement.appendChild(footer);
    // 智能定位弹窗
    positionPopupIntelligently();
    // 添加到页面
    document.body.appendChild(popupElement);
    // 设置拖拽功能
    makeElementDraggable(popupElement, header);
    // 添加动画效果
    setTimeout(() => {
        if (popupElement) {
            popupElement.style.opacity = '1';
        }
    }, 10);
}
// 显示API配置错误弹窗
function showApiConfigErrorPopup(errorMessage, errorDetails) {
    // 清除任何已存在的弹窗
    if (popupElement && popupElement.parentNode) {
        // 直接移除而不使用动画效果，避免闪现
        popupElement.parentNode.removeChild(popupElement);
        popupElement = null;
        shadowRoot = null;
        shadowHost = null;
    }
    // 调试日志
    console.log('显示API配置错误弹窗:', errorMessage);
    // 创建弹窗元素
    popupElement = document.createElement('div');
    popupElement.className = 'longport-ai-popup';
    popupElement.style.zIndex = '2147483647'; // 最大z-index值
    // 弹窗头部
    const header = document.createElement('div');
    header.className = 'longport-ai-popup-header';
    const title = document.createElement('h3');
    title.className = 'longport-ai-popup-title';
    title.textContent = 'longPort AI - API配置';
    const closeButton = document.createElement('button');
    closeButton.className = 'longport-ai-popup-close';
    closeButton.innerHTML = ''; // 使用CSS伪元素来添加X符号
    closeButton.addEventListener('click', removePopup);
    header.appendChild(title);
    header.appendChild(closeButton);
    // 弹窗内容
    const content = document.createElement('div');
    content.className = 'longport-ai-popup-content';
    const errorElement = document.createElement('div');
    errorElement.className = 'longport-ai-error';
    // 显示错误信息
    const errorTitle = document.createElement('div');
    errorTitle.className = 'longport-ai-error-title';
    errorTitle.textContent = '需要配置API或使用模拟API';
    errorElement.appendChild(errorTitle);
    // API配置错误详细信息
    const errorDetailsElement = document.createElement('div');
    errorDetailsElement.className = 'longport-ai-error-details';
    errorDetailsElement.innerHTML = `
    <p>您的API配置可能有误或未配置。您可以：</p>
    <ul>
      <li>配置正确的API地址和密钥</li>
      <li>或使用模拟API进行文本优化</li>
    </ul>
  `;
    errorElement.appendChild(errorDetailsElement);
    // 按钮容器
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.marginTop = '16px';
    // 配置API按钮
    const configApiButton = document.createElement('button');
    configApiButton.className = 'longport-ai-btn longport-ai-btn-primary';
    configApiButton.textContent = '配置API';
    configApiButton.style.marginRight = '8px';
    configApiButton.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        removePopup();
    });
    // 使用模拟API按钮
    const useMockApiButton = document.createElement('button');
    useMockApiButton.className = 'longport-ai-btn longport-ai-btn-default';
    useMockApiButton.textContent = '使用模拟API';
    useMockApiButton.addEventListener('click', () => {
        // 发送消息到后台脚本，使用模拟API
        chrome.runtime.sendMessage({
            type: 'OPTIMIZE_TEXT',
            text: currentSelection?.text || '',
            useMockApi: true
        }, (response) => {
            if (response && response.success && response.optimizedText) {
                removePopup();
                showResultPopup(currentSelection?.text || '', response.optimizedText, response.stats);
            }
            else {
                showErrorPopup('使用模拟API失败，请重试');
            }
        });
    });
    buttonsContainer.appendChild(configApiButton);
    buttonsContainer.appendChild(useMockApiButton);
    errorElement.appendChild(buttonsContainer);
    content.appendChild(errorElement);
    // 弹窗底部
    const footer = document.createElement('div');
    footer.className = 'longport-ai-popup-footer';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'longport-ai-btn longport-ai-btn-default';
    closeBtn.textContent = '关闭';
    closeBtn.addEventListener('click', removePopup);
    footer.appendChild(closeBtn);
    // 组装弹窗
    popupElement.appendChild(header);
    popupElement.appendChild(content);
    popupElement.appendChild(footer);
    // 智能定位弹窗
    positionPopupIntelligently();
    // 添加到页面
    document.body.appendChild(popupElement);
    // 设置拖拽功能
    makeElementDraggable(popupElement, header);
    // 添加动画效果
    setTimeout(() => {
        if (popupElement) {
            popupElement.style.opacity = '1';
        }
    }, 10);
}
// 显示错误弹窗
function showErrorPopup(errorMessage) {
    // 清除任何已存在的弹窗
    if (popupElement && popupElement.parentNode) {
        // 直接移除而不使用动画效果，避免闪现
        popupElement.parentNode.removeChild(popupElement);
        popupElement = null;
        shadowRoot = null;
        shadowHost = null;
    }
    // 调试日志
    console.log('显示错误弹窗:', errorMessage);
    // 创建弹窗元素
    popupElement = document.createElement('div');
    popupElement.className = 'longport-ai-popup';
    popupElement.style.zIndex = '2147483647'; // 最大z-index值
    // 弹窗头部
    const header = document.createElement('div');
    header.className = 'longport-ai-popup-header';
    const title = document.createElement('h3');
    title.className = 'longport-ai-popup-title';
    title.textContent = 'LongPort AI - 错误';
    const closeButton = document.createElement('button');
    closeButton.className = 'longport-ai-popup-close';
    closeButton.innerHTML = ''; // 使用CSS伪元素来添加X符号
    closeButton.addEventListener('click', removePopup);
    header.appendChild(title);
    header.appendChild(closeButton);
    // 弹窗内容
    const content = document.createElement('div');
    content.className = 'longport-ai-popup-content';
    const errorElement = document.createElement('div');
    errorElement.className = 'longport-ai-error';
    // 显示错误信息
    const errorTitle = document.createElement('div');
    errorTitle.className = 'longport-ai-error-title';
    errorTitle.textContent = errorMessage;
    errorElement.appendChild(errorTitle);
    // 处理不同类型的错误
    if (errorMessage.includes('API 未配置') || errorMessage.includes('API_NOT_CONFIGURED')) {
        // API未配置错误
        const settingsButton = document.createElement('button');
        settingsButton.className = 'longport-ai-btn longport-ai-btn-primary';
        settingsButton.style.marginTop = '12px';
        settingsButton.textContent = '前往设置';
        settingsButton.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
            removePopup();
        });
        errorElement.appendChild(document.createElement('br'));
        errorElement.appendChild(settingsButton);
    }
    else if (errorMessage.includes('网络') || errorMessage.includes('连接')) {
        // 网络连接错误
        const errorDetails = document.createElement('div');
        errorDetails.className = 'longport-ai-error-details';
        errorDetails.innerHTML = `
      <p>无法连接到API服务器，请检查：</p>
      <ul>
        <li>您的网络连接是否正常</li>
        <li>API服务器是否可用</li>
        <li>API地址是否正确</li>
      </ul>
    `;
        errorElement.appendChild(errorDetails);
        const retryButton = document.createElement('button');
        retryButton.className = 'longport-ai-btn longport-ai-btn-primary';
        retryButton.style.marginTop = '12px';
        retryButton.textContent = '重试';
        retryButton.addEventListener('click', () => {
            removePopup();
            // 如果有保存的文本，重试优化
            if (currentSelection && currentSelection.text) {
                const textToOptimize = currentSelection.text;
                setTimeout(() => optimizeText(textToOptimize), 100);
            }
        });
        errorElement.appendChild(retryButton);
    }
    content.appendChild(errorElement);
    // 弹窗底部
    const footer = document.createElement('div');
    footer.className = 'longport-ai-popup-footer';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'longport-ai-btn longport-ai-btn-default';
    closeBtn.textContent = '关闭';
    closeBtn.addEventListener('click', removePopup);
    footer.appendChild(closeBtn);
    // 组装弹窗
    popupElement.appendChild(header);
    popupElement.appendChild(content);
    popupElement.appendChild(footer);
    // 智能定位弹窗
    positionPopupIntelligently();
    // 添加到页面
    document.body.appendChild(popupElement);
    // 设置拖拽功能
    makeElementDraggable(popupElement, header);
    // 添加动画效果
    setTimeout(() => {
        if (popupElement) {
            popupElement.style.opacity = '1';
        }
    }, 10);
}
// 移除弹窗
function removePopup() {
    if (popupElement && popupElement.parentNode) {
        // 添加淡出动画
        popupElement.style.opacity = '0';
        popupElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        // 等待动画完成后移除
        setTimeout(() => {
            if (popupElement && popupElement.parentNode) {
                popupElement.parentNode.removeChild(popupElement);
                popupElement = null;
            }
        }, 200);
    }
}
// 显示Toast消息
function showToast(message, type = 'success', duration = 3000) {
    // 创建Toast元素
    const toast = document.createElement('div');
    toast.className = `longport-ai-toast longport-ai-toast-${type}`;
    // 创建内容
    const content = document.createElement('div');
    content.className = 'longport-ai-toast-content';
    content.textContent = message;
    toast.appendChild(content);
    // 添加到页面
    document.body.appendChild(toast);
    // 设置自动消失
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, duration);
}
// 使用剪贴板复制文本的辅助函数
function copyToClipboard(text) {
    return navigator.clipboard.writeText(text)
        .then(() => {
        showToast('文本已复制到剪贴板，请手动粘贴', 'success');
    })
        .catch(error => {
        console.error('复制到剪贴板失败:', error);
        showToast('无法复制到剪贴板: ' + (error instanceof Error ? error.message : String(error)), 'error');
        throw error; // 重新抛出错误以便调用者处理
    });
}
// 替换选中文本
function replaceSelectedText(newText) {
    if (!currentSelection) {
        console.error('没有可替换的文本');
        showToast('没有可替换的文本', 'error');
        return;
    }
    try {
        // 检查是否使用了虚拟范围（临时元素）
        if (window.tempRangeElement) {
            console.log('检测到虚拟范围，使用剪贴板替代');
            // 使用剪贴板 API
            copyToClipboard(newText)
                .then(() => {
                // 清理临时元素
                if (window.tempRangeElement && window.tempRangeElement.parentNode) {
                    window.tempRangeElement.parentNode.removeChild(window.tempRangeElement);
                    window.tempRangeElement = undefined;
                }
            })
                .catch(() => {
                // 错误已在 copyToClipboard 中处理
            });
            return;
        }
        // 确保有有效的范围
        if (!currentSelection.range) {
            console.error('没有有效的范围');
            showToast('没有有效的范围，无法替换文本', 'error');
            return;
        }
        // 检查目标元素是否是可编辑元素
        const containerElement = currentSelection.range.commonAncestorContainer;
        const isEditable = isEditableElement(containerElement);
        // 尝试检测 Notion 编辑器
        const isNotionEditor = containerElement &&
            (containerElement.parentElement?.className.includes('notion') ||
                containerElement.parentElement?.parentElement?.className.includes('notion'));
        if (isNotionEditor) {
            console.log('检测到 Notion 编辑器，尝试特殊处理');
            // 尝试使用 Notion 特定的方法
            try {
                // 先尝试常规方法
                const textNode = document.createTextNode(newText);
                currentSelection.range.deleteContents();
                currentSelection.range.insertNode(textNode);
                // 创建新的范围选择插入的文本
                const selection = window.getSelection();
                if (selection && textNode.parentNode) {
                    const range = document.createRange();
                    range.selectNodeContents(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    // 延迟显示成功消息，确保替换和选中都已完成
                    setTimeout(() => {
                        showToast('文本替换成功', 'success');
                    }, 100);
                }
                else {
                    showToast('文本替换成功', 'success');
                }
            }
            catch (notionError) {
                console.error('Notion 编辑器替换失败:', notionError);
                // 尝试使用 execCommand 方法（对某些编辑器更有效）
                try {
                    document.execCommand('insertText', false, newText);
                    showToast('文本替换成功', 'success');
                }
                catch (execError) {
                    console.error('execCommand 替换失败:', execError);
                    // 回退到剪贴板方法
                    copyToClipboard(newText).catch(() => {
                        // 错误已在 copyToClipboard 中处理
                        showToast('无法替换文本，也无法复制到剪贴板', 'error');
                    });
                }
            }
        }
        else if (isEditable) {
            console.log('在可编辑元素中替换文本');
            // 尝试使用 execCommand 方法（对某些编辑器更有效）
            try {
                const success = document.execCommand('insertText', false, newText);
                if (success) {
                    // 显示成功消息
                    showToast('文本替换成功', 'success');
                    return;
                }
            }
            catch (execError) {
                console.log('execCommand 方法失败，尝试使用 DOM API:', execError);
            }
            // 创建一个新的文本节点
            const textNode = document.createTextNode(newText);
            // 删除选中的内容
            currentSelection.range.deleteContents();
            // 插入新的文本节点
            currentSelection.range.insertNode(textNode);
            // 创建新的范围选择插入的文本
            const selection = window.getSelection();
            if (selection && textNode.parentNode) {
                const range = document.createRange();
                range.selectNodeContents(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            // 延迟显示成功消息，确保替换和选中都已完成
            setTimeout(() => {
                showToast('文本替换成功', 'success');
            }, 100);
        }
        else {
            // 对于不可编辑元素，尝试使用 clipboard API
            console.log('目标不是可编辑元素，尝试使用剪贴板');
            // 将优化后的文本复制到剪贴板
            copyToClipboard(newText).catch(() => {
                // 错误已在 copyToClipboard 中处理
            });
        }
    }
    catch (error) {
        console.error('替换文本失败:', error);
        // 尝试使用剪贴板作为备用方案
        copyToClipboard(newText).catch(() => {
            // 如果剪贴板也失败，显示原始错误
            showToast('替换文本失败: ' + (error instanceof Error ? error.message : String(error)), 'error');
        });
    }
    finally {
        // 清理临时元素（如果有）
        if (window.tempRangeElement && window.tempRangeElement.parentNode) {
            window.tempRangeElement.parentNode.removeChild(window.tempRangeElement);
            window.tempRangeElement = undefined;
        }
    }
}
// 检查元素是否可编辑
function isEditableElement(node) {
    if (!node)
        return false;
    // 如果是文本节点，检查其父元素
    if (node.nodeType === Node.TEXT_NODE) {
        return isEditableElement(node.parentNode);
    }
    // 如果是元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        // 检查是否是可编辑元素
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return true;
        }
        // 检查是否有 contentEditable 属性
        if (element.getAttribute('contenteditable') === 'true') {
            return true;
        }
        // 递归检查父元素
        return isEditableElement(element.parentNode);
    }
    return false;
}
// 使元素可拖拽
function makeElementDraggable(element, dragHandle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    dragHandle.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e.preventDefault();
        // 获取鼠标初始位置
        pos3 = e.clientX;
        pos4 = e.clientY;
        // 添加拖拽中的视觉反馈
        element.classList.add('longport-ai-dragging');
        // 添加事件监听
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e.preventDefault();
        // 计算新位置
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // 设置元素新位置
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        // 移除默认的 transform
        element.style.transform = 'none';
    }
    function closeDragElement() {
        // 移除拖拽中的视觉反馈
        element.classList.remove('longport-ai-dragging');
        // 移除事件监听
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
/**
 * 保存优化记录到本地存储
 */
async function saveOptimizationRecord(originalText, optimizedText, stats) {
    try {
        // 获取当前页面信息
        const sourceUrl = window.location.href;
        const sourceDomain = window.location.hostname;
        // 获取优化模式（默认为基础模式）
        const getOptimizationMode = async () => {
            return new Promise((resolve) => {
                chrome.storage.sync.get(['strictMode'], (items) => {
                    const isStrictMode = items.strictMode;
                    resolve(isStrictMode ? _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.OptimizationMode.STRICT : _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.OptimizationMode.BASIC);
                });
            });
        };
        const mode = await getOptimizationMode();
        // 计算统计信息
        const changeAmount = stats.optimizedLength - stats.originalLength;
        const percentageChange = stats.originalLength > 0
            ? Math.round((changeAmount / stats.originalLength) * 100)
            : 0;
        // 创建优化统计信息对象
        const optimizationStats = {
            originalLength: stats.originalLength,
            optimizedLength: stats.optimizedLength,
            lengthDifference: changeAmount,
            percentageChange: percentageChange,
            processingTime: 0 // 不记录处理时间，因为这里无法获取
        };
        // 保存记录
        await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.saveRecord({
            sourceUrl,
            sourceDomain,
            originalText,
            optimizedText,
            mode,
            stats: optimizationStats
        });
        console.log('优化记录已保存');
    }
    catch (error) {
        console.error('保存优化记录失败:', error);
        // 记录保存失败不影响主流程，所以不抛出异常
    }
}

})();

/******/ })()
;
//# sourceMappingURL=index.js.map