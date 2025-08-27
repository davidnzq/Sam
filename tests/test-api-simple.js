// tests/test-api-simple.js
// 简化版API测试，直接使用mock模块

const { optimize } = require('./mock/api');
const { optimizeHandler } = require('./mock/optimize');

// 测试API调用
async function testApiCall() {
  console.log('测试API调用功能...\n');
  
  const testCases = [
    {
      description: "基本校对测试",
      text: "系统正在处理您的请求,这可能需要几秒钟时间.",
      mode: "proofread",
      scene: "console",
      strict: true
    },
    {
      description: "优化模式测试",
      text: "我们的产品使用了最先进的AI技术,能够帮助您提高工作效率,节省时间和成本.",
      mode: "optimize",
      scene: "marketing",
      strict: false
    },
    {
      description: "严格模式测试",
      text: "系统将在10s后自动logout您的account,请保存您的工作并确保100%完成.",
      mode: "optimize",
      scene: "console",
      strict: true
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`测试: ${testCase.description}`);
    
    try {
      const result = await optimize({
        text: testCase.text,
        mode: testCase.mode,
        scene: testCase.scene,
        strict: testCase.strict
      });
      
      console.log('✅ API调用成功');
      console.log('输入:', testCase.text);
      console.log('输出:', result.rewritten);
      console.log('策略命中:', result.policy_hits.map(h => `${h.rule}(${h.severity})`).join(', '));
    } catch (error) {
      console.log('❌ API调用失败:', error.message);
    }
    
    console.log('-'.repeat(50));
  }
}

// 测试路由处理函数
async function testRouteHandler() {
  console.log('\n测试路由处理函数...\n');
  
  const testCases = [
    {
      description: "基本校对测试",
      body: {
        text: "系统正在处理您的请求,这可能需要几秒钟时间.",
        mode: "proofread",
        scene: "console",
        strict: true
      }
    },
    {
      description: "优化模式测试",
      body: {
        text: "我们的产品使用了最先进的AI技术,能够帮助您提高工作效率,节省时间和成本.",
        mode: "optimize",
        scene: "marketing",
        strict: false
      }
    },
    {
      description: "严格模式测试 (包含禁用词)",
      body: {
        text: "系统将在10s后自动logout您的account,请保存您的工作并确保100%完成.",
        mode: "optimize",
        scene: "console",
        strict: true
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`测试: ${testCase.description}`);
    
    try {
      let responseData = null;
      
      // 创建模拟请求和响应对象
      const req = { body: testCase.body };
      const res = {
        json: (data) => {
          responseData = data;
          return data;
        }
      };
      
      // 调用路由处理函数
      await optimizeHandler(req, res);
      
      if (responseData) {
        console.log('✅ 路由处理成功');
        console.log('输入:', testCase.body.text);
        console.log('输出:', responseData.rewritten);
        console.log('策略命中:', responseData.policy_hits.map(h => `${h.rule}(${h.severity})`).join(', ') || '无');
        console.log('元数据:', responseData.meta);
      } else {
        console.log('❌ 路由处理失败: 无响应数据');
      }
    } catch (error) {
      console.log('❌ 路由处理失败:', error.message);
    }
    
    console.log('-'.repeat(50));
  }
}

// 主函数
async function main() {
  try {
    // 测试API调用
    await testApiCall();
    
    // 测试路由处理函数
    await testRouteHandler();
    
    console.log('\n所有测试已完成');
  } catch (error) {
    console.error('测试执行失败:', error);
  }
}

// 执行测试
main();
