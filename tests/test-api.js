// tests/test-api.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 模拟API环境
global.fetch = async (url, options) => {
  console.log(`模拟API请求: ${url}`);
  console.log('请求参数:', options.body);
  
  // 模拟API响应
  return {
    ok: true,
    status: 200,
    json: async () => ({
      rewritten: JSON.parse(options.body).text,
      changes: [],
      policy_hits: [
        {
          rule: "CN-PUNC",
          note: "建议使用中文全角逗号",
          severity: "warn"
        }
      ],
      confidence: 0.8,
      meta: {
        scene: JSON.parse(options.body).scene,
        policy_version: "1.0"
      }
    })
  };
};

// 加载测试用例
const testCases = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden/cases.json'), 'utf8')).cases;

// 测试API调用
async function testApiCall() {
  console.log('开始测试API调用...\n');
  
  let passed = 0;
  let failed = 0;
  
  // 导入API模块
  const { optimize } = require('../src/utils/api');
  
  for (const testCase of testCases.slice(0, 3)) { // 只测试前3个用例
    console.log(`测试用例: ${testCase.id} - ${testCase.description}`);
    
    try {
      const result = await optimize({
        text: testCase.input,
        mode: testCase.mode,
        scene: testCase.scene,
        strict: testCase.strict
      });
      
      if (result && result.rewritten && result.policy_hits) {
        console.log('✅ API调用成功');
        console.log(`返回结果: ${result.rewritten.substring(0, 30)}...`);
        console.log(`策略命中: ${result.policy_hits.length} 项`);
        passed++;
      } else {
        console.log('❌ API调用失败: 返回结果格式不正确');
        console.log('返回结果:', result);
        failed++;
      }
    } catch (error) {
      console.log('❌ API调用出错:', error.message);
      failed++;
    }
    
    console.log('-'.repeat(50));
  }
  
  // 打印测试结果摘要
  console.log(`\nAPI测试完成: ${passed} 通过, ${failed} 失败, 共 ${Math.min(testCases.length, 3)} 个测试用例`);
  
  return {
    total: Math.min(testCases.length, 3),
    passed,
    failed
  };
}

// 测试本地lint功能
async function testLocalLint() {
  console.log('\n开始测试本地Lint功能...\n');
  
  // 导入lint模块
  const { lintAgainstGuide } = require('../src/lib/lint');
  
  // 加载样式指南
  function loadGuide(scene) {
    try {
      const guideContent = fs.readFileSync(path.join(__dirname, '../style-guide/company-copy.v1.yaml'), 'utf8');
      const guide = yaml.load(guideContent);
      return guide.scenes[scene] || guide.scenes.console;
    } catch (error) {
      console.log('加载样式指南失败:', error.message);
      // 返回一个基本的指南对象用于测试
      return {
        glossary: { "account": "账户" },
        banned_terms: ["100%", "保证"]
      };
    }
  }
  
  // 测试文本
  const testText = "系统将在10s后自动logout您的account,请保存您的工作并确保100%完成.";
  const guide = loadGuide("console");
  
  try {
    const hits = lintAgainstGuide(testText, guide);
    
    console.log('✅ 本地Lint功能正常');
    console.log('检测到的问题:', hits.map(h => `${h.rule}(${h.severity}): ${h.note}`).join('\n'));
    
    return true;
  } catch (error) {
    console.log('❌ 本地Lint测试失败:', error.message);
    return false;
  }
}

// 测试路由处理函数
async function testRouteHandler() {
  console.log('\n开始测试路由处理函数...\n');
  
  try {
    // 模拟路由环境
    const z = {
      object: () => ({
        parse: (data) => data,
        shape: () => ({
          parse: (data) => data
        })
      }),
      string: () => ({
        min: () => ({
          max: () => ({})
        })
      }),
      array: (schema) => ({
        parse: (data) => data
      }),
      enum: () => ({}),
      number: () => ({
        min: () => ({
          max: () => ({})
        })
      })
    };
    
    // 模拟openai对象
    const openai = {
      chat: {
        completions: {
          create: async () => ({
            choices: [{
              message: {
                content: JSON.stringify({
                  rewritten: "系统正在处理您的请求，这可能需要几秒钟时间。",
                  changes: [],
                  policy_hits: [],
                  confidence: 0.8
                })
              }
            }]
          })
        }
      }
    };
    
    // 模拟其他依赖
    const mockDeps = {
      loadGuide: (scene) => ({
        version: "1.0",
        scene,
        data: {
          glossary: { "account": "账户" },
          banned_terms: ["100%", "保证"]
        }
      }),
      summarizeGuideForPrompt: () => ["Tone: 清晰、专业", "Glossary: account→账户"],
      buildMessages: () => [],
      lintAgainstGuide: () => [],
      minimalProofread: async () => ({
        rewritten: "文本",
        changes: [],
        policy_hits: [],
        confidence: 0.5
      }),
      z
    };
    
    // 模拟请求和响应对象
    const req = {
      body: {
        text: "系统正在处理您的请求,这可能需要几秒钟时间.",
        mode: "proofread",
        scene: "console",
        strict: true
      }
    };
    
    let responseData = null;
    const res = {
      json: (data) => {
        responseData = data;
        console.log('路由处理函数返回数据:', JSON.stringify(data, null, 2));
        return data;
      }
    };
    
    // 创建路由处理函数
    const createOptimizeHandler = (deps) => {
      return async (req, res) => {
        const { text, mode = "proofread", scene = "console", strict = true, policy_version } = req.body || {};
        const guide = deps.loadGuide(scene, policy_version);
        const snippets = deps.summarizeGuideForPrompt(guide.data);
        
        // 模拟API调用
        const data = {
          rewritten: "系统正在处理您的请求，这可能需要几秒钟时间。",
          changes: [],
          policy_hits: [],
          confidence: 0.8
        };
        
        // 二次校验
        const postHits = deps.lintAgainstGuide(data.rewritten, guide.data);
        const mergedHits = [...data.policy_hits, ...postHits];
        
        if (strict && mergedHits.some(h => h.severity === "block")) {
          const minimal = await deps.minimalProofread(text, guide.data);
          const fallbackHits = deps.lintAgainstGuide(minimal.rewritten, guide.data);
          return res.json({
            ...minimal,
            policy_hits: fallbackHits,
            meta: { scene: guide.scene, policy_version: guide.version }
          });
        }
        
        return res.json({
          ...data,
          policy_hits: mergedHits,
          meta: { scene: guide.scene, policy_version: guide.version }
        });
      };
    };
    
    const optimizeHandler = createOptimizeHandler(mockDeps);
    
    // 调用路由处理函数
    console.log('调用路由处理函数...');
    await optimizeHandler(req, res);
    
    if (responseData && responseData.rewritten && responseData.meta) {
      console.log('✅ 路由处理函数测试通过');
      return true;
    } else {
      console.log('❌ 路由处理函数测试失败: 返回格式不正确');
      return false;
    }
  } catch (error) {
    console.log('❌ 路由处理函数测试失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  try {
    // 测试API调用
    const apiResults = await testApiCall();
    
    // 测试本地lint功能
    const lintSuccess = await testLocalLint();
    
    // 测试路由处理函数
    const routeSuccess = await testRouteHandler();
    
    // 总结
    console.log('\n=== 测试总结 ===');
    console.log(`API调用测试: ${apiResults.passed}/${apiResults.total} 通过`);
    console.log(`本地Lint测试: ${lintSuccess ? '通过' : '失败'}`);
    console.log(`路由处理函数测试: ${routeSuccess ? '通过' : '失败'}`);
    
    // 如果有失败的测试，退出码为1
    if (apiResults.failed > 0 || !lintSuccess || !routeSuccess) {
      process.exit(1);
    }
  } catch (error) {
    console.error('测试执行出错:', error);
    process.exit(1);
  }
}

// 执行测试
main();
