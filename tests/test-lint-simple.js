// tests/test-lint-simple.js
// 简化版lint测试，直接使用mock模块

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { lintAgainstGuide } = require('./mock/lint');

// 创建一个简单的测试场景
const testScene = {
  glossary: { 
    "account": "账户", 
    "logout": "登出"
  },
  banned_terms: [
    "100%", 
    "保证", 
    "绝对"
  ],
  tone: [
    "清晰",
    "专业",
    "友好"
  ]
};

// 测试用例
const testCases = [
  {
    description: "标点符号测试",
    input: "系统正在处理您的请求,这可能需要几秒钟时间.",
    expectedRules: ["CN-PUNC"]
  },
  {
    description: "术语统一测试",
    input: "请确保您的 account 有足够的余额进行此操作。",
    expectedRules: ["GLOSSARY"]
  },
  {
    description: "禁用词测试",
    input: "我们保证这项功能100%可靠，绝对不会出现任何问题。",
    expectedRules: ["BANNED_TERM"]
  },
  {
    description: "数字单位空格测试",
    input: "当前存储空间已使用50GB，剩余容量为20%。",
    expectedRules: ["NUM-UNIT-SPACE"]
  },
  {
    description: "多种问题混合测试",
    input: "系统将在10s后自动logout您的account,请保存您的工作并确保100%完成.",
    expectedRules: ["NUM-UNIT-SPACE", "GLOSSARY", "CN-PUNC", "BANNED_TERM"]
  }
];

// 运行测试
console.log('开始运行简化版文案边界测试...\n');

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`测试: ${testCase.description}`);
  console.log(`输入: "${testCase.input}"`);
  
  try {
    // 运行lint检查
    const hits = lintAgainstGuide(testCase.input, testScene);
    const hitRules = hits.map(h => h.rule);
    
    console.log('检测到的问题:', hitRules);
    
    // 检查是否命中了所有预期的规则
    const allExpectedHitsFound = testCase.expectedRules.every(rule => 
      hitRules.includes(rule)
    );
    
    if (allExpectedHitsFound) {
      console.log('✅ 通过');
      passed++;
    } else {
      console.log('❌ 失败');
      console.log('预期问题:', testCase.expectedRules);
      console.log('实际问题:', hitRules);
      failed++;
    }
  } catch (error) {
    console.log('❌ 错误:', error.message);
    failed++;
  }
  
  console.log('-'.repeat(50));
}

// 打印测试结果摘要
console.log(`\n测试完成: ${passed} 通过, ${failed} 失败, 共 ${testCases.length} 个测试用例`);

// 尝试加载实际的YAML文件进行测试
try {
  console.log('\n尝试加载实际的YAML文件...');
  const yamlPath = path.join(__dirname, '../style-guide/company-copy.v1.yaml');
  
  if (fs.existsSync(yamlPath)) {
    const guideContent = fs.readFileSync(yamlPath, 'utf8');
    const guide = yaml.load(guideContent);
    
    if (guide && guide.scenes && guide.scenes.console) {
      console.log('✅ YAML文件加载成功');
      console.log('可用场景:', Object.keys(guide.scenes));
      
      // 使用实际的场景进行测试
      const consoleScene = guide.scenes.console;
      const testText = "系统将在10s后自动logout您的account,请保存您的工作并确保100%完成.";
      
      console.log('\n使用实际场景测试:', testText);
      const hits = lintAgainstGuide(testText, consoleScene);
      console.log('检测到的问题:', hits.map(h => `${h.rule}(${h.severity}): ${h.note}`));
    } else {
      console.log('❌ YAML文件格式不正确或缺少console场景');
    }
  } else {
    console.log('❌ YAML文件不存在:', yamlPath);
  }
} catch (error) {
  console.log('❌ YAML文件加载失败:', error.message);
}
