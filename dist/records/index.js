/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/records/records.css":
/*!*********************************!*\
  !*** ./src/records/records.css ***!
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
  !*** ./src/records/index.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _records_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./records.css */ "./src/records/records.css");
/* harmony import */ var _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/record-manager */ "./src/utils/record-manager.ts");
/**
 * LongPort AI Pro - 优化记录管理页面脚本
 */


// DOM 元素引用
const recordsCount = document.getElementById('recordsCount');
const recordsList = document.getElementById('recordsList');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const noResults = document.getElementById('noResults');
const recordDetail = document.getElementById('recordDetail');
const dialogOverlay = document.getElementById('dialogOverlay');
const confirmDialog = document.getElementById('confirmDialog');
const filterMenu = document.getElementById('filterMenu');
const domainList = document.getElementById('domainList');
// 记录详情元素
const detailTimestamp = document.getElementById('detailTimestamp');
const detailDomain = document.getElementById('detailDomain');
const detailMode = document.getElementById('detailMode');
const detailOriginalLength = document.getElementById('detailOriginalLength');
const detailOptimizedLength = document.getElementById('detailOptimizedLength');
const detailLengthChange = document.getElementById('detailLengthChange');
const detailOriginalText = document.getElementById('detailOriginalText');
const detailOptimizedText = document.getElementById('detailOptimizedText');
// 当前查看的记录ID
let currentRecordId = null;
// 当前筛选条件
let currentFilter = {};
// 当前确认对话框回调
let confirmCallback = null;
/**
 * 初始化页面
 */
async function initPage() {
    try {
        // 显示加载状态
        showLoading(true);
        // 加载记录
        await loadRecords();
        // 加载域名列表（用于筛选）
        await loadDomainList();
        // 初始化事件监听
        setupEventListeners();
        // 隐藏加载状态
        showLoading(false);
    }
    catch (error) {
        console.error('初始化页面失败:', error);
        showToast('加载记录失败，请重试', 'error');
        showLoading(false);
    }
}
/**
 * 加载优化记录
 */
async function loadRecords() {
    try {
        // 获取记录
        const records = await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.filterRecords(currentFilter);
        // 更新记录计数
        updateRecordsCount(records.length);
        // 清空记录列表
        recordsList.innerHTML = '';
        // 根据记录数量显示不同的视图
        if (records.length === 0) {
            // 如果有筛选条件但没有记录，显示"无结果"
            if (Object.keys(currentFilter).length > 0) {
                showNoResults(true);
                showEmptyState(false);
            }
            else {
                // 如果没有筛选条件也没有记录，显示"空状态"
                showEmptyState(true);
                showNoResults(false);
            }
        }
        else {
            // 有记录，隐藏空状态和无结果
            showEmptyState(false);
            showNoResults(false);
            // 渲染记录列表
            records.forEach(record => {
                recordsList.appendChild(createRecordItem(record));
            });
        }
    }
    catch (error) {
        console.error('加载记录失败:', error);
        showToast('加载记录失败，请重试', 'error');
    }
}
/**
 * 加载域名列表（用于筛选）
 */
async function loadDomainList() {
    try {
        // 获取记录统计
        const stats = await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.getRecordStats();
        // 清空域名列表
        domainList.innerHTML = '';
        // 如果没有记录，显示提示
        if (stats.totalCount === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'domain-item';
            emptyItem.textContent = '暂无记录';
            domainList.appendChild(emptyItem);
            return;
        }
        // 添加域名选项
        Object.keys(stats.domainCounts).forEach(domain => {
            const count = stats.domainCounts[domain];
            const domainItem = document.createElement('div');
            domainItem.className = 'domain-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `domain-${domain}`;
            checkbox.value = domain;
            checkbox.checked = true;
            const label = document.createElement('label');
            label.htmlFor = `domain-${domain}`;
            label.textContent = `${domain} (${count})`;
            domainItem.appendChild(checkbox);
            domainItem.appendChild(label);
            domainList.appendChild(domainItem);
        });
    }
    catch (error) {
        console.error('加载域名列表失败:', error);
    }
}
/**
 * 创建记录列表项
 */
function createRecordItem(record) {
    const item = document.createElement('div');
    item.className = 'record-item';
    item.dataset.id = record.id;
    // 格式化时间
    const date = new Date(record.timestamp);
    const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    // 模式标签类名
    const modeClass = record.mode === _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.OptimizationMode.STRICT ? 'record-mode strict' : 'record-mode';
    // 文本预览（截取前20个字符）
    const textPreview = record.originalText.length > 20
        ? record.originalText.substring(0, 20) + '...'
        : record.originalText;
    // 构建HTML
    item.innerHTML = `
    <div class="record-header">
      <span class="record-time">${formattedDate}</span>
      <span class="${modeClass}">${record.mode === _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.OptimizationMode.STRICT ? '严格模式' : '基础模式'}</span>
    </div>
    <div class="record-preview">${textPreview}</div>
    <div class="record-source">
      <span class="source-icon" style="background-image: url('https://www.google.com/s2/favicons?domain=${record.sourceDomain}')"></span>
      <span>${record.sourceDomain}</span>
    </div>
  `;
    // 添加点击事件
    item.addEventListener('click', () => {
        showRecordDetail(record.id);
    });
    return item;
}
/**
 * 显示记录详情
 */
async function showRecordDetail(id) {
    try {
        // 保存当前记录ID
        currentRecordId = id;
        // 获取记录
        const record = await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.getRecordById(id);
        if (!record) {
            showToast('记录不存在或已被删除', 'error');
            return;
        }
        // 格式化时间
        const date = new Date(record.timestamp);
        const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
        // 更新详情视图
        detailTimestamp.textContent = formattedDate;
        detailDomain.textContent = record.sourceDomain;
        detailMode.textContent = record.mode === _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.OptimizationMode.STRICT ? '严格模式' : '基础模式';
        // 更新统计信息
        detailOriginalLength.textContent = record.stats.originalLength.toString();
        detailOptimizedLength.textContent = record.stats.optimizedLength.toString();
        // 字数变化
        const changeAmount = record.stats.lengthDifference;
        const changeText = changeAmount > 0 ? `+${changeAmount}` : `${changeAmount}`;
        detailLengthChange.textContent = changeText;
        detailLengthChange.className = `stat-value ${changeAmount >= 0 ? 'positive' : 'negative'}`;
        // 更新文本内容
        detailOriginalText.textContent = record.originalText;
        detailOptimizedText.textContent = record.optimizedText;
        // 显示详情视图
        recordDetail.classList.add('show');
        // 设置复制和删除按钮事件
        const copyOriginalBtn = document.getElementById('copyOriginalBtn');
        if (copyOriginalBtn) {
            copyOriginalBtn.onclick = () => copyText(record.originalText);
        }
        const copyOptimizedBtn = document.getElementById('copyOptimizedBtn');
        if (copyOptimizedBtn) {
            copyOptimizedBtn.onclick = () => copyText(record.optimizedText);
        }
        const deleteRecordBtn = document.getElementById('deleteRecordBtn');
        if (deleteRecordBtn) {
            deleteRecordBtn.onclick = () => showConfirmDialog('删除记录', '确定要删除此记录吗？此操作不可撤销。', deleteCurrentRecord);
        }
    }
    catch (error) {
        console.error('显示记录详情失败:', error);
        showToast('加载记录详情失败', 'error');
    }
}
/**
 * 删除当前查看的记录
 */
async function deleteCurrentRecord() {
    if (!currentRecordId)
        return;
    try {
        // 删除记录
        const success = await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.deleteRecord(currentRecordId);
        if (success) {
            // 返回列表视图
            hideRecordDetail();
            // 重新加载记录
            await loadRecords();
            // 显示成功提示
            showToast('记录已删除', 'success');
        }
        else {
            showToast('删除记录失败', 'error');
        }
    }
    catch (error) {
        console.error('删除记录失败:', error);
        showToast('删除记录失败', 'error');
    }
}
/**
 * 清空所有记录
 */
async function clearAllRecords() {
    try {
        // 清空记录
        const success = await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.clearAllRecords();
        if (success) {
            // 重新加载记录
            await loadRecords();
            // 如果正在查看详情，返回列表视图
            hideRecordDetail();
            // 显示成功提示
            showToast('所有记录已清空', 'success');
        }
        else {
            showToast('清空记录失败', 'error');
        }
    }
    catch (error) {
        console.error('清空记录失败:', error);
        showToast('清空记录失败', 'error');
    }
}
/**
 * 导出记录为JSON文件
 */
async function exportRecords() {
    try {
        // 获取JSON数据
        const jsonData = await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.exportRecords();
        // 创建下载链接
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        // 创建下载链接并模拟点击
        const a = document.createElement('a');
        a.href = url;
        a.download = `longport-ai-records-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        // 显示成功提示
        showToast('记录已导出', 'success');
    }
    catch (error) {
        console.error('导出记录失败:', error);
        showToast('导出记录失败', 'error');
    }
}
/**
 * 应用筛选条件
 */
async function applyFilter() {
    try {
        // 构建筛选条件
        const filter = {};
        // 日期范围
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        if (startDateInput.value) {
            filter.startDate = new Date(startDateInput.value).getTime();
        }
        if (endDateInput.value) {
            // 设置为当天结束时间
            const endDate = new Date(endDateInput.value);
            endDate.setHours(23, 59, 59, 999);
            filter.endDate = endDate.getTime();
        }
        // 优化模式
        const filterBasic = document.getElementById('filterBasic');
        const filterStrict = document.getElementById('filterStrict');
        if (filterBasic.checked && !filterStrict.checked) {
            filter.mode = _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.OptimizationMode.BASIC;
        }
        else if (!filterBasic.checked && filterStrict.checked) {
            filter.mode = _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.OptimizationMode.STRICT;
        }
        // 如果都选中或都未选中，不筛选模式
        // 域名筛选
        const selectedDomains = [];
        const domainCheckboxes = domainList.querySelectorAll('input[type="checkbox"]');
        domainCheckboxes.forEach((checkbox) => {
            const cb = checkbox;
            if (cb.checked && cb.value) {
                selectedDomains.push(cb.value);
            }
        });
        // 如果选择了部分域名（不是全部或全不选），添加域名筛选
        if (selectedDomains.length > 0 && selectedDomains.length < domainCheckboxes.length) {
            // 由于recordManager.filterRecords只支持单个域名筛选，这里我们需要手动处理多域名
            // 先获取所有记录，然后在内存中筛选
            const allRecords = await _utils_record_manager__WEBPACK_IMPORTED_MODULE_1__.recordManager.getAllRecords();
            const filteredRecords = allRecords.filter(record => {
                // 应用其他筛选条件
                if (filter.startDate && record.timestamp < filter.startDate) {
                    return false;
                }
                if (filter.endDate && record.timestamp > filter.endDate) {
                    return false;
                }
                if (filter.mode && record.mode !== filter.mode) {
                    return false;
                }
                // 应用域名筛选
                return selectedDomains.includes(record.sourceDomain);
            });
            // 更新记录计数
            updateRecordsCount(filteredRecords.length);
            // 清空记录列表
            recordsList.innerHTML = '';
            // 根据记录数量显示不同的视图
            if (filteredRecords.length === 0) {
                showNoResults(true);
                showEmptyState(false);
            }
            else {
                showEmptyState(false);
                showNoResults(false);
                // 渲染记录列表
                filteredRecords.forEach(record => {
                    recordsList.appendChild(createRecordItem(record));
                });
            }
            // 隐藏筛选菜单
            filterMenu.classList.remove('show');
            return;
        }
        // 搜索文本
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value.trim()) {
            filter.searchText = searchInput.value.trim();
        }
        // 保存当前筛选条件
        currentFilter = filter;
        // 重新加载记录
        await loadRecords();
        // 隐藏筛选菜单
        filterMenu.classList.remove('show');
    }
    catch (error) {
        console.error('应用筛选失败:', error);
        showToast('应用筛选失败', 'error');
    }
}
/**
 * 重置筛选条件
 */
async function resetFilter() {
    try {
        // 重置日期输入
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        startDateInput.value = '';
        endDateInput.value = '';
        // 重置模式选择
        const filterBasic = document.getElementById('filterBasic');
        const filterStrict = document.getElementById('filterStrict');
        filterBasic.checked = true;
        filterStrict.checked = true;
        // 重置域名选择
        const domainCheckboxes = domainList.querySelectorAll('input[type="checkbox"]');
        domainCheckboxes.forEach((checkbox) => {
            checkbox.checked = true;
        });
        // 重置搜索输入
        const searchInput = document.getElementById('searchInput');
        searchInput.value = '';
        // 清空筛选条件
        currentFilter = {};
        // 重新加载记录
        await loadRecords();
        // 隐藏筛选菜单
        filterMenu.classList.remove('show');
    }
    catch (error) {
        console.error('重置筛选失败:', error);
        showToast('重置筛选失败', 'error');
    }
}
/**
 * 设置事件监听
 */
function setupEventListeners() {
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            showLoading(true);
            await loadRecords();
            showLoading(false);
        });
    }
    // 导出按钮
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportRecords);
    }
    // 清空按钮
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            showConfirmDialog('清空所有记录', '确定要清空所有记录吗？此操作不可撤销。', clearAllRecords);
        });
    }
    // 设置按钮
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }
    // 返回列表按钮
    const backToListBtn = document.getElementById('backToListBtn');
    if (backToListBtn) {
        backToListBtn.addEventListener('click', hideRecordDetail);
    }
    // 筛选按钮
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            filterMenu.classList.toggle('show');
        });
    }
    // 点击其他地方关闭筛选菜单
    document.addEventListener('click', (event) => {
        if (filterMenu.classList.contains('show') &&
            !filterMenu.contains(event.target) &&
            !filterBtn?.contains(event.target)) {
            filterMenu.classList.remove('show');
        }
    });
    // 应用筛选按钮
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyFilter);
    }
    // 重置筛选按钮
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetFilter);
    }
    // 搜索输入框
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                currentFilter.searchText = searchInput.value.trim();
                loadRecords();
            }
        });
    }
    // 确认对话框
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    if (closeDialogBtn) {
        closeDialogBtn.addEventListener('click', hideConfirmDialog);
    }
    const cancelDialogBtn = document.getElementById('cancelDialogBtn');
    if (cancelDialogBtn) {
        cancelDialogBtn.addEventListener('click', hideConfirmDialog);
    }
    const confirmDialogBtn = document.getElementById('confirmDialogBtn');
    if (confirmDialogBtn) {
        confirmDialogBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback();
                confirmCallback = null;
            }
            hideConfirmDialog();
        });
    }
}
/**
 * 更新记录计数显示
 */
function updateRecordsCount(count) {
    recordsCount.textContent = `${count} 条记录`;
}
/**
 * 显示/隐藏加载状态
 */
function showLoading(show) {
    if (show) {
        loadingState.classList.add('show');
    }
    else {
        loadingState.classList.remove('show');
    }
}
/**
 * 显示/隐藏空状态
 */
function showEmptyState(show) {
    if (show) {
        emptyState.style.display = 'flex';
    }
    else {
        emptyState.style.display = 'none';
    }
}
/**
 * 显示/隐藏无结果状态
 */
function showNoResults(show) {
    if (show) {
        noResults.style.display = 'flex';
    }
    else {
        noResults.style.display = 'none';
    }
}
/**
 * 隐藏记录详情视图
 */
function hideRecordDetail() {
    recordDetail.classList.remove('show');
    currentRecordId = null;
}
/**
 * 显示确认对话框
 */
function showConfirmDialog(title, message, callback) {
    const dialogTitle = document.getElementById('dialogTitle');
    const dialogMessage = document.getElementById('dialogMessage');
    if (dialogTitle)
        dialogTitle.textContent = title;
    if (dialogMessage)
        dialogMessage.textContent = message;
    confirmCallback = callback;
    dialogOverlay.classList.add('show');
}
/**
 * 隐藏确认对话框
 */
function hideConfirmDialog() {
    dialogOverlay.classList.remove('show');
    confirmCallback = null;
}
/**
 * 复制文本到剪贴板
 */
function copyText(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
        showToast('已复制到剪贴板', 'success');
    })
        .catch(error => {
        console.error('复制失败:', error);
        showToast('复制失败', 'error');
    });
}
/**
 * 显示通知提示
 */
function showToast(message, type) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.querySelector('.toast-icon');
    if (toast && toastMessage && toastIcon) {
        toastMessage.textContent = message;
        toastIcon.className = `toast-icon ${type}`;
        toast.classList.add('show');
        // 3秒后隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
/**
 * 数字补零
 */
function padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
}
// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

})();

/******/ })()
;
//# sourceMappingURL=index.js.map