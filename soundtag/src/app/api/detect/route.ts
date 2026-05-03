import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "伺服器未設定 API Key" }, { status: 500 });
  }

  try {
    const body = await req.text(); // base64 audio
    const res = await fetch("https://shazam.p.rapidapi.com/songs/v2/detect", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "shazam.p.rapidapi.com",
      },
      body,
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Shazam API 錯誤", detail: data }, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
