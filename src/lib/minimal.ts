// src/lib/minimal.ts
import type { SceneGuide } from "./guide";
import { openai } from "./openai";

export async function minimalProofread(text: string, guide: SceneGuide) {
  // 这里可以直接复用你当前的"语法校对"模型提示
  // 先给一个占位返回，确保流程能跑通
  
  try {
    // 如果需要实际调用模型，可以使用下面的代码
    // const response = await callMinimalProofreadModel(text, guide);
    // return response;
    
    // 简单的占位实现
    return {
      rewritten: text,
      changes: [],
      policy_hits: [],
      confidence: 0.5
    };
  } catch (error) {
    console.error("最小改动处理失败:", error);
    // 出错时返回原文
    return {
      rewritten: text,
      changes: [],
      policy_hits: [],
      confidence: 0.0
    };
  }
}

// 实际的模型调用函数，可以在需要时启用
async function callMinimalProofreadModel(text: string, guide: SceneGuide) {
  const messages = [
    {
      role: "system",
      content: `你是一个专业的中文校对助手，只进行最小必要的修改：
1. 只修正明显的语法错误、标点符号和格式问题
2. 不改变原文的语气、风格和表达方式
3. 不添加或删除实质性内容
4. 确保数字与单位之间有空格（如 10 GB、50 %）
5. 使用中文全角标点符号
6. 术语统一使用指定的标准表达`
    },
    {
      role: "user",
      content: `请对以下文本进行最小必要的校对，只修正明显错误：\n\n${text}`
    }
  ];

  const resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.1,
    max_tokens: text.length * 2
  });

  const rewritten = resp.choices[0].message.content || text;

  return {
    rewritten,
    changes: [],
    policy_hits: [],
    confidence: 0.5
  };
}
