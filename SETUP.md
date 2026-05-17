# Shoot OS — Setup Guide

## Quick Start (No Backend — Demo Mode)

The app works immediately with **local storage** without any backend setup.
Both Ma'am and Daksh can use it on the **same device** right away.

To try it:
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`

---

## Full Setup (Supabase — Multi-Device Sync)

For Ma'am and Daksh to work on **different devices** and see each other's updates in real time, you need Supabase.

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (name it "shoot-os" or anything you like)
3. Wait for it to provision (~1 min)

### Step 2 — Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates all tables and seeds them with the Indirookh SS26 products.

### Step 3 — Create Storage bucket (for image uploads)

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it `shoot-media`
4. Check **Public bucket**
5. Click **Create**

### Step 4 — Get your API keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon/public key** (the long JWT string)

### Step 5 — Add environment variables

Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6 — Run the app

```bash
npm install
npm run dev
```

---

## Deploy to Netlify

### Option A — Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option B — GitHub + Netlify (recommended)
1. Push this project to a GitHub repo
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Connect your GitHub repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy

---

## Updating product names

Products are pre-seeded from the brief. To rename them:
- **Local mode**: Go to Planning → Products tab → the products are editable
- **Supabase mode**: Edit directly in the Supabase dashboard → Table Editor

---

## Adding your own colors

Go to **Products** page → tap any product → you'll see an **+ Color** button next to each product.

---

## Notes

- No passwords are needed — users just tap their name to log in
- All data is stored per-device in demo mode; use Supabase for cross-device sync
- The app is mobile-first but works on desktop too
- Image uploads work locally (creates a temporary URL) and persist in Supabase Storage when configured
