"use client";
import { useState } from "react";
import { TagBadge } from "./TagBadge";
import { TagEditor } from "./TagEditor";
import type { Song } from "@/lib/types";

type SongInfo = Omit<Song, "id" | "tags" | "addedAt">;

export function SongResult({
  song, onSave,
}: { song: SongInfo; onSave: (song: SongInfo, tags: string[]) => void }) {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <div style={{
      background: "linear-gradient(135deg,#1E1535,#16112B)", borderRadius: 20, padding: 20,
      border: "1px solid #7C3AED55", boxShadow: "0 8px 32px #7C3AED22",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
        {song.cover
          ? <img src={song.cover} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", boxShadow: "0 4px 16px #00000066", flexShrink: 0 }} />
          : <div style={{ width: 64, height: 64, borderRadius: 12, background: "#7C3AED33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>🎵</div>
        }
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#F0E6FF" }}>{song.title}</div>
          <div style={{ fontSize: 13, color: "#9B8EA8", marginTop: 3 }}>{song.artist}</div>
          {song.album && <div style={{ fontSize: 11, color: "#6B5A80", marginTop: 2 }}>{song.album}</div>}
          {song.genre && <div style={{ fontSize: 11, color: "#A855F7", fontWeight: 700, marginTop: 3 }}>{song.genre}</div>}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#9B8EA8", margin: "0 0 10px", fontWeight: 600 }}>選擇標籤（可複選）</p>
      <TagEditor selected={tags} onChange={setTags} />

      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {tags.map(t => (
            <TagBadge key={t} tag={t} onRemove={() => setTags(prev => prev.filter(x => x !== t))} />
          ))}
        </div>
      )}

      <button onClick={() => onSave(song, tags)} style={{
        width: "100%", marginTop: 16, padding: 14,
        background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 12,
        cursor: "pointer", color: "#fff", fontSize: 15, fontWeight: 800,
        boxShadow: "0 6px 20px #7C3AED44", letterSpacing: "0.02em",
      }}>💾 加入音樂庫</button>
    </div>
  );
}
