// src/options.ts
import { getApiConfig, saveApiConfig, getOptimizeSettings, saveOptimizeSettings } from "./utils/config";

// 文档加载完成后初始化
document.addEventListener("DOMContentLoaded", async () => {
  await initApiConfig();
  await initOptimizeSettings();
  setupEventListeners();
});

// 初始化API配置
async function initApiConfig() {
  const config = await getApiConfig();
  
  const companyApiUrlInput = document.getElementById("companyApiUrl") as HTMLInputElement;
  const companyApiKeyInput = document.getElementById("companyApiKey") as HTMLInputElement;
  const currentCompanyApiSpan = document.getElementById("currentCompanyApi");
  const apiStatusSpan = document.getElementById("apiStatus");
  
  if (companyApiUrlInput) {
    companyApiUrlInput.value = config.baseUrl || "";
  }
  
  if (currentCompanyApiSpan) {
    currentCompanyApiSpan.textContent = config.baseUrl || "未配置";
  }
  
  if (apiStatusSpan) {
    apiStatusSpan.textContent = "已配置";
    apiStatusSpan.className = "status-ok";
  }
}

// 初始化文案优化设置
async function initOptimizeSettings() {
  const settings = await getOptimizeSettings();
  
  const defaultSceneSelect = document.getElementById("defaultScene") as HTMLSelectElement;
  const defaultModeSelect = document.getElementById("defaultMode") as HTMLSelectElement;
  const strictBoundaryCheckbox = document.getElementById("strictBoundary") as HTMLInputElement;
  
  if (defaultSceneSelect) {
    defaultSceneSelect.value = settings.defaultScene || "console";
  }
  
  if (defaultModeSelect) {
    defaultModeSelect.value = settings.defaultMode || "optimize";
  }
  
  if (strictBoundaryCheckbox) {
    strictBoundaryCheckbox.checked = settings.strictBoundary !== false;
  }
}

// 设置事件监听器
function setupEventListeners() {
  // API设置相关
  const saveCompanyApiButton = document.getElementById("saveCompanyApi");
  const testCompanyApiButton = document.getElementById("testCompanyApi");
  const resetToDefaultButton = document.getElementById("resetToDefault");
  
  if (saveCompanyApiButton) {
    saveCompanyApiButton.addEventListener("click", saveApiSettings);
  }
  
  if (testCompanyApiButton) {
    testCompanyApiButton.addEventListener("click", testApiConnection);
  }
  
  if (resetToDefaultButton) {
    resetToDefaultButton.addEventListener("click", resetApiToDefault);
  }
  
  // 文案优化设置相关
  const saveOptimizeSettingsButton = document.getElementById("saveOptimizeSettings");
  const resetOptimizeSettingsButton = document.getElementById("resetOptimizeSettings");
  
  if (saveOptimizeSettingsButton) {
    saveOptimizeSettingsButton.addEventListener("click", saveOptimizeSettingsHandler);
  }
  
  if (resetOptimizeSettingsButton) {
    resetOptimizeSettingsButton.addEventListener("click", resetOptimizeSettingsHandler);
  }
  
  // 测试相关
  const startTestButton = document.getElementById("startTest");
  const clearTestButton = document.getElementById("clearTest");
  const loadSampleTextButton = document.getElementById("loadSampleText");
  
  if (startTestButton) {
    startTestButton.addEventListener("click", startOptimizeTest);
  }
  
  if (clearTestButton) {
    clearTestButton.addEventListener("click", clearTestContent);
  }
  
  if (loadSampleTextButton) {
    loadSampleTextButton.addEventListener("click", loadSampleText);
  }
}

// 保存API设置
async function saveApiSettings() {
  const companyApiUrlInput = document.getElementById("companyApiUrl") as HTMLInputElement;
  const companyApiKeyInput = document.getElementById("companyApiKey") as HTMLInputElement;
  const companyApiStatus = document.getElementById("companyApiStatus");
  
  try {
    const baseUrl = companyApiUrlInput.value.trim();
    const apiKey = companyApiKeyInput.value.trim() || undefined;
    
    await saveApiConfig({
      baseUrl: baseUrl || "https://lboneapi.longbridge-inc.com/",
      apiKey: apiKey || "",
      provider: "default"
    });
    
    if (companyApiStatus) {
      companyApiStatus.textContent = "设置已保存";
      companyApiStatus.className = "status success";
      
      setTimeout(() => {
        companyApiStatus.textContent = "";
        companyApiStatus.className = "status";
      }, 3000);
    }
    
    await initApiConfig();
  } catch (error) {
    console.error("保存API设置失败:", error);
    
    if (companyApiStatus) {
      companyApiStatus.textContent = "保存失败: " + (error as Error).message;
      companyApiStatus.className = "status error";
    }
  }
}

// 测试API连接
async function testApiConnection() {
  const companyApiUrlInput = document.getElementById("companyApiUrl") as HTMLInputElement;
  const companyApiKeyInput = document.getElementById("companyApiKey") as HTMLInputElement;
  const companyApiStatus = document.getElementById("companyApiStatus");
  
  if (companyApiStatus) {
    companyApiStatus.textContent = "正在测试连接...";
    companyApiStatus.className = "status pending";
  }
  
  try {
    const baseUrl = companyApiUrlInput.value.trim();
    const apiKey = companyApiKeyInput.value.trim() || undefined;
    
    const response = await fetch(`${baseUrl}/v1/ping`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey || ""}`,
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      if (companyApiStatus) {
        companyApiStatus.textContent = "连接成功";
        companyApiStatus.className = "status success";
      }
    } else {
      if (companyApiStatus) {
        companyApiStatus.textContent = `连接失败: HTTP ${response.status}`;
        companyApiStatus.className = "status error";
      }
    }
  } catch (error) {
    console.error("测试API连接失败:", error);
    
    if (companyApiStatus) {
      companyApiStatus.textContent = "连接失败: " + (error as Error).message;
      companyApiStatus.className = "status error";
    }
  }
}

// 重置API设置为默认值
async function resetApiToDefault() {
  const companyApiUrlInput = document.getElementById("companyApiUrl") as HTMLInputElement;
  const companyApiKeyInput = document.getElementById("companyApiKey") as HTMLInputElement;
  const companyApiStatus = document.getElementById("companyApiStatus");
  
  companyApiUrlInput.value = "https://lboneapi.longbridge-inc.com/";
  companyApiKeyInput.value = "";
  
  try {
    await saveApiConfig({
      baseUrl: "https://lboneapi.longbridge-inc.com/",
      apiKey: "",
      provider: "default"
    });
    
    if (companyApiStatus) {
      companyApiStatus.textContent = "已重置为默认设置";
      companyApiStatus.className = "status success";
      
      setTimeout(() => {
        companyApiStatus.textContent = "";
        companyApiStatus.className = "status";
      }, 3000);
    }
    
    await initApiConfig();
  } catch (error) {
    console.error("重置API设置失败:", error);
    
    if (companyApiStatus) {
      companyApiStatus.textContent = "重置失败: " + (error as Error).message;
      companyApiStatus.className = "status error";
    }
  }
}

// 保存文案优化设置
async function saveOptimizeSettingsHandler() {
  const defaultSceneSelect = document.getElementById("defaultScene") as HTMLSelectElement;
  const defaultModeSelect = document.getElementById("defaultMode") as HTMLSelectElement;
  const strictBoundaryCheckbox = document.getElementById("strictBoundary") as HTMLInputElement;
  
  try {
    await saveOptimizeSettings({
      defaultScene: defaultSceneSelect.value,
      defaultMode: defaultModeSelect.value,
      strictBoundary: strictBoundaryCheckbox.checked
    });
    
    showNotification("文案优化设置已保存", "success");
  } catch (error) {
    console.error("保存文案优化设置失败:", error);
    showNotification("保存失败: " + (error as Error).message, "error");
  }
}

// 重置文案优化设置
async function resetOptimizeSettingsHandler() {
  const defaultSceneSelect = document.getElementById("defaultScene") as HTMLSelectElement;
  const defaultModeSelect = document.getElementById("defaultMode") as HTMLSelectElement;
  const strictBoundaryCheckbox = document.getElementById("strictBoundary") as HTMLInputElement;
  
  defaultSceneSelect.value = "console";
  defaultModeSelect.value = "optimize";
  strictBoundaryCheckbox.checked = true;
  
  try {
    await saveOptimizeSettings({
      defaultScene: "console",
      defaultMode: "optimize",
      strictBoundary: true
    });
    
    showNotification("文案优化设置已重置为默认", "success");
  } catch (error) {
    console.error("重置文案优化设置失败:", error);
    showNotification("重置失败: " + (error as Error).message, "error");
  }
}

// 开始优化测试
async function startOptimizeTest() {
  const testInputText = document.getElementById("testInputText") as HTMLTextAreaElement;
  const testSiteType = document.getElementById("testSiteType") as HTMLSelectElement;
  const testOptimizationType = document.getElementById("testOptimizationType") as HTMLSelectElement;
  const testStrictMode = document.getElementById("testStrictMode") as HTMLInputElement;
  const testStatus = document.getElementById("testStatus");
  const inputSection = document.querySelector(".input-section");
  const resultSection = document.querySelector(".result-section");
  
  const text = testInputText.value.trim();
  if (!text) {
    showNotification("请输入需要优化的文案", "error");
    return;
  }
  
  // 显示加载状态
  if (testStatus) {
    testStatus.style.display = "flex";
  }
  
  if (inputSection) {
    inputSection.classList.add("disabled");
  }
  
  try {
    const config = await getApiConfig();
    const startTime = Date.now();
    
    // 调用优化API
    const response = await fetch(`${config.baseUrl}/v1/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey || ""}`
      },
      body: JSON.stringify({
        text,
        mode: testOptimizationType.value,
        scene: testSiteType.value,
        strict: testStrictMode.checked
      })
    });
    
    const endTime = Date.now();
    const processingTimeMs = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`API请求失败: HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // 更新结果UI
    updateTestResults(text, result, processingTimeMs);
    
    // 隐藏加载状态，显示结果
    if (testStatus) {
      testStatus.style.display = "none";
    }
    
    if (inputSection) {
      inputSection.classList.remove("disabled");
    }
    
    if (resultSection) {
      resultSection.style.display = "block";
    }
  } catch (error) {
    console.error("优化测试失败:", error);
    
    if (testStatus) {
      testStatus.style.display = "none";
    }
    
    if (inputSection) {
      inputSection.classList.remove("disabled");
    }
    
    showNotification("优化失败: " + (error as Error).message, "error");
  }
}

// 更新测试结果UI
function updateTestResults(originalText: string, result: any, processingTimeMs: number) {
  const originalTextElem = document.getElementById("originalText");
  const optimizedTextElem = document.getElementById("optimizedText");
  const originalLengthElem = document.getElementById("originalLength");
  const optimizedLengthElem = document.getElementById("optimizedLength");
  const lengthComparisonElem = document.getElementById("lengthComparison");
  const grammarImprovementsElem = document.getElementById("grammarImprovements");
  const expressionImprovementsElem = document.getElementById("expressionImprovements");
  const processingTimeElem = document.getElementById("processingTime");
  const optimizationStatusElem = document.getElementById("optimizationStatus");
  const copyOptimizedButton = document.getElementById("copyOptimized") as HTMLButtonElement;
  const exportResultButton = document.getElementById("exportResult") as HTMLButtonElement;
  
  if (originalTextElem) {
    originalTextElem.textContent = originalText;
  }
  
  if (optimizedTextElem) {
    optimizedTextElem.textContent = result.rewritten || "无优化结果";
  }
  
  if (originalLengthElem) {
    originalLengthElem.textContent = `${originalText.length} 字符`;
  }
  
  if (optimizedLengthElem) {
    optimizedLengthElem.textContent = `${(result.rewritten || "").length} 字符`;
  }
  
  if (lengthComparisonElem) {
    const diff = (result.rewritten || "").length - originalText.length;
    const diffPercent = Math.round((diff / originalText.length) * 100);
    lengthComparisonElem.textContent = `${diff >= 0 ? '+' : ''}${diff} 字符 (${diffPercent >= 0 ? '+' : ''}${diffPercent}%)`;
  }
  
  if (grammarImprovementsElem) {
    const grammarChanges = (result.changes || []).filter((c: any) => c.type === "grammar").length;
    grammarImprovementsElem.textContent = `${grammarChanges} 处改进`;
  }
  
  if (expressionImprovementsElem) {
    const expressionChanges = (result.changes || []).filter((c: any) => ["clarity", "tone"].includes(c.type)).length;
    expressionImprovementsElem.textContent = `${expressionChanges} 处优化`;
  }
  
  if (processingTimeElem) {
    processingTimeElem.textContent = `${(processingTimeMs / 1000).toFixed(2)} 秒`;
  }
  
  if (optimizationStatusElem) {
    if (result.policy_hits && result.policy_hits.length > 0) {
      const blockingHits = result.policy_hits.filter((h: any) => h.severity === "block").length;
      const warningHits = result.policy_hits.filter((h: any) => h.severity === "warn").length;
      
      if (blockingHits > 0) {
        optimizationStatusElem.textContent = `⚠️ ${blockingHits} 处阻断, ${warningHits} 处警告`;
        optimizationStatusElem.className = "result-status warning";
      } else if (warningHits > 0) {
        optimizationStatusElem.textContent = `⚠️ ${warningHits} 处警告`;
        optimizationStatusElem.className = "result-status warning";
      } else {
        optimizationStatusElem.textContent = "✅ 优化成功";
        optimizationStatusElem.className = "result-status success";
      }
    } else {
      optimizationStatusElem.textContent = "✅ 优化成功";
      optimizationStatusElem.className = "result-status success";
    }
  }
  
  // 添加策略命中信息
  if (result.policy_hits && result.policy_hits.length > 0) {
    const optimizationDetails = document.getElementById("optimizationDetails");
    if (optimizationDetails) {
      const policyHitsContainer = document.createElement("div");
      policyHitsContainer.className = "policy-hits";
      policyHitsContainer.innerHTML = `
        <h4>策略命中</h4>
        <ul class="policy-hits-list">
          ${result.policy_hits.map((hit: any) => `
            <li class="policy-hit ${hit.severity}">
              <span class="hit-severity">${hit.severity === "block" ? "阻断" : "警告"}</span>
              <span class="hit-rule">${hit.rule}</span>
              <span class="hit-note">${hit.note}</span>
            </li>
          `).join("")}
        </ul>
      `;
      
      // 添加到已有内容后面
      optimizationDetails.appendChild(policyHitsContainer);
    }
  }
  
  // 启用复制和导出按钮
  if (copyOptimizedButton) {
    copyOptimizedButton.disabled = false;
    copyOptimizedButton.addEventListener("click", () => {
      navigator.clipboard.writeText(result.rewritten || "");
      showNotification("已复制到剪贴板", "success");
    });
  }
  
  if (exportResultButton) {
    exportResultButton.disabled = false;
    exportResultButton.addEventListener("click", () => {
      exportTestResults(originalText, result);
    });
  }
}

// 清空测试内容
function clearTestContent() {
  const testInputText = document.getElementById("testInputText") as HTMLTextAreaElement;
  const resultSection = document.querySelector(".result-section");
  
  if (testInputText) {
    testInputText.value = "";
  }
  
  if (resultSection) {
    resultSection.style.display = "none";
  }
}

// 加载示例文案
function loadSampleText() {
  const testInputText = document.getElementById("testInputText") as HTMLTextAreaElement;
  const testSiteType = document.getElementById("testSiteType") as HTMLSelectElement;
  
  const sampleTexts: Record<string, string> = {
    console: "系统正在处理您的请求,这可能需要几秒钟时间.请耐心等待,不要关闭页面或刷新浏览器.处理完成后,系统会自动跳转到结果页面.",
    marketing: "我们的产品使用了最先进的AI技术,能够帮助您提高工作效率,节省时间和成本.无论您是个人用户还是企业客户,都能从中受益.",
    notification: "您的账户余额不足,无法完成此次交易.请充值后重试,或联系客服获取帮助."
  };
  
  const scene = testSiteType.value as keyof typeof sampleTexts;
  testInputText.value = sampleTexts[scene] || sampleTexts.console;
}

// 导出测试结果
function exportTestResults(originalText: string, result: any) {
  const exportData = {
    original: originalText,
    optimized: result.rewritten,
    changes: result.changes,
    policy_hits: result.policy_hits,
    meta: result.meta,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `optimize-result-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 显示通知
function showNotification(message: string, type: "success" | "error" | "info" = "info") {
  // 检查是否已有通知元素
  let notification = document.querySelector(".notification");
  
  if (!notification) {
    notification = document.createElement("div");
    notification.className = "notification";
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // 显示通知
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);
  
  // 3秒后隐藏
  setTimeout(() => {
    notification.classList.remove("show");
    
    // 动画结束后移除元素
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
