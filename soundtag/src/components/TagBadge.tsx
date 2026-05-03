"use client";
import { PRESET_TAGS } from "@/lib/types";

export function TagBadge({
  tag, onRemove, small,
}: { tag: string; onRemove?: () => void; small?: boolean }) {
  const preset = PRESET_TAGS.find(t => t.id === tag || t.label === tag);
  const color = preset?.color || "#9B8EA8";
  const label = preset?.label || tag;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: small ? "2px 8px" : "5px 12px",
      borderRadius: 20, fontSize: small ? 11 : 13, fontWeight: 600,
      background: color + "22", color, border: `1.5px solid ${color}55`,
      whiteSpace: "nowrap",
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{
          background: "none", border: "none", cursor: "pointer",
          color, fontSize: 14, padding: 0, lineHeight: 1, marginLeft: 2, opacity: 0.7,
        }}>×</button>
      )}
    </span>
  );
}
