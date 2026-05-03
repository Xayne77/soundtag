export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  genre: string;
  shazamKey: string;
  tags: string[];
  addedAt: string;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export const PRESET_TAGS: Tag[] = [
  { id: "happy",     label: "😄 歡樂",  color: "#FFD166" },
  { id: "chill",     label: "😌 放鬆",  color: "#06D6A0" },
  { id: "energetic", label: "⚡ 快節奏", color: "#EF476F" },
  { id: "romantic",  label: "💕 浪漫",  color: "#F4A261" },
  { id: "food",      label: "🍜 美食",  color: "#E76F51" },
  { id: "study",     label: "📚 讀書",  color: "#118AB2" },
  { id: "workout",   label: "💪 運動",  color: "#8338EC" },
  { id: "sad",       label: "🌧 憂鬱",  color: "#457B9D" },
  { id: "night",     label: "🌙 夜晚",  color: "#9B5DE5" },
  { id: "travel",    label: "✈️ 旅行",  color: "#40916C" },
];

export function parseSong(track: any): Omit<Song, "id" | "tags" | "addedAt"> {
  return {
    title:     track.title    || "未知歌名",
    artist:    track.subtitle || "未知歌手",
    album:     track.sections?.[0]?.metadata?.find((m: any) => m.title === "Album")?.text || "",
    cover:     track.images?.coverart || track.images?.background || "",
    genre:     track.genres?.primary || "",
    shazamKey: track.key || "",
  };
}

export function loadLibrary(): Song[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("soundtag_lib") || "[]"); } catch { return []; }
}

export function saveLibrary(lib: Song[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("soundtag_lib", JSON.stringify(lib)); } catch {}
}
