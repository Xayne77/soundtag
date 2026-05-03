"use client";
import { useState } from "react";
import { PRESET_TAGS } from "@/lib/types";

export function TagEditor({
  selected, onChange,
}: { selected: string[]; onChange: (tags: string[]) => void }) {
  const [custom, setCustom] = useState("");

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(t => t !== id) : [...selected, id]);

  const addCustom = () => {
    const v = custom.trim();
    if (v && !selected.includes(v)) { onChange([...selected, v]); setCustom(""); }
  };

  return (
    <div style={{ background: "#0D0920", borderRadius: 12, padding: 12, border: "1px solid #3D2B6E33" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {PRESET_TAGS.map(tag => {
          const active = selected.includes(tag.id);
          return (
            <button key={tag.id} onClick={() => toggle(tag.id)} style={{
              padding: "5px 11px", borderRadius: 20, fontSize: 13, cursor: "pointer",
              fontWeight: 600, transition: "all 0.15s",
              background: active ? tag.color + "33" : "transparent",
              color: active ? tag.color : "#6B5A80",
              border: `1.5px solid ${active ? tag.color + "88" : "#3D2B6E55"}`,
              transform: active ? "scale(1.04)" : "scale(1)",
            }}>{tag.label}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCustom()}
          placeholder="自訂標籤…"
          style={{
            flex: 1, background: "#1A1030", border: "1px solid #3D2B6E",
            borderRadius: 8, padding: "6px 10px", color: "#F0E6FF", fontSize: 13, outline: "none",
          }} />
        <button onClick={addCustom} style={{
          background: "#7C3AED22", border: "1px solid #7C3AED55",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#A855F7", fontSize: 13, fontWeight: 700,
        }}>加入</button>
      </div>
    </div>
  );
}
