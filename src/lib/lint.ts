// src/lib/lint.ts
import type { SceneGuide } from "./guide";

export type Hit = { rule:string; note:string; severity:"block"|"warn" };

export function lintAgainstGuide(text: string, scene: SceneGuide): Hit[] {
  const hits: Hit[] = [];

  // 禁用词（阻断）
  for (const term of scene.banned_terms || []) {
    if (term && text.includes(term)) {
      hits.push({ rule:"BANNED_TERM", note:`命中禁用词「${term}」`, severity:"block" });
    }
  }

  // 数字+单位空格（示例规则，简化判断）
  const badNumUnit = /\b(\d+)(GB|MB|TB|%|ms|s)\b/g;
  if (badNumUnit.test(text)) {
    hits.push({ rule:"NUM-UNIT-SPACE", note:"数字与单位之间缺少空格（如 10 GB、50 %）", severity:"warn" });
  }

  // 半角逗号（建议用中文全角）
  if (/[^\s],[^\s]/.test(text)) {
    hits.push({ rule:"CN-PUNC", note:"建议使用中文全角逗号", severity:"warn" });
  }

  // 术语统一（英文→指定中文）
  for (const [en, zh] of Object.entries(scene.glossary || {})) {
    const re = new RegExp(`\\b${en}\\b`, "i");
    if (re.test(text) && !text.includes(zh)) {
      hits.push({ rule:"GLOSSARY", note:`术语「${en}」应统一为「${zh}」`, severity:"warn" });
    }
  }

  return hits;
}
