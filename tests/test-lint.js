// tests/test-lint.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 模拟导入模块
const { lintAgainstGuide } = require('../src/lib/lint');

// 加载测试用例
const testCases = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden/cases.json'), 'utf8')).cases;

// 加载样式指南
function loadGuide(scene) {
  const guideContent = fs.readFileSync(path.join(__dirname, '../style-guide/company-copy.v1.yaml'), 'utf8');
  const guide = yaml.load(guideContent);
  return guide.scenes[scene] || guide.scenes.console;
}

// 运行测试
async function runTests() {
  console.log('开始运行文案边界测试...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`测试用例: ${testCase.id} - ${testCase.description}`);
    console.log(`输入文本: "${testCase.input}"`);
    console.log(`场景: ${testCase.scene}, 模式: ${testCase.mode}, 严格: ${testCase.strict}`);
    
    try {
      // 加载对应场景的指南
      const guide = loadGuide(testCase.scene);
      
      // 运行lint检查
      const hits = lintAgainstGuide(testCase.input, guide);
      
      // 验证结果
      const expectedHitTypes = testCase.expected_hits.map(h => h.rule);
      const actualHitTypes = hits.map(h => h.rule);
      
      // 检查是否命中了所有预期的规则
      const allExpectedHitsFound = expectedHitTypes.every(expected => 
        actualHitTypes.includes(expected)
      );
      
      // 检查是否有严重程度匹配的问题
      const severityMatches = testCase.expected_hits.every(expected => {
        const matching = hits.find(h => h.rule === expected.rule);
        return matching && matching.severity === expected.severity;
      });
      
      if (allExpectedHitsFound && severityMatches) {
        console.log('✅ 测试通过');
        console.log(`检测到的问题: ${hits.map(h => `${h.rule}(${h.severity})`).join(', ')}`);
        passed++;
      } else {
        console.log('❌ 测试失败');
        console.log('预期问题:', testCase.expected_hits.map(h => `${h.rule}(${h.severity})`).join(', '));
        console.log('实际问题:', hits.map(h => `${h.rule}(${h.severity})`).join(', '));
        failed++;
      }
    } catch (error) {
      console.log('❌ 测试出错:', error.message);
      failed++;
    }
    
    console.log('-'.repeat(50));
  }
  
  // 打印测试结果摘要
  console.log(`\n测试完成: ${passed} 通过, ${failed} 失败, 共 ${testCases.length} 个测试用例`);
  
  return {
    total: testCases.length,
    passed,
    failed
  };
}

// 运行API测试
async function testApi() {
  console.log('\n开始测试API接口...\n');
  
  try {
    // 模拟API请求处理函数
    const { optimizeHandler } = require('../src/routes/optimize');
    
    // 创建模拟请求和响应对象
    const req = {
      body: {
        text: "系统正在处理您的请求,这可能需要几秒钟时间.",
        mode: "proofread",
        scene: "console",
        strict: true
      }
    };
    
    const res = {
      json: (data) => {
        console.log('✅ API接口正常返回');
        console.log('返回数据:', JSON.stringify(data, null, 2));
        return data;
      }
    };
    
    // 调用API处理函数
    console.log('调用API处理函数...');
    await optimizeHandler(req, res);
    
    return true;
  } catch (error) {
    console.log('❌ API测试失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  try {
    // 运行lint测试
    const lintResults = await runTests();
    
    // 运行API测试
    const apiSuccess = await testApi();
    
    // 总结
    console.log('\n=== 测试总结 ===');
    console.log(`Lint测试: ${lintResults.passed}/${lintResults.total} 通过`);
    console.log(`API测试: ${apiSuccess ? '通过' : '失败'}`);
    
    // 如果有失败的测试，退出码为1
    if (lintResults.failed > 0 || !apiSuccess) {
      process.exit(1);
    }
  } catch (error) {
    console.error('测试执行出错:', error);
    process.exit(1);
  }
}

// 执行测试
main();
