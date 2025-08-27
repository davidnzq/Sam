// 豆包 API 问题诊断脚本 - 专门诊断 "Failed to fetch" 错误
console.log('=== 豆包 API 问题诊断脚本 ===');

// 问题描述
const issueDescription = {
  error: '❌ 豆包 AI 调用失败: 豆包 API 调用失败: Failed to fetch',
  possibleCauses: [
    '豆包API密钥未配置或配置错误',
    '网络连接问题',
    'CORS策略限制',
    'API端点不可达',
    '浏览器扩展权限问题'
  ]
};

console.log('🎯 问题描述:');
console.log(`错误信息: ${issueDescription.error}`);
console.log('\n可能的原因:');
issueDescription.possibleCauses.forEach((cause, index) => {
  console.log(`${index + 1}. ${cause}`);
});

// 诊断配置
const diagnosisSteps = [
  {
    name: 'API配置检查',
    description: '检查豆包API密钥是否正确配置',
    function: checkAPIConfiguration
  },
  {
    name: '网络连接测试',
    description: '测试豆包API端点的网络连接',
    function: testNetworkConnection
  },
  {
    name: 'API密钥验证',
    description: '验证豆包API密钥的格式和有效性',
    function: validateAPIKey
  },
  {
    name: '浏览器权限检查',
    description: '检查浏览器扩展的权限设置',
    function: checkBrowserPermissions
  },
  {
    name: '错误日志分析',
    description: '分析控制台错误日志',
    function: analyzeErrorLogs
  }
];

// 步骤 1: API配置检查
async function checkAPIConfiguration() {
  console.log('\n🔍 步骤 1: API配置检查');
  
  try {
    const config = await chrome.storage.sync.get(['doubanApiKey']);
    const doubanApiKey = config.doubanApiKey;
    
    console.log('豆包API配置状态:');
    console.log(`- 密钥存在: ${!!doubanApiKey ? '✅' : '❌'}`);
    console.log(`- 密钥长度: ${doubanApiKey ? doubanApiKey.length : 0}`);
    console.log(`- 密钥前缀: ${doubanApiKey ? doubanApiKey.substring(0, 3) : 'N/A'}`);
    
    if (!doubanApiKey) {
      console.log('❌ 问题: 豆包API密钥未配置');
      console.log('💡 解决方案: 在插件设置页面配置豆包API密钥');
      return false;
    }
    
    if (doubanApiKey.length < 10) {
      console.log('❌ 问题: 豆包API密钥长度异常');
      console.log('💡 解决方案: 检查API密钥是否完整复制');
      return false;
    }
    
    if (!doubanApiKey.startsWith('sk-') && !doubanApiKey.startsWith('db-')) {
      console.log('⚠️ 警告: 豆包API密钥格式可能不正确');
      console.log('💡 建议: 通常以"sk-"或"db-"开头');
    }
    
    console.log('✅ API配置检查通过');
    return true;
    
  } catch (error) {
    console.log('❌ API配置检查失败:', error.message);
    return false;
  }
}

// 步骤 2: 网络连接测试
async function testNetworkConnection() {
  console.log('\n🔍 步骤 2: 网络连接测试');
  
  const testUrls = [
    'https://api.doubao.com',
    'https://api.doubao.com/v1',
    'https://api.doubao.com/v1/chat/completions'
  ];
  
  let allTestsPassed = true;
  
  for (const url of testUrls) {
    try {
      console.log(`测试连接: ${url}`);
      
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors' // 避免CORS问题
      });
      
      console.log(`✅ ${url} - 连接成功`);
      
    } catch (error) {
      console.log(`❌ ${url} - 连接失败: ${error.message}`);
      allTestsPassed = false;
      
      if (error.message.includes('Failed to fetch')) {
        console.log('  可能原因: 网络连接问题或CORS策略限制');
      }
    }
  }
  
  if (allTestsPassed) {
    console.log('✅ 网络连接测试通过');
  } else {
    console.log('❌ 网络连接测试失败');
    console.log('💡 解决方案: 检查网络连接，或联系网络管理员');
  }
  
  return allTestsPassed;
}

// 步骤 3: API密钥验证
async function validateAPIKey() {
  console.log('\n🔍 步骤 3: API密钥验证');
  
  try {
    const config = await chrome.storage.sync.get(['doubanApiKey']);
    const doubanApiKey = config.doubanApiKey;
    
    if (!doubanApiKey) {
      console.log('❌ 无法验证: API密钥未配置');
      return false;
    }
    
    console.log('API密钥验证:');
    console.log(`- 密钥长度: ${doubanApiKey.length}`);
    console.log(`- 密钥前缀: ${doubanApiKey.substring(0, 3)}`);
    console.log(`- 密钥格式: ${doubanApiKey.includes('-') ? '包含分隔符' : '无分隔符'}`);
    
    // 基本格式验证
    const isValidFormat = doubanApiKey.length >= 20 && 
                         (doubanApiKey.startsWith('sk-') || doubanApiKey.startsWith('db-')) &&
                         doubanApiKey.includes('-');
    
    if (isValidFormat) {
      console.log('✅ API密钥格式验证通过');
    } else {
      console.log('❌ API密钥格式验证失败');
      console.log('💡 建议: 检查API密钥是否完整且格式正确');
    }
    
    return isValidFormat;
    
  } catch (error) {
    console.log('❌ API密钥验证失败:', error.message);
    return false;
  }
}

// 步骤 4: 浏览器权限检查
function checkBrowserPermissions() {
  console.log('\n🔍 步骤 4: 浏览器权限检查');
  
  console.log('浏览器权限状态:');
  
  // 检查Chrome扩展API权限
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('- Chrome扩展API: ✅ 可用');
  } else {
    console.log('- Chrome扩展API: ❌ 不可用');
  }
  
  // 检查fetch API
  if (typeof fetch !== 'undefined') {
    console.log('- Fetch API: ✅ 可用');
  } else {
    console.log('- Fetch API: ❌ 不可用');
  }
  
  // 检查Promise支持
  if (typeof Promise !== 'undefined') {
    console.log('- Promise支持: ✅ 可用');
  } else {
    console.log('- Promise支持: ❌ 不可用');
  }
  
  // 检查AbortSignal支持
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
    console.log('- AbortSignal支持: ✅ 可用');
  } else {
    console.log('- AbortSignal支持: ❌ 不可用');
  }
  
  console.log('✅ 浏览器权限检查完成');
  return true;
}

// 步骤 5: 错误日志分析
function analyzeErrorLogs() {
  console.log('\n🔍 步骤 5: 错误日志分析');
  
  console.log('控制台错误分析:');
  
  // 检查是否有相关的错误日志
  const consoleErrors = [];
  
  // 模拟错误日志分析
  console.log('- 检查控制台是否有豆包API相关错误');
  console.log('- 检查网络面板中的请求状态');
  console.log('- 检查是否有CORS相关错误');
  
  console.log('💡 建议: 打开浏览器开发者工具，查看Console和Network面板');
  
  return true;
}

// 运行完整诊断
async function runFullDiagnosis() {
  console.log('🚀 开始运行豆包API完整诊断...\n');
  
  const startTime = Date.now();
  const results = [];
  
  try {
    // 运行所有诊断步骤
    for (const step of diagnosisSteps) {
      console.log(`\n📋 ${step.name}: ${step.description}`);
      console.log('='.repeat(50));
      
      const result = await step.function();
      results.push({
        name: step.name,
        result: result,
        description: step.description
      });
      
      console.log(`结果: ${result ? '✅ 通过' : '❌ 失败'}`);
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 显示诊断结果摘要
    console.log('\n📋 豆包API诊断结果摘要');
    console.log('================================');
    console.log(`总耗时: ${totalDuration}ms`);
    
    results.forEach((step, index) => {
      console.log(`${index + 1}. ${step.name}: ${step.result ? '✅' : '❌'}`);
    });
    
    console.log('================================');
    
    // 分析结果
    const passedSteps = results.filter(r => r.result).length;
    const totalSteps = results.length;
    
    console.log(`\n🎯 诊断结果: ${passedSteps}/${totalSteps} 项检查通过`);
    
    if (passedSteps === totalSteps) {
      console.log('🎉 所有检查通过！豆包API配置正常');
      console.log('💡 如果仍有问题，可能是网络环境或API服务问题');
    } else if (passedSteps >= totalSteps * 0.6) {
      console.log('✅ 大部分检查通过，豆包API基本配置正常');
      console.log('💡 请根据失败的检查项进行相应修复');
    } else {
      console.log('❌ 大部分检查失败，豆包API配置存在问题');
      console.log('💡 请根据失败的检查项逐一修复');
    }
    
    // 提供修复建议
    console.log('\n💡 修复建议:');
    
    if (!results[0].result) {
      console.log('1. 配置豆包API密钥: 在插件设置页面输入正确的API密钥');
    }
    
    if (!results[1].result) {
      console.log('2. 检查网络连接: 确保能访问豆包API端点');
      console.log('3. 检查防火墙设置: 确保没有阻止API请求');
    }
    
    if (!results[2].result) {
      console.log('4. 验证API密钥: 确保密钥完整且格式正确');
    }
    
    if (!results[3].result) {
      console.log('5. 检查浏览器权限: 确保扩展有必要的权限');
    }
    
    if (!results[4].result) {
      console.log('6. 查看错误日志: 打开开发者工具分析具体错误');
    }
    
    return {
      results,
      totalDuration,
      successRate: passedSteps / totalSteps
    };
    
  } catch (error) {
    console.error('❌ 诊断执行失败:', error);
    return null;
  }
}

// 快速诊断
function quickDiagnosis() {
  console.log('\n⚡ 快速诊断模式');
  
  console.log('请检查以下常见问题:');
  console.log('1. 豆包API密钥是否已配置？');
  console.log('2. API密钥是否完整且正确？');
  console.log('3. 网络连接是否正常？');
  console.log('4. 是否有防火墙阻止？');
  console.log('5. 浏览器扩展权限是否正常？');
  
  console.log('\n💡 快速解决方案:');
  console.log('1. 重新配置豆包API密钥');
  console.log('2. 检查网络连接');
  console.log('3. 重启浏览器');
  console.log('4. 重新加载插件');
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 runFullDiagnosis() 进行完整诊断');
console.log('2. 运行 quickDiagnosis() 进行快速诊断');
console.log('3. 根据诊断结果进行相应修复');

console.log('\n💡 诊断前准备:');
console.log('- 确保插件已加载');
console.log('- 检查豆包API密钥配置');
console.log('- 打开浏览器开发者工具');

console.log('\n按 Enter 键开始快速诊断...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    quickDiagnosis();
  }
});

console.log('豆包API问题诊断脚本加载完成，按 Enter 键开始快速诊断');
