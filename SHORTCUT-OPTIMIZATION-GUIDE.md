# 快捷键触发优化功能使用指南

## 功能概述

本次更新为 LongPort AI 助手添加了快捷键触发文本优化功能，使用户可以通过键盘快捷键快速优化选中的文本，无需使用右键菜单。

## 实现内容

1. 在 `manifest.json` 中添加了命令 `optimize-selection`，默认快捷键为 Alt+O（Mac 上为 Option+O）
2. 在 `background.js` 中实现了命令监听和处理逻辑：
   - 获取当前活动标签页中选中的文本
   - 调用 API 进行文本优化
   - 将优化结果发送回内容脚本显示
3. 在 `content.js` 中添加了处理优化结果的逻辑，显示优化后的文本

## 验证步骤

1. 访问支持的网站（Notion 或 LongPort 文档）
2. 选中一段文字
3. 按下 Alt+O（Mac 上为 Option+O）快捷键
4. 查看弹出的优化结果弹窗，应显示优化后的文本和操作按钮
5. 点击"替换"按钮将选中的文本替换为优化后的文本，或点击"取消"关闭弹窗

## 注意事项

- 如果快捷键冲突，用户可以在 Chrome 扩展管理页面 (chrome://extensions/shortcuts) 重新绑定快捷键
- 在不支持的网站上使用快捷键会显示提示信息
- 如果未选中文本就使用快捷键，会提示用户先选中文本

## 回滚方法

如需回滚此功能，请执行以下操作：

1. 从 `manifest.json` 中移除 `commands` 部分
2. 从 `background.js` 中移除 `chrome.commands.onCommand.addListener` 部分及相关函数
3. 从 `content.js` 中移除 `optimizationResult` 处理逻辑和 `showOptimizationResult` 函数

## 技术说明

- 该功能使用 Chrome 扩展的命令 API 实现快捷键监听
- 在内容脚本未注入的情况下，会使用临时注入脚本显示优化结果
- 优化结果会保存到历史记录中，与右键菜单触发的优化结果一致
