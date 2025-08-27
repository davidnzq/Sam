// content-optimize-handler.js
// 处理文本选择和消息通信

// 获取当前选中的文本
function getSelectedText() {
  return window.getSelection().toString().trim();
}

// 监听来自扩展的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    sendResponse({ selectedText: getSelectedText() });
    return true;
  }
  
  if (request.action === 'replaceSelectedText' && request.text) {
    replaceSelectedText(request.text);
    sendResponse({ success: true });
    return true;
  }
});

// 替换选中的文本
function replaceSelectedText(newText) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  
  const textNode = document.createTextNode(newText);
  range.insertNode(textNode);
  range.selectNode(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
  
  return true;
}

// 添加右键菜单处理
document.addEventListener('contextmenu', (event) => {
  const selectedText = getSelectedText();
  if (selectedText) {
    // 通知background.js有文本被选中
    chrome.runtime.sendMessage({ 
      action: 'textSelected', 
      text: selectedText
    });
  }
});
