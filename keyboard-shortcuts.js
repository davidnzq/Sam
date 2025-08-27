// 添加键盘事件监听
function addKeyboardEventListeners(popup) {
  // 保存弹窗引用，用于全局访问
  aiPopup = popup;
  
  // 监听键盘事件
  popup.addEventListener('keydown', function(event) {
    // 如果按下Enter键
    if (event.key === 'Enter') {
      console.log('检测到Enter键按下，执行替换操作');
      
      // 获取替换按钮
      const replaceBtn = popup.querySelector('.replace-btn');
      
      // 如果替换按钮存在且未禁用，则触发点击事件
      if (replaceBtn && !replaceBtn.disabled) {
        event.preventDefault(); // 阻止默认行为
        replaceBtn.click();
      }
    }
    
    // 如果按下Escape键
    if (event.key === 'Escape') {
      console.log('检测到Escape键按下，关闭弹窗');
      popup.remove();
      aiPopup = null;
    }
  });
}

// 处理双击空格唤起弹窗的功能
let lastSpaceTime = 0;
const DOUBLE_SPACE_THRESHOLD = 500; // 双击空格的时间阈值（毫秒）

// 初始化时添加全局键盘事件监听
function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(event) {
    // 检测空格键
    if (event.key === ' ' || event.code === 'Space') {
      const currentTime = Date.now();
      
      // 如果是双击空格（两次空格按下的时间间隔小于阈值）
      if (currentTime - lastSpaceTime < DOUBLE_SPACE_THRESHOLD) {
        console.log('检测到双击空格，尝试唤起AI助手');
        
        // 获取当前选中的文本
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        // 如果有选中文本，则唤起AI助手
        if (selectedText && selectedText.length > 0) {
          console.log('有选中文本，唤起AI助手');
          event.preventDefault(); // 阻止默认的空格输入
          
          // 如果已经有弹窗，先移除
          if (aiPopup && document.body.contains(aiPopup)) {
            aiPopup.remove();
            aiPopup = null;
          }
          
          // 唤起AI助手弹窗
          showAIPopup(selectedText, detectSiteType());
        }
        
        // 重置计时器
        lastSpaceTime = 0;
      } else {
        // 记录第一次按下空格的时间
        lastSpaceTime = currentTime;
      }
    } else {
      // 如果按下的不是空格键，重置计时器
      lastSpaceTime = 0;
    }
  });
}
