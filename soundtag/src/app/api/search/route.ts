import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "伺服器未設定 API Key" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term") || "";

  try {
    const res = await fetch(
      `https://shazam.p.rapidapi.com/search?term=${encodeURIComponent(term)}&limit=5`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "shazam.p.rapidapi.com",
        },
      }
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Shazam API 錯誤", detail: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
