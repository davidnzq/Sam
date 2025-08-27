// src/routes/optimize.ts
import { loadGuide, summarizeGuideForPrompt } from "../lib/guide";
import { buildMessages } from "../lib/prompt";
import { lintAgainstGuide } from "../lib/lint";
import { z } from "zod";
import { openai } from "../lib/openai"; // 你现有的客户端
// minimalProofread 可用你现有的"最低改动"提示快速实现
import { minimalProofread } from "../lib/minimal";

const Resp = z.object({
  rewritten: z.string(),
  changes: z.array(z.object({
    type: z.enum(["grammar","clarity","tone","term","format"]),
    before: z.string(),
    after: z.string(),
    reason: z.string()
  })),
  policy_hits: z.array(z.object({
    rule: z.string(),
    note: z.string(),
    severity: z.enum(["block","warn"])
  })),
  confidence: z.number().min(0).max(1)
});

export async function optimizeHandler(req, res) {
  const { text, mode="proofread", scene="console", strict=true, policy_version } = req.body || {};
  const guide = loadGuide(scene, policy_version);
  const snippets = summarizeGuideForPrompt(guide.data);

  const messages = buildMessages({ text, mode, scene, boundarySnippets: snippets });
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: mode === "proofread" ? 0.2 : 0.5,
    response_format: { type: "json_object" }
  });

  let data = Resp.parse(JSON.parse(resp.choices[0].message.content));

  // 二次校验
  const postHits = lintAgainstGuide(data.rewritten, guide.data);
  const mergedHits = [...data.policy_hits, ...postHits];

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
