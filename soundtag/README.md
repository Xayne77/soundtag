# 🎵 SoundTag

用 Shazam API 識別音樂，打標籤，建立個人音樂庫。

## 功能
- 🎙 **麥克風錄音**識別（真實瀏覽器環境）
- 📁 **上傳音訊檔**識別（mp3 / wav / m4a / flac）
- 🔍 **搜尋歌名**查詢
- 🏷 預設 10 種標籤 + 自訂標籤（可複選）
- 📚 音樂庫：篩選、搜尋、編輯標籤、刪除

---

## 部署到 Vercel（10 分鐘完成）

### 1. 取得 Shazam API Key

1. 前往 [rapidapi.com](https://rapidapi.com)
2. 搜尋 **"Shazam"** → 選擇 **Shazam** by apidojo
3. 點 **Subscribe to Test** → 選免費方案（500 次/月）
4. 複製 **X-RapidAPI-Key**

### 2. 上傳到 GitHub

```bash
cd soundtag
git init
git add .
git commit -m "init SoundTag"
# 在 GitHub 建立新 repo，然後：
git remote add origin https://github.com/你的帳號/soundtag.git
git push -u origin main
```

### 3. 部署到 Vercel

1. 前往 [vercel.com](https://vercel.com) → New Project
2. 匯入你的 GitHub repo
3. 在 **Environment Variables** 加入：
   ```
   RAPIDAPI_KEY = 你的_rapidapi_key
   ```
4. 點 **Deploy** — 完成！

### 本機開發

```bash
cp .env.local.example .env.local
# 編輯 .env.local，填入你的 RAPIDAPI_KEY

npm install
npm run dev
# 打開 http://localhost:3000
```

---

## 技術架構

- **Frontend**: Next.js 14 + React + TypeScript
- **API Routes**: 代理 Shazam API（隱藏 API Key）
- **Storage**: localStorage（無需資料庫）
- **Deployment**: Vercel

## 注意事項

- 麥克風識別需要 **HTTPS**（Vercel 自動提供）
- 免費 API Key 每月 500 次請求
- 音樂庫資料儲存在瀏覽器 localStorage
