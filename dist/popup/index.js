/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/popup/popup.css":
/*!*****************************!*\
  !*** ./src/popup/popup.css ***!
  \*****************************/
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
/*!****************************!*\
  !*** ./src/popup/index.ts ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _popup_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./popup.css */ "./src/popup/popup.css");
/**
 * LongPort AI 助手 - 弹出窗口脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    // 获取设置按钮元素
    const optionsBtn = document.getElementById('optionsBtn');
    // 添加点击事件监听器
    if (optionsBtn) {
        optionsBtn.addEventListener('click', () => {
            // 打开选项页
            chrome.runtime.openOptionsPage();
        });
    }
    // 获取记录按钮元素
    const recordsBtn = document.getElementById('recordsBtn');
    // 添加点击事件监听器
    if (recordsBtn) {
        recordsBtn.addEventListener('click', () => {
            // 打开侧边栏面板
            chrome.sidePanel.open({ tabId: chrome.tabs.TAB_ID_NONE });
        });
    }
    // 获取当前标签页信息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        // 这里可以根据当前页面判断是否显示某些功能
        if (currentTab.url) {
            // 例如检查是否在 Notion 或 LongPort 平台
            const isNotionOrLongPort = currentTab.url.includes('notion.so') ||
                currentTab.url.includes('longport.com');
            // 根据页面类型调整界面
            if (isNotionOrLongPort) {
                // 可以在这里添加特定平台的功能
            }
        }
    });
});

})();

/******/ })()
;
//# sourceMappingURL=index.js.map