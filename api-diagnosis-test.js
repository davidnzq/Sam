/**
 * API诊断测试脚本
 * 用于测试API的各种状态显示
 */

import { optimizeText } from './api-contract.js';

// DOM 元素
const inputText = document.getElementById('input-text');
const optimizeBtn = document.getElementById('optimize-btn');
const showLoadingBtn = document.getElementById('show-loading');
const showEmptyBtn = document.getElementById('show-empty');
const showErrorBtn = document.getElementById('show-error');
const statusContainer = document.getElementById('status-container');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
});

// 绑定事件
function bindEvents() {
    optimizeBtn.addEventListener('click', optimizeTextHandler);
    showLoadingBtn.addEventListener('click', showLoadingState);
    showEmptyBtn.addEventListener('click', showEmptyState);
    showErrorBtn.addEventListener('click', showErrorState);
}

// 优化文本
async function optimizeTextHandler() {
    const text = inputText.value.trim();
    
    if (!text) {
        showEmptyState();
        return;
    }
    
    // 显示加载状态
    showLoadingState();
    
    try {
        // 调用API
        const result = await optimizeText(text);
        
        // 延迟显示结果，以便看到加载效果
        setTimeout(() => {
            if (result && result.text) {
                showSuccessState(result.text);
            } else {
                showEmptyState();
            }
        }, 1500);
        
    } catch (error) {
        // 延迟显示错误，以便看到加载效果
        setTimeout(() => {
            showErrorState(error.message || '处理请求时发生错误');
        }, 1500);
    }
}

// 显示加载状态
function showLoadingState() {
    statusContainer.className = 'status-container status-loading';
    statusContainer.innerHTML = `
        <div class="loading-spinner"></div>
        <p>正在优化文本，请稍候...</p>
    `;
}

// 显示空状态
function showEmptyState() {
    statusContainer.className = 'status-container status-empty';
    statusContainer.innerHTML = `
        <div style="font-size: 48px; color: #bdbdbd; margin-bottom: 15px;">📭</div>
        <h3>暂无结果</h3>
        <p>没有找到符合条件的结果</p>
    `;
}

// 显示错误状态
function showErrorState(message = '发生未知错误') {
    statusContainer.className = 'status-container status-error';
    statusContainer.innerHTML = `
        <h3 style="color: #d32f2f; margin: 0 0 10px 0; font-size: 18px; display: flex; align-items: center;">
            <span style="font-size: 24px; color: #f44336; margin-right: 10px;">⚠️</span> 优化失败
        </h3>
        <p style="color: #666; margin: 0;">${message}</p>
        <button style="background-color: transparent; color: #f44336; border: 1px solid #f44336; border-radius: 4px; padding: 8px 16px; font-size: 14px; margin-top: 15px; cursor: pointer;" id="retry-btn">重试</button>
    `;
    
    // 重试按钮
    document.getElementById('retry-btn').addEventListener('click', optimizeTextHandler);
}

// 显示成功状态
function showSuccessState(result) {
    statusContainer.className = 'status-container';
    statusContainer.innerHTML = `
        <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; border: 1px solid #c8e6c9;">
            <h3 style="color: #2e7d32; margin-top: 0;">优化成功</h3>
            <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                <p style="white-space: pre-wrap; margin: 0;">${result}</p>
            </div>
        </div>
    `;
}
