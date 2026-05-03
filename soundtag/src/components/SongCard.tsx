"use client";
import { useState } from "react";
import { TagBadge } from "./TagBadge";
import { TagEditor } from "./TagEditor";
import type { Song } from "@/lib/types";

export function SongCard({
  song, onTagsUpdate, onDelete,
}: { song: Song; onTagsUpdate: (id: string, tags: string[]) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState(song.tags || []);
  const [hovered, setHovered] = useState(false);

  const save = () => { onTagsUpdate(song.id, tags); setEditing(false); };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1E1535" : "#1A1030",
        border: "1px solid #3D2B6E55", borderRadius: 16, padding: 16,
        transition: "all 0.2s", transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 12px 40px #7C3AED22" : "0 4px 20px #00000033",
        position: "relative",
      }}
    >
      <button onClick={() => onDelete(song.id)} style={{
        position: "absolute", top: 10, right: 10,
        background: "none", border: "none", cursor: "pointer", color: "#9B8EA8", fontSize: 17, opacity: 0.4,
      }}>×</button>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {song.cover
          ? <img src={song.cover} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0, boxShadow: "0 3px 10px #00000055" }} />
          : <div style={{ width: 52, height: 52, borderRadius: 8, flexShrink: 0, background: "#7C3AED33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎵</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#F0E6FF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
          <div style={{ fontSize: 12, color: "#9B8EA8", marginTop: 2 }}>{song.artist}</div>
          {song.genre && <div style={{ fontSize: 10, color: "#7C3AED", fontWeight: 700, marginTop: 3 }}>{song.genre}</div>}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {song.tags?.length > 0
            ? song.tags.map(t => <TagBadge key={t} tag={t} small />)
            : <span style={{ fontSize: 12, color: "#6B5A80", fontStyle: "italic" }}>尚未標記</span>
          }
        </div>
        <button onClick={() => setEditing(!editing)} style={{
          fontSize: 12, color: "#A855F7", background: "none",
          border: "1px dashed #A855F744", borderRadius: 8, padding: "3px 10px", cursor: "pointer",
        }}>{editing ? "收起" : "＋ 編輯標籤"}</button>
      </div>

      {editing && (
        <div style={{ marginTop: 10, animation: "fadeIn 0.2s ease" }}>
          <TagEditor selected={tags} onChange={setTags} />
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {tags.map(t => <TagBadge key={t} tag={t} onRemove={() => setTags(prev => prev.filter(x => x !== t))} small />)}
            </div>
          )}
          <button onClick={save} style={{
            marginTop: 10, width: "100%", padding: "10px",
            background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none", borderRadius: 10,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700,
          }}>儲存</button>
        </div>
      )}
    </div>
  );
}
