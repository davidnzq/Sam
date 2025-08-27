// 操作监听器模块

// 设置操作监听器
export function setupActionListeners() {
  // 监听扩展图标点击事件，打开侧边栏
  chrome.action.onClicked.addListener((tab) => {
    console.log('扩展图标被点击，打开侧边栏');
    chrome.sidePanel.open({ windowId: tab.windowId });
  });
}
