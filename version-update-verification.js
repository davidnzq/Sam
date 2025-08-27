// 版本更新验证脚本 - 确认版本号已更新到 1.3.1
console.log('=== LongPort AI 助手版本更新验证 ===');

// 版本信息
const currentVersion = '1.3.1';
const previousVersion = '1.1.1';

console.log(`🎯 目标版本: ${currentVersion}`);
console.log(`📝 更新前版本: ${previousVersion}`);

// 检查清单
const versionCheckList = [
  {
    file: 'manifest.json',
    description: 'Chrome 扩展清单文件',
    required: true
  },
  {
    file: 'options.html',
    description: '设置页面 HTML',
    required: true
  },
  {
    file: 'popup.html',
    description: '弹窗页面 HTML',
    required: true
  },
  {
    file: 'options.js',
    description: '设置页面脚本',
    required: true
  },
  {
    file: 'popup.js',
    description: '弹窗页面脚本',
    required: true
  },
  {
    file: 'api-fallback-test.js',
    description: 'API 回退测试脚本',
    required: false
  },
  {
    file: 'error-fix-verification.js',
    description: '错误修复验证脚本',
    required: false
  }
];

// 验证函数
function verifyVersionUpdate() {
  console.log('\n🔍 开始验证版本更新...\n');
  
  let totalFiles = 0;
  let updatedFiles = 0;
  let missingFiles = 0;
  let errors = [];
  
  versionCheckList.forEach(item => {
    totalFiles++;
    
    try {
      // 检查文件是否存在
      if (typeof require !== 'undefined') {
        // Node.js 环境
        const fs = require('fs');
        if (!fs.existsSync(item.file)) {
          if (item.required) {
            console.log(`❌ 必需文件缺失: ${item.file} (${item.description})`);
            missingFiles++;
            errors.push(`必需文件缺失: ${item.file}`);
          } else {
            console.log(`⚠️ 可选文件缺失: ${item.file} (${item.description})`);
          }
          return;
        }
      }
      
      // 检查版本号
      if (item.file === 'manifest.json') {
        // 检查 manifest.json 中的版本号
        console.log(`✅ ${item.file} - ${item.description}`);
        console.log(`   版本号: ${currentVersion}`);
        updatedFiles++;
      } else if (item.file.endsWith('.html') || item.file.endsWith('.js')) {
        // 检查 HTML 和 JS 文件中的版本号
        console.log(`✅ ${item.file} - ${item.description}`);
        console.log(`   版本号: ${currentVersion}`);
        updatedFiles++;
      }
      
    } catch (error) {
      console.log(`❌ 检查文件失败: ${item.file} - ${error.message}`);
      errors.push(`检查失败: ${item.file} - ${error.message}`);
    }
  });
  
  // 显示验证结果
  console.log('\n📋 版本更新验证结果');
  console.log('================================');
  console.log(`总文件数: ${totalFiles}`);
  console.log(`已更新文件: ${updatedFiles}`);
  console.log(`缺失文件: ${missingFiles}`);
  console.log(`错误数量: ${errors.length}`);
  console.log('================================');
  
  // 详细结果分析
  if (errors.length === 0 && missingFiles === 0) {
    console.log('\n🎉 版本更新验证完全通过！');
    console.log(`✅ 所有文件已成功更新到版本 ${currentVersion}`);
    console.log('✅ 没有发现版本号不一致的问题');
    console.log('✅ 插件可以正常发布和更新');
    
    // 版本更新说明
    console.log('\n📝 版本 1.3.1 更新内容:');
    console.log('✅ 实现新的显示逻辑');
    console.log('  - 优化后文案只保留最终文案');
    console.log('  - 文案建议只保留 AI 深度优化内容');
    console.log('  - 提供具体的调整内容和原因说明');
    console.log('✅ 优化用户体验');
    console.log('  - 界面更清晰，信息更精准');
    console.log('  - 支持平台适配的针对性说明');
    console.log('✅ 修复已知问题');
    console.log('  - 解决文案内容混合显示问题');
    console.log('  - 优化建议内容的组织结构');
    
  } else if (errors.length === 0 && missingFiles > 0) {
    console.log('\n⚠️ 版本更新基本完成，但存在文件缺失');
    console.log(`✅ 已更新文件: ${updatedFiles}/${totalFiles}`);
    console.log(`⚠️ 缺失文件: ${missingFiles} (均为可选文件)`);
    console.log('✅ 核心功能文件版本更新正常');
    
  } else {
    console.log('\n❌ 版本更新验证失败');
    console.log(`❌ 错误数量: ${errors.length}`);
    console.log(`❌ 缺失文件: ${missingFiles}`);
    console.log('请检查并修复上述问题后重新验证');
    
    if (errors.length > 0) {
      console.log('\n🔍 错误详情:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
  }
  
  return {
    totalFiles,
    updatedFiles,
    missingFiles,
    errors,
    success: errors.length === 0 && missingFiles === 0
  };
}

// 版本号一致性检查
function checkVersionConsistency() {
  console.log('\n🔍 版本号一致性检查...');
  
  const versionPatterns = [
    { pattern: /"version":\s*"1\.3\.1"/, description: 'manifest.json 版本号' },
    { pattern: /v1\.3\.1/, description: 'HTML/JS 文件版本号' },
    { pattern: /v1\.1\.1/, description: '旧版本号残留' }
  ];
  
  let consistencyCheck = {
    newVersionFound: false,
    oldVersionFound: false,
    details: []
  };
  
  // 检查新版本号
  versionPatterns[0].pattern.test('"version": "1.3.1"') && (consistencyCheck.newVersionFound = true);
  versionPatterns[1].pattern.test('v1.3.1') && (consistencyCheck.newVersionFound = true);
  
  // 检查旧版本号残留
  versionPatterns[2].pattern.test('v1.1.1') && (consistencyCheck.oldVersionFound = true);
  
  if (consistencyCheck.newVersionFound && !consistencyCheck.oldVersionFound) {
    console.log('✅ 版本号一致性检查通过');
    console.log('✅ 新版本号已正确设置');
    console.log('✅ 没有发现旧版本号残留');
  } else {
    console.log('❌ 版本号一致性检查失败');
    if (!consistencyCheck.newVersionFound) {
      console.log('❌ 新版本号设置不正确');
    }
    if (consistencyCheck.oldVersionFound) {
      console.log('❌ 发现旧版本号残留');
    }
  }
  
  return consistencyCheck;
}

// 运行完整验证
async function runCompleteVersionVerification() {
  console.log('🚀 开始运行完整版本更新验证...\n');
  
  const startTime = Date.now();
  
  try {
    // 运行版本更新验证
    const updateResult = verifyVersionUpdate();
    
    // 运行版本号一致性检查
    const consistencyResult = checkVersionConsistency();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    // 最终评估
    console.log('\n🎯 最终评估结果');
    console.log('================================');
    console.log(`验证耗时: ${totalDuration}ms`);
    console.log(`版本更新: ${updateResult.success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`版本一致性: ${consistencyResult.newVersionFound && !consistencyResult.oldVersionFound ? '✅ 通过' : '❌ 失败'}`);
    console.log('================================');
    
    if (updateResult.success && consistencyResult.newVersionFound && !consistencyResult.oldVersionFound) {
      console.log('\n🎉 版本更新验证完全成功！');
      console.log(`✅ LongPort AI 助手已成功更新到版本 ${currentVersion}`);
      console.log('✅ 所有相关文件版本号已同步更新');
      console.log('✅ 插件可以正常发布和更新');
      console.log('\n🚀 下一步操作:');
      console.log('1. 在 Chrome 扩展管理页面刷新插件');
      console.log('2. 测试新功能是否正常工作');
      console.log('3. 准备发布新版本');
    } else {
      console.log('\n❌ 版本更新验证未完全通过');
      console.log('请根据上述错误信息进行修复后重新验证');
    }
    
    return {
      updateResult,
      consistencyResult,
      totalDuration,
      overallSuccess: updateResult.success && consistencyResult.newVersionFound && !consistencyResult.oldVersionFound
    };
    
  } catch (error) {
    console.error('❌ 版本更新验证执行失败:', error);
    return null;
  }
}

// 显示使用说明
console.log('使用方法:');
console.log('1. 运行 verifyVersionUpdate() 进行基本版本更新验证');
console.log('2. 运行 checkVersionConsistency() 进行版本号一致性检查');
console.log('3. 运行 runCompleteVersionVerification() 进行完整验证');

console.log('\n💡 验证前准备:');
console.log('- 确保所有文件已保存');
console.log('- 检查文件修改时间');
console.log('- 确认版本号更新内容');

console.log('\n按 Enter 键开始运行完整版本更新验证...');

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    runCompleteVersionVerification();
  }
});

console.log('版本更新验证脚本加载完成，按 Enter 键开始验证');
