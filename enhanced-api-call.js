// 生成增强的提示词
function generateEnhancedPrompt(text, siteType) {
  // 基础提示词
  let enhancedPrompt = `请对以下文本进行显著优化，确保优化后的内容与原文有明显区别。
要求:
1. 保持原文的核心含义
2. 改进语法和表达方式
3. 增强专业性和清晰度
4. 优化后的文本必须与原文有至少30%的差异

原文:
${text}

请注意: 返回的优化文本必须与原文明显不同，否则将被视为无效。`;

  // 根据网站类型添加特定要求
  if (siteType === 'longport') {
    enhancedPrompt += `\n\n额外要求:
- 使用专业的金融术语
- 增强内容的权威性和可信度
- 添加适当的风险提示
- 确保表达更加专业和准确`;
  } else if (siteType === 'notion') {
    enhancedPrompt += `\n\n额外要求:
- 优化文档结构和层次
- 增强逻辑连贯性
- 改进标题和段落组织
- 提升整体可读性`;
  }

  return enhancedPrompt;
}

// 使用增强参数调用公司API
async function callCompanyAPIWithEnhancedParams(text, apiKey, apiUrl, siteType, enhancedPrompt) {
  console.log('🚀 使用增强参数调用公司API...');
  
  // 可用模型列表（按优先级排序）
  const availableModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-5-chat', 'DeepSeek-R1', 'o3', 'o3-mini'];
  let modelIndex = 0;
  
  try {
    // 构建系统提示词 - 更强调差异性
    let systemPrompt = '你是一个专业的文案优化专家。你的任务是显著改进用户提供的文本，确保优化后的内容与原文有明显区别。';
    
    if (siteType === 'longport') {
      systemPrompt += '这是金融投资相关的内容，请使用专业的金融术语，确保内容权威可信。';
    } else if (siteType === 'notion') {
      systemPrompt += '这是文档协作平台的内容，请优化文档结构和逻辑，提升可读性。';
    }
    
    systemPrompt += '要求：1.保持原文核心含义不变 2.修正语法错误 3.优化表达方式 4.确保与原文有明显差异';
    
    // 构建请求体 - 使用OpenAI标准格式，增加temperature
    const selectedModel = availableModels[modelIndex];
    
    console.log(`📋 使用模型: ${selectedModel}，增强参数`);
    
    const openAIRequestBody = {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature: 0.9, // 增加随机性
      max_tokens: 2000,
      presence_penalty: 0.6, // 增加新内容的倾向
      frequency_penalty: 0.6 // 减少重复
    };
    
    // 修复：使用正确的API端点（基于测试结果）
    const correctEndpoints = [
      apiUrl + 'v1/chat/completions',    // OpenAI兼容端点（已确认存在）
      apiUrl + 'v1/completions',         // OpenAI Completions端点
      apiUrl + 'api/v1/chat/completions', // 可能的变体
      apiUrl + 'api/chat/completions',   // 其他可能格式
    ];
    
    let lastError = null;
    
    for (const endpoint of correctEndpoints) {
      try {
        console.log(`🔗 尝试端点: ${endpoint} (增强参数)`);
        
        // 使用增强的请求体
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'User-Agent': 'LongPort-AI-Assistant/1.3.2-enhanced',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(openAIRequestBody),
          signal: AbortSignal.timeout(45000) // 45秒超时
        });
        
        console.log(`📥 端点 ${endpoint} 响应状态:`, response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => '无法读取错误详情');
          console.log(`❌ 端点 ${endpoint} 返回错误状态:`, errorText);
          
          if (response.status === 429) {
            // 处理速率限制错误，尝试下一个模型
            modelIndex++;
            if (modelIndex < availableModels.length) {
              console.log(`🔄 切换到下一个模型: ${availableModels[modelIndex]}`);
              lastError = new Error(`模型 ${selectedModel} 达到速率限制`);
              continue;
            } else {
              throw new Error('所有模型都达到速率限制，请稍后重试');
            }
          } else if (response.status === 404) {
            console.log(`⚠️ 端点 ${endpoint} 不存在，尝试下一个...`);
            continue;
          } else {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
          }
        }
        
        // 处理响应
        const contentType = response.headers.get('content-type');
        console.log(`📄 端点 ${endpoint} 响应内容类型:`, contentType);
        
        if (contentType && contentType.includes('application/json')) {
          // JSON 响应
          const result = await response.json();
          console.log(`📊 端点 ${endpoint} 返回 JSON:`, result);
          
          // 提取优化文本
          let optimizedText = null;
          
          // 检查OpenAI格式的响应
          if (result.choices && Array.isArray(result.choices) && result.choices.length > 0) {
            const choice = result.choices[0];
            if (choice.message && choice.message.content) {
              optimizedText = choice.message.content;
              console.log('✅ 找到OpenAI Chat格式响应');
              console.log('响应内容预览:', optimizedText.substring(0, 100));
            } else if (choice.text) {
              optimizedText = choice.text;
              console.log('✅ 找到OpenAI Completions格式响应');
              console.log('响应内容预览:', optimizedText.substring(0, 100));
            }
          }
          
          // 如果不是OpenAI格式，检查其他可能的字段
          if (!optimizedText) {
            const possibleFields = ['optimized_text', 'text', 'content', 'response', 'result', 'message', 'data'];
            for (const field of possibleFields) {
              if (result[field] && typeof result[field] === 'string' && result[field].trim().length > 0) {
                optimizedText = result[field];
                console.log(`✅ 找到有效字段: ${field}`);
                break;
              }
            }
          }
          
          if (optimizedText) {
            console.log('✅ 找到有效的优化文本:', optimizedText.substring(0, 100) + '...');
            
            // 验证优化结果
            const validationResult = validateOptimizationResult(optimizedText, text, siteType);
            if (validationResult.isValid) {
              console.log('✅ 优化结果验证通过');
              const cleanText = cleanAPIResponse(optimizedText);
              return cleanText;
            } else {
              console.log('⚠️ 优化结果验证失败:', validationResult.errors);
              // 即使验证失败也返回结果，因为这是增强参数的调用
              const cleanText = cleanAPIResponse(optimizedText);
              return cleanText;
            }
          }
        } else {
          // 非 JSON 响应
          const responseText = await response.text();
          console.log(`📝 端点 ${endpoint} 返回文本:`, responseText.substring(0, 200));
          
          // 检查文本是否有意义
          if (responseText && responseText.length > 20) {
            console.log('✅ 从文本响应中提取到内容');
            
            // 验证优化结果
            const validationResult = validateOptimizationResult(responseText, text, siteType);
            if (validationResult.isValid) {
              console.log('✅ 优化结果验证通过');
              const cleanText = cleanAPIResponse(responseText);
              return cleanText;
            } else {
              console.log('⚠️ 优化结果验证失败，但仍可使用:', validationResult.errors);
              const cleanText = cleanAPIResponse(responseText);
              return cleanText;
            }
          }
        }
        
        // 如果到达这里，表示当前端点未返回有效结果，尝试下一个
        console.log(`⚠️ 端点 ${endpoint} 未返回有效结果，尝试下一个...`);
        
      } catch (error) {
        console.error(`❌ 端点 ${endpoint} 调用失败:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // 所有端点都尝试失败
    throw lastError || new Error('所有API端点调用失败');
    
  } catch (error) {
    console.error('❌ 增强参数API调用失败:', error.message);
    throw error;
  }
}
