// tests/mock/optimize.js
// optimize路由处理函数的CommonJS版本，用于测试

const { lintAgainstGuide } = require('./lint');

/**
 * 模拟最小改动函数
 * @param {string} text 原始文本
 * @param {object} guide 样式指南
 * @returns {object} 处理结果
 */
async function minimalProofread(text, guide) {
  // 简单的占位实现
  return {
    rewritten: text,
    changes: [],
    policy_hits: [],
    confidence: 0.5
  };
}

/**
 * 模拟优化处理函数
 * @param {object} req 请求对象
 * @param {object} res 响应对象
 */
async function optimizeHandler(req, res) {
  const { text, mode = "proofread", scene = "console", strict = true, policy_version } = req.body || {};
  
  // 模拟guide加载
  const guide = {
    version: "1.0",
    scene,
    data: {
      glossary: { "account": "账户", "logout": "登出" },
      banned_terms: ["100%", "保证", "绝对"],
      tone: ["清晰", "专业", "友好"]
    }
  };
  
  // 模拟API响应
  const data = {
    rewritten: text.replace(/,/g, "，").replace(/\./g, "。"),
    changes: [
      {
        type: "grammar",
        before: ",",
        after: "，",
        reason: "使用中文全角标点"
      }
    ],
    policy_hits: [],
    confidence: 0.8
  };

  // 二次校验
  const postHits = lintAgainstGuide(data.rewritten, guide.data);
  const mergedHits = [...data.policy_hits, ...postHits];

  // 严格模式下，如果有阻断级别的命中，回退到最小改动
  if (strict && mergedHits.some(h => h.severity === "block")) {
    const minimal = await minimalProofread(text, guide.data);
    const fallbackHits = lintAgainstGuide(minimal.rewritten, guide.data);
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
}

module.exports = { optimizeHandler, minimalProofread };
