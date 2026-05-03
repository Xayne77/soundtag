"use client";
import { useState, useRef, useEffect } from "react";
import { SongResult } from "@/components/SongResult";
import { SongCard } from "@/components/SongCard";
import { TagBadge } from "@/components/TagBadge";
import { PRESET_TAGS, parseSong, loadLibrary, saveLibrary } from "@/lib/types";
import type { Song } from "@/lib/types";

type SongInfo = Omit<Song, "id" | "tags" | "addedAt">;
type InputMode = "mic" | "file" | "search";
type Status = "idle" | "recording" | "processing" | "done" | "error";

// ─── Library View ─────────────────────────────────────────────
function LibraryView({
  library, onTagsUpdate, onDelete,
}: { library: Song[]; onTagsUpdate: (id: string, tags: string[]) => void; onDelete: (id: string) => void }) {
  const [filterTag, setFilterTag] = useState("all");
  const [search, setSearch] = useState("");
  const allUsedTags = ["all", ...Array.from(new Set(library.flatMap(s => s.tags || [])))];

  const filtered = library.filter(s => {
    const matchTag = filterTag === "all" || (s.tags || []).includes(filterTag);
    const matchSearch = !search
      || s.title.toLowerCase().includes(search.toLowerCase())
      || s.artist.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 搜尋歌名或歌手…"
        style={{
          width: "100%", background: "#1A1030", border: "1px solid #3D2B6E",
          borderRadius: 10, padding: "11px 14px", color: "#F0E6FF", fontSize: 14,
          outline: "none", marginBottom: 12,
        }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {allUsedTags.map(tag => {
          const active = filterTag === tag;
          const preset = PRESET_TAGS.find(t => t.id === tag);
          const color = preset?.color || "#9B8EA8";
          return (
            <button key={tag} onClick={() => setFilterTag(tag)} style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 12,
              cursor: "pointer", fontWeight: 600, transition: "all 0.15s",
              background: active ? (tag === "all" ? "#7C3AED" : color) + "33" : "transparent",
              color: active ? (tag === "all" ? "#A855F7" : color) : "#6B5A80",
              border: `1.5px solid ${active ? (tag === "all" ? "#7C3AED" : color) + "88" : "#3D2B6E55"}`,
            }}>
              {tag === "all" ? `全部 (${library.length})` : (preset?.label || tag)}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#6B5A80", padding: "56px 0", fontSize: 15 }}>
          {library.length === 0 ? "音樂庫是空的，快去識別第一首歌吧 🎶" : "沒有符合的歌曲"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(s => (
            <SongCard key={s.id} song={s} onTagsUpdate={onTagsUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function SoundTagApp() {
  const [tab, setTab]           = useState<"recognize" | "library">("recognize");
  const [inputMode, setInputMode] = useState<InputMode>("mic");

  // mic
  const [micStatus, setMicStatus] = useState<Status>("idle");
  const [micMsg, setMicMsg]       = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // file
  const [fileStatus, setFileStatus] = useState<Status>("idle");
  const [fileMsg, setFileMsg]       = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // search
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<SongInfo[]>([]);
  const [searchStatus, setSearchStatus]   = useState<Status>("idle");
  const [searchMsg, setSearchMsg]         = useState("");

  // pending result
  const [pendingSong, setPendingSong] = useState<SongInfo | null>(null);

  // library
  const [library, setLibrary] = useState<Song[]>([]);
  useEffect(() => { setLibrary(loadLibrary()); }, []);

  const updateLibrary = (lib: Song[]) => { setLibrary(lib); saveLibrary(lib); };
  const addSong = (song: SongInfo, tags: string[]) => {
    updateLibrary([{ ...song, id: Date.now().toString(), tags, addedAt: new Date().toISOString() }, ...library]);
    setPendingSong(null); setSearchResults([]);
    setMicStatus("idle"); setFileStatus("idle"); setSearchStatus("idle");
    setTab("library");
  };
  const updateTags = (id: string, tags: string[]) => updateLibrary(library.map(s => s.id === id ? { ...s, tags } : s));
  const deleteSong = (id: string) => updateLibrary(library.filter(s => s.id !== id));

  // ── mic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => processRecording(stream);
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true); setMicStatus("recording"); setMicMsg("正在錄音… (5秒後自動停止)");
      timerRef.current = setTimeout(stopRecording, 5000);
    } catch {
      setMicStatus("error"); setMicMsg("無法取得麥克風權限，請確認瀏覽器設定");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (mediaRecRef.current?.state !== "inactive") mediaRecRef.current?.stop();
    setIsRecording(false); setMicStatus("processing"); setMicMsg("辨識中…");
  };

  const processRecording = async (stream: MediaStream) => {
    stream.getTracks().forEach(t => t.stop());
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const buf  = await blob.arrayBuffer();
      const b64  = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const res  = await fetch("/api/record", { method: "POST", body: b64 });
      const data = await res.json();
      if (!res.ok || !data.track) throw new Error(data.error || "無法識別，請再試一次");
      setPendingSong(parseSong(data.track));
      setMicStatus("done");
    } catch (e: any) {
      setMicStatus("error"); setMicMsg(e.message);
    }
  };

  // ── file
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileStatus("processing"); setFileMsg("辨識中…"); setPendingSong(null);
    try {
      const buf   = await file.arrayBuffer();
      const slice = buf.byteLength > 512000 ? buf.slice(0, 512000) : buf;
      const b64   = btoa(String.fromCharCode(...new Uint8Array(slice)));
      const res   = await fetch("/api/detect", { method: "POST", body: b64 });
      const data  = await res.json();
      if (!res.ok || !data.track) throw new Error(data.error || "無法識別此音樂");
      setPendingSong(parseSong(data.track));
      setFileStatus("done");
    } catch (e: any) {
      setFileStatus("error"); setFileMsg(e.message);
    }
  };

  // ── search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchStatus("processing"); setSearchMsg("搜尋中…"); setSearchResults([]);
    try {
      const res  = await fetch(`/api/search?term=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "搜尋失敗");
      const hits = data?.tracks?.hits || [];
      if (!hits.length) throw new Error("找不到相關歌曲，試試其他關鍵字");
      setSearchResults(hits.map((h: any) => parseSong(h.track)));
      setSearchStatus("done"); setSearchMsg(`找到 ${hits.length} 筆結果`);
    } catch (e: any) {
      setSearchStatus("error"); setSearchMsg(e.message);
    }
  };

  const modeBtn = (active: boolean) => ({
    flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer" as const,
    fontWeight: 700, fontSize: 13, transition: "all 0.2s",
    background: active ? "linear-gradient(135deg,#7C3AED,#A855F7)" : "transparent",
    color: active ? "#fff" : "#6B5A80",
    boxShadow: active ? "0 4px 12px #7C3AED44" : "none",
  });

  const tabBtn = (active: boolean) => ({
    flex: 1, padding: "10px 0", borderRadius: 9, border: "none", cursor: "pointer" as const,
    fontWeight: 700, fontSize: 14, transition: "all 0.2s",
    background: active ? "linear-gradient(135deg,#7C3AED,#A855F7)" : "transparent",
    color: active ? "#fff" : "#6B5A80",
    boxShadow: active ? "0 4px 12px #7C3AED44" : "none",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 10%,#2D1B6944,transparent 55%),radial-gradient(ellipse at 80% 90%,#1B2D6933,transparent 55%),#0A0614",
      fontFamily: "'Noto Sans TC','SF Pro Display',sans-serif",
      color: "#F0E6FF", paddingBottom: 60,
    }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ripple{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.6);opacity:0}}
        *{box-sizing:border-box}
        input::placeholder{color:#6B5A80}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#3D2B6E;border-radius:4px}
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 20px 0", background: "linear-gradient(180deg,#0D0920,transparent)", marginBottom: 4 }}>
        <h1 style={{
          margin: "0 0 4px", fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em",
          background: "linear-gradient(135deg,#C084FC,#818CF8,#67E8F9)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>🎵 SoundTag</h1>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6B5A80" }}>識別音樂 · 打上標籤 · 建立音樂庫</p>

        <div style={{ display: "flex", gap: 4, background: "#1A1030", borderRadius: 12, padding: 4 }}>
          <button onClick={() => setTab("recognize")} style={tabBtn(tab === "recognize")}>🎵 識別</button>
          <button onClick={() => setTab("library")} style={tabBtn(tab === "library")}>
            📚 音樂庫{library.length > 0 ? ` (${library.length})` : ""}
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>

        {/* ── Recognize ── */}
        {tab === "recognize" && (
          <div>
            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 4, background: "#1A1030", borderRadius: 10, padding: 4, marginBottom: 16 }}>
              <button onClick={() => { setInputMode("mic"); setPendingSong(null); setMicStatus("idle"); }} style={modeBtn(inputMode === "mic")}>🎙 麥克風</button>
              <button onClick={() => { setInputMode("file"); setPendingSong(null); setFileStatus("idle"); setFileMsg(""); }} style={modeBtn(inputMode === "file")}>📁 上傳檔案</button>
              <button onClick={() => { setInputMode("search"); setSearchResults([]); setSearchStatus("idle"); }} style={modeBtn(inputMode === "search")}>🔍 搜尋</button>
            </div>

            {/* Mic */}
            {inputMode === "mic" && (
              <div>
                <div style={{
                  background: "linear-gradient(135deg,#1A1030,#130D28)", borderRadius: 24,
                  padding: "36px 20px", border: "1px solid #3D2B6E44", textAlign: "center", marginBottom: 16,
                }}>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={micStatus === "processing"}
                    style={{
                      width: 92, height: 92, borderRadius: "50%", border: "none",
                      cursor: micStatus === "processing" ? "not-allowed" : "pointer",
                      background: isRecording
                        ? "linear-gradient(135deg,#EF476F,#FF6B6B)"
                        : "linear-gradient(135deg,#7C3AED,#A855F7)",
                      boxShadow: isRecording
                        ? "0 0 0 10px #EF476F33,0 8px 32px #EF476F44"
                        : "0 0 0 0,0 8px 32px #7C3AED44",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 38, transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
                      transform: isRecording ? "scale(1.08)" : "scale(1)",
                      position: "relative", overflow: "visible", margin: "0 auto 20px",
                    }}
                  >
                    {isRecording && (
                      <span style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "3px solid #EF476F", animation: "ripple 1.2s infinite" }} />
                    )}
                    <span>{isRecording ? "⏹" : "🎵"}</span>
                  </button>

                  {micStatus === "idle"       && <p style={{ color: "#6B5A80",  fontSize: 14, margin: 0 }}>點擊按鈕，錄音 5 秒識別音樂</p>}
                  {micStatus === "recording"  && <p style={{ color: "#EF476F",  fontSize: 14, margin: 0 }}>{micMsg}</p>}
                  {micStatus === "processing" && <p style={{ color: "#A855F7",  fontSize: 14, margin: 0 }}>辨識中…</p>}
                  {micStatus === "error"      && (
                    <div>
                      <p style={{ color: "#EF476F", fontSize: 14, margin: "0 0 10px" }}>{micMsg}</p>
                      <button onClick={() => { setMicStatus("idle"); setMicMsg(""); }} style={{
                        background: "none", border: "1px solid #EF476F44", borderRadius: 8,
                        padding: "6px 14px", cursor: "pointer", color: "#EF476F", fontSize: 12,
                      }}>重試</button>
                    </div>
                  )}
                </div>
                {micStatus === "done" && pendingSong && <SongResult song={pendingSong} onSave={addSong} />}
              </div>
            )}

            {/* File */}
            {inputMode === "file" && (
              <div>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    background: dragOver ? "#2D1B6922" : "linear-gradient(135deg,#1A1030,#130D28)",
                    border: `2px dashed ${dragOver ? "#A855F7" : "#3D2B6E66"}`,
                    borderRadius: 20, padding: "32px 20px", textAlign: "center",
                    cursor: "pointer", marginBottom: 16, transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 10 }}>
                    {fileStatus === "processing"
                      ? <span style={{ display: "inline-block", animation: "spin 1.2s linear infinite" }}>⏳</span>
                      : fileStatus === "done" ? "✅" : fileStatus === "error" ? "❌" : "🎧"}
                  </div>
                  <p style={{ margin: "0 0 5px", fontWeight: 700, fontSize: 15, color: "#D8C8FF" }}>
                    {fileStatus === "processing" ? "辨識中，請稍候…"
                      : fileStatus === "done" ? "辨識完成！"
                      : fileStatus === "error" ? "辨識失敗"
                      : "點擊或拖拽上傳音訊檔"}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: fileStatus === "error" ? "#EF476F" : "#6B5A80" }}>
                    {fileStatus === "error" ? fileMsg : "支援 mp3 · wav · m4a · aac · flac"}
                  </p>
                  <input ref={fileRef} type="file" accept="audio/*"
                    onChange={e => handleFile(e.target.files?.[0])} style={{ display: "none" }} />
                </div>
                {fileStatus === "done" && pendingSong && <SongResult song={pendingSong} onSave={addSong} />}
              </div>
            )}

            {/* Search */}
            {inputMode === "search" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="輸入歌名或歌手名稱…"
                    style={{
                      flex: 1, background: "#1A1030", border: "1px solid #3D2B6E",
                      borderRadius: 12, padding: "12px 14px", color: "#F0E6FF", fontSize: 14, outline: "none",
                    }} />
                  <button onClick={handleSearch} disabled={searchStatus === "processing"} style={{
                    background: "linear-gradient(135deg,#7C3AED,#A855F7)", border: "none",
                    borderRadius: 12, padding: "0 20px", cursor: "pointer", color: "#fff", fontSize: 20,
                    opacity: searchStatus === "processing" ? 0.6 : 1,
                  }}>🔍</button>
                </div>
                {searchStatus === "processing" && (
                  <p style={{ color: "#A855F7", fontSize: 14, textAlign: "center" }}>
                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 6 }}>⏳</span>搜尋中…
                  </p>
                )}
                {searchStatus === "error" && <p style={{ color: "#EF476F", fontSize: 14, textAlign: "center" }}>{searchMsg}</p>}
                {searchResults.length > 0 && (
                  <div>
                    <p style={{ fontSize: 13, color: "#9B8EA8", margin: "0 0 10px" }}>選擇要加入的歌曲：</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {searchResults.map((song, i) => <SongResult key={i} song={song} onSave={addSong} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Library ── */}
        {tab === "library" && (
          <LibraryView library={library} onTagsUpdate={updateTags} onDelete={deleteSong} />
        )}
      </div>
    </div>
  );
}

