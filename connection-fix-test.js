// 连接修复测试脚本 - 验证修复后的连接问题
console.log('=== Notion AI 助手连接修复测试 ===');

// 测试 1: 检查 Chrome runtime
function testChromeRuntime() {
  console.log('\n🔍 测试 1: Chrome Runtime 检查');
  
  if (typeof chrome !== 'undefined') {
    console.log('✅ Chrome 对象存在');
    
    if (chrome.runtime) {
      console.log('✅ Chrome runtime 可用');
      return true;
    } else {
      console.log('❌ Chrome runtime 不可用');
      return false;
    }
  } else {
    console.log('❌ Chrome 对象不存在');
    return false;
  }
}

// 测试 2: 检查内容脚本状态
function testContentScriptStatus() {
  console.log('\n🔍 测试 2: 内容脚本状态检查');
  
  if (window.notionAIHelperLoaded) {
    console.log('✅ 内容脚本标记已设置');
  } else {
    console.log('❌ 内容脚本标记未设置');
  }
  
  // 检查是否有其他标记
  const hasContentScript = document.querySelector('script[src*="content.js"]');
  if (hasContentScript) {
    console.log('✅ 发现内容脚本标签');
  } else {
    console.log('ℹ️ 未发现内容脚本标签（这是正常的，因为使用动态注入）');
  }
  
  return true;
}

// 测试 3: 发送 ping 消息
async function testPingMessage() {
  console.log('\n🔍 测试 3: Ping 消息测试');
  
  try {
    console.log('发送 ping 消息...');
    const response = await chrome.runtime.sendMessage({ action: 'ping' });
    
    if (response && response.success) {
      console.log('✅ Ping 消息成功');
      console.log('响应:', response.message);
      return true;
    } else {
      console.log('❌ Ping 消息失败');
      console.log('响应:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Ping 消息异常:', error.message);
    return false;
  }
}

// 测试 4: 测试右键菜单功能
function testContextMenu() {
  console.log('\n🔍 测试 4: 右键菜单功能测试');
  
  // 模拟选择文本
  const testText = '这是一个测试文本，用于验证右键菜单功能。';
  const testElement = document.createElement('div');
  testElement.textContent = testText;
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  testElement.style.top = '-9999px';
  testElement.id = 'test-selection-element';
  document.body.appendChild(testElement);
  
  try {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(testElement);
    selection.removeAllRanges();
    selection.addRange(range);
    
    console.log('✅ 文本选择模拟成功');
    console.log('现在可以右键点击查看"AI 辅助协作"选项');
    
    // 5秒后清理
    setTimeout(() => {
      try {
        document.body.removeChild(testElement);
        selection.removeAllRanges();
        console.log('✅ 测试元素已清理');
      } catch (e) {
        console.log('清理测试元素失败:', e.message);
      }
    }, 5000);
    
    return true;
  } catch (error) {
    console.log('❌ 文本选择模拟失败:', error.message);
    return false;
  }
}

// 测试 5: 检查页面 URL 匹配
function testUrlMatching() {
  console.log('\n🔍 测试 5: URL 匹配检查');
  
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  console.log('当前 URL:', currentUrl);
  console.log('当前域名:', hostname);
  
  const isNotionPage = hostname.includes('notion.so') || 
                      hostname.includes('notion.site') || 
                      hostname.includes('notion.com');
  
  if (isNotionPage) {
    console.log('✅ 当前页面匹配 Notion 域名');
  } else {
    console.log('❌ 当前页面不匹配 Notion 域名');
    console.log('插件可能无法正常工作');
  }
  
  return isNotionPage;
}

// 测试 6: 手动触发内容脚本注入
async function testManualInjection() {
  console.log('\n🔍 测试 6: 手动注入测试');
  
  try {
    // 尝试手动发送消息触发注入
    console.log('尝试发送 showAIPopup 消息...');
    const response = await chrome.runtime.sendMessage({
      action: 'showAIPopup',
      selectedText: '手动注入测试'
    });
    
    if (response && response.success) {
      console.log('✅ 手动注入成功');
      return true;
    } else {
      console.log('❌ 手动注入失败');
      return false;
    }
  } catch (error) {
    console.log('❌ 手动注入异常:', error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行所有连接修复测试...\n');
  
  const results = {
    chromeRuntime: testChromeRuntime(),
    contentScriptStatus: testContentScriptStatus(),
    pingMessage: await testPingMessage(),
    contextMenu: testContextMenu(),
    urlMatching: testUrlMatching(),
    manualInjection: await testManualInjection()
  };
  
  // 显示测试结果摘要
  console.log('\n📋 测试结果摘要');
  console.log('================');
  console.log(`Chrome Runtime: ${results.chromeRuntime ? '✅' : '❌'}`);
  console.log(`内容脚本状态: ${results.contentScriptStatus ? '✅' : '❌'}`);
  console.log(`Ping 消息: ${results.pingMessage ? '✅' : '❌'}`);
  console.log(`右键菜单: ${results.contextMenu ? '✅' : '❌'}`);
  console.log(`URL 匹配: ${results.urlMatching ? '✅' : '❌'}`);
  console.log(`手动注入: ${results.manualInjection ? '✅' : '❌'}`);
  console.log('================');
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  if (successCount === totalCount) {
    console.log('🎉 所有测试通过！插件应该能正常工作');
  } else {
    console.log(`⚠️ ${totalCount - successCount} 个测试失败，插件可能存在问题`);
    
    if (!results.chromeRuntime) {
      console.log('💡 建议: 检查是否在正确的环境中运行');
    }
    if (!results.pingMessage) {
      console.log('💡 建议: 刷新插件并重新加载页面');
    }
    if (!results.urlMatching) {
      console.log('💡 建议: 在 Notion 页面中测试');
    }
  }
  
  return results;
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 testChromeRuntime() 测试 Chrome 环境');
console.log('2. 运行 testContentScriptStatus() 测试内容脚本状态');
console.log('3. 运行 testPingMessage() 测试消息传递');
console.log('4. 运行 testContextMenu() 测试右键菜单');
console.log('5. 运行 testUrlMatching() 测试 URL 匹配');
console.log('6. 运行 testManualInjection() 测试手动注入');
console.log('7. 运行 runAllTests() 运行所有测试');

console.log('\n按 Enter 键开始运行所有测试...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runAllTests();
  }
});

console.log('连接修复测试脚本加载完成，按 Enter 键开始测试');
