/**
 * LongPort AI Pro - 优化记录管理页面脚本
 */

import './records.css';
import { recordManager, OptimizationRecord, RecordFilter, OptimizationMode } from '../utils/record-manager';

// DOM 元素引用
const recordsCount = document.getElementById('recordsCount') as HTMLElement;
const recordsList = document.getElementById('recordsList') as HTMLElement;
const emptyState = document.getElementById('emptyState') as HTMLElement;
const loadingState = document.getElementById('loadingState') as HTMLElement;
const noResults = document.getElementById('noResults') as HTMLElement;
const recordDetail = document.getElementById('recordDetail') as HTMLElement;
const dialogOverlay = document.getElementById('dialogOverlay') as HTMLElement;
const confirmDialog = document.getElementById('confirmDialog') as HTMLElement;
const filterMenu = document.getElementById('filterMenu') as HTMLElement;
const domainList = document.getElementById('domainList') as HTMLElement;

// 记录详情元素
const detailTimestamp = document.getElementById('detailTimestamp') as HTMLElement;
const detailDomain = document.getElementById('detailDomain') as HTMLElement;
const detailMode = document.getElementById('detailMode') as HTMLElement;
const detailOriginalLength = document.getElementById('detailOriginalLength') as HTMLElement;
const detailOptimizedLength = document.getElementById('detailOptimizedLength') as HTMLElement;
const detailLengthChange = document.getElementById('detailLengthChange') as HTMLElement;
const detailOriginalText = document.getElementById('detailOriginalText') as HTMLElement;
const detailOptimizedText = document.getElementById('detailOptimizedText') as HTMLElement;

// 当前查看的记录ID
let currentRecordId: string | null = null;

// 当前筛选条件
let currentFilter: RecordFilter = {};

// 当前确认对话框回调
let confirmCallback: (() => void) | null = null;

/**
 * 初始化页面
 */
async function initPage(): Promise<void> {
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
  } catch (error) {
    console.error('初始化页面失败:', error);
    showToast('加载记录失败，请重试', 'error');
    showLoading(false);
  }
}

/**
 * 加载优化记录
 */
async function loadRecords(): Promise<void> {
  try {
    // 获取记录
    const records = await recordManager.filterRecords(currentFilter);
    
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
      } else {
        // 如果没有筛选条件也没有记录，显示"空状态"
        showEmptyState(true);
        showNoResults(false);
      }
    } else {
      // 有记录，隐藏空状态和无结果
      showEmptyState(false);
      showNoResults(false);
      
      // 渲染记录列表
      records.forEach(record => {
        recordsList.appendChild(createRecordItem(record));
      });
    }
  } catch (error) {
    console.error('加载记录失败:', error);
    showToast('加载记录失败，请重试', 'error');
  }
}

/**
 * 加载域名列表（用于筛选）
 */
async function loadDomainList(): Promise<void> {
  try {
    // 获取记录统计
    const stats = await recordManager.getRecordStats();
    
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
  } catch (error) {
    console.error('加载域名列表失败:', error);
  }
}

/**
 * 创建记录列表项
 */
function createRecordItem(record: OptimizationRecord): HTMLElement {
  const item = document.createElement('div');
  item.className = 'record-item';
  item.dataset.id = record.id;
  
  // 格式化时间
  const date = new Date(record.timestamp);
  const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
  
  // 模式标签类名
  const modeClass = record.mode === OptimizationMode.STRICT ? 'record-mode strict' : 'record-mode';
  
  // 文本预览（截取前20个字符）
  const textPreview = record.originalText.length > 20 
    ? record.originalText.substring(0, 20) + '...' 
    : record.originalText;
  
  // 构建HTML
  item.innerHTML = `
    <div class="record-header">
      <span class="record-time">${formattedDate}</span>
      <span class="${modeClass}">${record.mode === OptimizationMode.STRICT ? '严格模式' : '基础模式'}</span>
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
async function showRecordDetail(id: string): Promise<void> {
  try {
    // 保存当前记录ID
    currentRecordId = id;
    
    // 获取记录
    const record = await recordManager.getRecordById(id);
    
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
    detailMode.textContent = record.mode === OptimizationMode.STRICT ? '严格模式' : '基础模式';
    
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
    
  } catch (error) {
    console.error('显示记录详情失败:', error);
    showToast('加载记录详情失败', 'error');
  }
}

/**
 * 删除当前查看的记录
 */
async function deleteCurrentRecord(): Promise<void> {
  if (!currentRecordId) return;
  
  try {
    // 删除记录
    const success = await recordManager.deleteRecord(currentRecordId);
    
    if (success) {
      // 返回列表视图
      hideRecordDetail();
      
      // 重新加载记录
      await loadRecords();
      
      // 显示成功提示
      showToast('记录已删除', 'success');
    } else {
      showToast('删除记录失败', 'error');
    }
  } catch (error) {
    console.error('删除记录失败:', error);
    showToast('删除记录失败', 'error');
  }
}

/**
 * 清空所有记录
 */
async function clearAllRecords(): Promise<void> {
  try {
    // 清空记录
    const success = await recordManager.clearAllRecords();
    
    if (success) {
      // 重新加载记录
      await loadRecords();
      
      // 如果正在查看详情，返回列表视图
      hideRecordDetail();
      
      // 显示成功提示
      showToast('所有记录已清空', 'success');
    } else {
      showToast('清空记录失败', 'error');
    }
  } catch (error) {
    console.error('清空记录失败:', error);
    showToast('清空记录失败', 'error');
  }
}

/**
 * 导出记录为JSON文件
 */
async function exportRecords(): Promise<void> {
  try {
    // 获取JSON数据
    const jsonData = await recordManager.exportRecords();
    
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
  } catch (error) {
    console.error('导出记录失败:', error);
    showToast('导出记录失败', 'error');
  }
}

/**
 * 应用筛选条件
 */
async function applyFilter(): Promise<void> {
  try {
    // 构建筛选条件
    const filter: RecordFilter = {};
    
    // 日期范围
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    
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
    const filterBasic = document.getElementById('filterBasic') as HTMLInputElement;
    const filterStrict = document.getElementById('filterStrict') as HTMLInputElement;
    
    if (filterBasic.checked && !filterStrict.checked) {
      filter.mode = OptimizationMode.BASIC;
    } else if (!filterBasic.checked && filterStrict.checked) {
      filter.mode = OptimizationMode.STRICT;
    }
    // 如果都选中或都未选中，不筛选模式
    
    // 域名筛选
    const selectedDomains: string[] = [];
    const domainCheckboxes = domainList.querySelectorAll('input[type="checkbox"]');
    
    domainCheckboxes.forEach((checkbox: Element) => {
      const cb = checkbox as HTMLInputElement;
      if (cb.checked && cb.value) {
        selectedDomains.push(cb.value);
      }
    });
    
    // 如果选择了部分域名（不是全部或全不选），添加域名筛选
    if (selectedDomains.length > 0 && selectedDomains.length < domainCheckboxes.length) {
      // 由于recordManager.filterRecords只支持单个域名筛选，这里我们需要手动处理多域名
      // 先获取所有记录，然后在内存中筛选
      const allRecords = await recordManager.getAllRecords();
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
      } else {
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
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (searchInput.value.trim()) {
      filter.searchText = searchInput.value.trim();
    }
    
    // 保存当前筛选条件
    currentFilter = filter;
    
    // 重新加载记录
    await loadRecords();
    
    // 隐藏筛选菜单
    filterMenu.classList.remove('show');
  } catch (error) {
    console.error('应用筛选失败:', error);
    showToast('应用筛选失败', 'error');
  }
}

/**
 * 重置筛选条件
 */
async function resetFilter(): Promise<void> {
  try {
    // 重置日期输入
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;
    startDateInput.value = '';
    endDateInput.value = '';
    
    // 重置模式选择
    const filterBasic = document.getElementById('filterBasic') as HTMLInputElement;
    const filterStrict = document.getElementById('filterStrict') as HTMLInputElement;
    filterBasic.checked = true;
    filterStrict.checked = true;
    
    // 重置域名选择
    const domainCheckboxes = domainList.querySelectorAll('input[type="checkbox"]');
    domainCheckboxes.forEach((checkbox: Element) => {
      (checkbox as HTMLInputElement).checked = true;
    });
    
    // 重置搜索输入
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    searchInput.value = '';
    
    // 清空筛选条件
    currentFilter = {};
    
    // 重新加载记录
    await loadRecords();
    
    // 隐藏筛选菜单
    filterMenu.classList.remove('show');
  } catch (error) {
    console.error('重置筛选失败:', error);
    showToast('重置筛选失败', 'error');
  }
}

/**
 * 设置事件监听
 */
function setupEventListeners(): void {
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
        !filterMenu.contains(event.target as Node) && 
        !filterBtn?.contains(event.target as Node)) {
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
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
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
function updateRecordsCount(count: number): void {
  recordsCount.textContent = `${count} 条记录`;
}

/**
 * 显示/隐藏加载状态
 */
function showLoading(show: boolean): void {
  if (show) {
    loadingState.classList.add('show');
  } else {
    loadingState.classList.remove('show');
  }
}

/**
 * 显示/隐藏空状态
 */
function showEmptyState(show: boolean): void {
  if (show) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }
}

/**
 * 显示/隐藏无结果状态
 */
function showNoResults(show: boolean): void {
  if (show) {
    noResults.style.display = 'flex';
  } else {
    noResults.style.display = 'none';
  }
}

/**
 * 隐藏记录详情视图
 */
function hideRecordDetail(): void {
  recordDetail.classList.remove('show');
  currentRecordId = null;
}

/**
 * 显示确认对话框
 */
function showConfirmDialog(title: string, message: string, callback: () => void): void {
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogMessage = document.getElementById('dialogMessage');
  
  if (dialogTitle) dialogTitle.textContent = title;
  if (dialogMessage) dialogMessage.textContent = message;
  
  confirmCallback = callback;
  dialogOverlay.classList.add('show');
}

/**
 * 隐藏确认对话框
 */
function hideConfirmDialog(): void {
  dialogOverlay.classList.remove('show');
  confirmCallback = null;
}

/**
 * 复制文本到剪贴板
 */
function copyText(text: string): void {
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
function showToast(message: string, type: 'success' | 'error'): void {
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
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// 导出一个空对象，确保这是一个有效的模块
export {};
