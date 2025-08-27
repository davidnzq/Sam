// tests/test-validator.js
// 测试文案校验器功能

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { lintAgainstGuide } = require('./mock/lint');

// 加载样式指南
function loadGuide() {
  try {
    const yamlPath = path.join(__dirname, '../style-guide/company-copy.v1.yaml');
    const guideContent = fs.readFileSync(yamlPath, 'utf8');
    const guide = yaml.load(guideContent);
    return guide;
  } catch (error) {
    console.error('加载样式指南失败:', error.message);
    return null;
  }
}

// 加载测试样本
function loadSamples() {
  const samples = [];
  const samplesDir = path.join(__dirname, '../style-guide/test-samples');
  
  try {
    const files = fs.readdirSync(samplesDir);
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const content = fs.readFileSync(path.join(samplesDir, file), 'utf8');
        samples.push({
          name: file,
          content
        });
      }
    }
    
    return samples;
  } catch (error) {
    console.error('加载测试样本失败:', error.message);
    return [];
  }
}

// 主函数
async function main() {
  console.log('=== 文案校验器功能测试 ===');
  
  // 加载样式指南
  const guide = loadGuide();
  if (!guide) {
    console.log('❌ 无法加载样式指南，测试终止');
    return;
  }
  
  console.log('✅ 样式指南加载成功');
  console.log('版本:', guide.version);
  console.log('可用场景:', Object.keys(guide.scenes));
  
  // 加载测试样本
  const samples = loadSamples();
  if (samples.length === 0) {
    console.log('❌ 无法加载测试样本，测试终止');
    return;
  }
  
  console.log(`✅ 已加载 ${samples.length} 个测试样本`);
  
  // 对每个场景进行测试
  for (const sceneName of Object.keys(guide.scenes)) {
    const scene = guide.scenes[sceneName];
    
    console.log(`\n=== 场景: ${sceneName} ===`);
    
    for (const sample of samples) {
      console.log(`\n测试样本: ${sample.name}`);
      console.log(`内容: ${sample.content}`);
      
      try {
        const hits = lintAgainstGuide(sample.content, scene);
        
        if (hits.length > 0) {
          console.log(`检测到 ${hits.length} 个问题:`);
          hits.forEach((hit, index) => {
            console.log(`${index + 1}. ${hit.rule}(${hit.severity}): ${hit.note}`);
          });
          
          // 检查是否有阻断级别的命中
          const blockingHits = hits.filter(h => h.severity === 'block');
          if (blockingHits.length > 0) {
            console.log(`⚠️ 包含 ${blockingHits.length} 个阻断级别问题，严格模式下将回退到最小改动`);
          }
        } else {
          console.log('✅ 未检测到问题');
        }
      } catch (error) {
        console.log('❌ 校验失败:', error.message);
      }
    }
  }
  
  console.log('\n测试完成');
}

// 执行测试
main();
