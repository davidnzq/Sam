// src/extension/ui/panel.tsx
import React, { useState } from "react";
import { optimize } from "../../utils/api";

export function Panel({ selectedText }: { selectedText: string }) {
  const [mode, setMode] = useState<"proofread"|"optimize">("optimize");
  const [scene, setScene] = useState<"marketing"|"console"|"notification">("console");
  const [strict, setStrict] = useState(true);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    const r = await optimize({ text: selectedText, mode, scene, strict });
    setResult(r);
  };

  return (
    <div style={{ padding: 12, width: 360 }}>
      <div style={{ marginBottom: 8 }}>
        <label>模式：</label>
        <select value={mode} onChange={e=>setMode(e.target.value as any)}>
          <option value="proofread">语法校对（最小改动）</option>
          <option value="optimize">文案优化（受边界约束）</option>
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>场景：</label>
        <select value={scene} onChange={e=>setScene(e.target.value as any)}>
          <option value="console">产品内文案</option>
          <option value="marketing">营销/官网</option>
          <option value="notification">通知/弹窗</option>
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>
          <input type="checkbox" checked={strict} onChange={e=>setStrict(e.target.checked)} />
          严格边界
        </label>
      </div>

      <button onClick={run}>生成</button>

      {result && (
        <div style={{ marginTop: 12 }}>
          <h4>建议稿</h4>
          <pre style={{ whiteSpace: "pre-wrap" }}>{result.rewritten}</pre>

          {result.policy_hits?.length > 0 && (
            <>
              <h4>合规检查</h4>
              <ul>
                {result.policy_hits.map((h, i)=>(
                  <li key={i}>
                    <b>{h.severity.toUpperCase()}</b> · {h.rule} · {h.note}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
