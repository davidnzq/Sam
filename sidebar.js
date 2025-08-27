// LongPort AI 助手侧边栏脚本
document.addEventListener('DOMContentLoaded', function() {
  console.log('侧边栏已加载');
  
  // 初始化 UI 元素
  const historyTab = document.querySelector('[data-tab="history"]');
  const historyContent = document.getElementById('history-tab');
  const historyDetail = document.getElementById('history-detail');
  const backButton = document.getElementById('back-button');
  const settingsButton = document.querySelector('.settings-button');
  const refreshButton = document.querySelector('.refresh-button');
  const emptyHistory = document.getElementById('empty-history');
  
  // 加载历史记录
  loadHistory();
  
  // 绑定事件
  historyTab.addEventListener('click', () => {
    loadHistory();
  });
  
  backButton.addEventListener('click', () => {
    historyDetail.classList.remove('active');
  });
  
  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  refreshButton.addEventListener('click', () => {
    loadHistory();
  });
  
  // 加载历史记录
  function loadHistory() {
    console.log('加载历史记录');
    
    // 清空历史记录容器
    const historyItems = historyContent.querySelectorAll('.history-item');
    historyItems.forEach(item => item.remove());
    
    // 从存储中获取历史记录
    chrome.storage.local.get(['optimizationHistory'], function(result) {
      const history = result.optimizationHistory || [];
      
      if (history.length === 0) {
        // 显示空状态
        emptyHistory.style.display = 'flex';
      } else {
        // 隐藏空状态
        emptyHistory.style.display = 'none';
        
        // 按时间倒序排序
        history.sort((a, b) => b.timestamp - a.timestamp);
        
        // 显示历史记录
        history.forEach((item, index) => {
          const historyItem = createHistoryItem(item, index);
          historyContent.appendChild(historyItem);
        });
      }
    });
  }
  
  // 创建历史记录项
  function createHistoryItem(item, index) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.dataset.index = index;
    
    const date = new Date(item.timestamp);
    const formattedDate = formatDate(date);
    
    historyItem.innerHTML = `
      <div class="history-item-header">
        <span class="history-item-date">${formattedDate}</span>
        <span class="history-item-site">${item.siteType || '未知网站'}</span>
      </div>
      <div class="history-item-content">${truncateText(item.optimizedText, 100)}</div>
    `;
    
    historyItem.addEventListener('click', () => {
      showHistoryDetail(item);
    });
    
    return historyItem;
  }
  
  // 显示历史记录详情
  function showHistoryDetail(item) {
    const originalTextEl = document.getElementById('original-text');
    const optimizedTextEl = document.getElementById('optimized-text');
    const optimizationTimeEl = document.getElementById('optimization-time');
    
    originalTextEl.textContent = item.originalText || '无原文';
    optimizedTextEl.textContent = item.optimizedText || '无优化结果';
    
    const date = new Date(item.timestamp);
    optimizationTimeEl.textContent = formatDateTime(date);
    
    historyDetail.classList.add('active');
  }
  
  // 格式化日期（仅显示日期）
  function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, today)) {
      return '今天';
    } else if (isSameDay(date, yesterday)) {
      return '昨天';
    } else {
      return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
    }
  }
  
  // 格式化日期和时间
  function formatDateTime(date) {
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
  }
  
  // 判断两个日期是否是同一天
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
  
  // 数字补零
  function padZero(num) {
    return num < 10 ? `0${num}` : num;
  }
  
  // 截断文本
  function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
});
