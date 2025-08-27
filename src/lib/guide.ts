// src/lib/guide.ts
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type SceneGuide = {
  tone?: string[];
  glossary?: Record<string,string>;
  banned_terms?: string[];
  rules?: Array<{id:string; desc:string; type:string}>;
};

export type CompanyGuide = {
  version: string;
  locales: string[];
  scenes: Record<string, SceneGuide>;
};

export function loadGuide(scene: string, version?: string): { version: string; scene: string; data: SceneGuide } {
  const p = path.resolve(process.cwd(), "style-guide/company-copy.v1.yaml");
  const doc = yaml.load(fs.readFileSync(p, "utf8")) as CompanyGuide;
  const v = doc.version;
  const s = doc.scenes[scene] || doc.scenes["console"];
  return { version: v, scene, data: s };
}

// 将场景指南压缩成 3~6 段摘要字符串，避免把全文塞给模型
export function summarizeGuideForPrompt(guide: SceneGuide): string[] {
  const blocks: string[] = [];
  if (guide.tone?.length) blocks.push(`Tone: ${guide.tone.join("、")}（保持克制与清晰）`);
  if (guide.glossary && Object.keys(guide.glossary).length) {
    const pairs = Object.entries(guide.glossary).map(([k,v])=>`${k}→${v}`).join("； ");
    blocks.push(`Glossary（术语统一，不露英文化别名）：${pairs}`);
  }
  if (guide.banned_terms?.length) blocks.push(`Banned terms（硬禁止）：${guide.banned_terms.join("、")}`);
  if (guide.rules?.length) {
    const ids = guide.rules.map(r=>`${r.id}:${r.desc}`).join("； ");
    blocks.push(`Format/Style rules：${ids}`);
  }
  // 每段尽量短
  return blocks.slice(0, 6);
}
