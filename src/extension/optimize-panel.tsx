// src/extension/optimize-panel.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Panel } from './ui/panel';
import { browser } from 'webextension-polyfill-ts';

// 获取当前选中的文本
async function getSelectedText() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return '';
    
    const result = await browser.tabs.sendMessage(tab.id, { action: 'getSelectedText' });
    return result.selectedText || '';
  } catch (error) {
    console.error('获取选中文本失败:', error);
    return '';
  }
}

// 初始化面板
async function initPanel() {
  const container = document.getElementById('optimize-panel');
  if (!container) return;
  
  const selectedText = await getSelectedText();
  
  ReactDOM.render(
    <Panel selectedText={selectedText} />,
    container
  );
}

// 当DOM加载完成后初始化面板
document.addEventListener('DOMContentLoaded', initPanel);
