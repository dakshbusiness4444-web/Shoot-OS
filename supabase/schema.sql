-- Shoot OS — Supabase Schema (Phase 2)
-- Run this in your Supabase SQL editor to set up the database.

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  shoot_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Products ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Product Colors ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_colors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  hex_code TEXT DEFAULT '#D4C9B5',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Shots ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  color_id TEXT REFERENCES product_colors(id) ON DELETE SET NULL,
  shot_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  shot_type TEXT DEFAULT 'product',
  platform TEXT,
  priority TEXT DEFAULT 'normal',
  extra_type TEXT DEFAULT 'optional',
  creator TEXT NOT NULL DEFAULT 'maam',
  -- media
  media_type TEXT DEFAULT 'photo' CHECK (media_type IN ('photo', 'video')),
  reference_image_url TEXT,
  reference_reel_url TEXT,
  pinterest_url TEXT,
  -- direction
  pose_description TEXT,
  camera_angle TEXT,
  lens_feel TEXT,
  lighting_notes TEXT,
  mood TEXT,
  styling_note TEXT,
  -- video-specific
  movement TEXT,
  camera_motion TEXT,
  transition_note TEXT,
  audio_note TEXT,
  -- legacy / misc
  result_reference_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── References ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shot_references (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  shot_id TEXT REFERENCES shots(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'image',
  url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  notes TEXT,
  creator TEXT NOT NULL DEFAULT 'maam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BTS Ideas ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bts_ideas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'general',
  creator TEXT NOT NULL DEFAULT 'maam',
  reference_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Styling Pairings (Style With section on product pages) ──────────────────
CREATE TABLE IF NOT EXISTS styling_pairings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  color_id TEXT REFERENCES product_colors(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'shirt' CHECK (type IN ('shirt', 'layer', 'accessory', 'note', 'aesthetic')),
  description TEXT NOT NULL,
  notes TEXT,
  image_url TEXT,
  creator TEXT NOT NULL DEFAULT 'maam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Matching Shirts (legacy — kept for backward compat) ─────────────────────
CREATE TABLE IF NOT EXISTS matching_shirts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  color_id TEXT REFERENCES product_colors(id) ON DELETE CASCADE,
  shirt_description TEXT NOT NULL,
  shirt_color TEXT,
  notes TEXT,
  creator TEXT NOT NULL DEFAULT 'maam',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Enable Realtime ──────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE shots;
ALTER PUBLICATION supabase_realtime ADD TABLE shot_references;
ALTER PUBLICATION supabase_realtime ADD TABLE bts_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE styling_pairings;
ALTER PUBLICATION supabase_realtime ADD TABLE matching_shirts;

-- ─── Seed Data — Project ──────────────────────────────────────────────────────
INSERT INTO projects (id, name, description, status) VALUES
  ('proj-indirookh-ss26', 'Indirookh SS26 Shoot', '2-day brand shoot — summer/spring collection', 'active')
ON CONFLICT (id) DO NOTHING;

-- ─── Seed Data — Products (Phase 2) ──────────────────────────────────────────
INSERT INTO products (id, project_id, name, category, priority) VALUES
  ('prod-pants',    'proj-indirookh-ss26', 'Linen Pants',   'pants',    1),
  ('prod-shorts',   'proj-indirookh-ss26', 'Shorts',        'shorts',   1),
  ('prod-culottes', 'proj-indirookh-ss26', 'Culottes',      'culottes', 1),
  ('prod-dress',    'proj-indirookh-ss26', 'Striped Dress', 'dress',    1),
  ('prod-tops',     'proj-indirookh-ss26', 'Shirts & Tops', 'top',      2)
ON CONFLICT (id) DO NOTHING;

-- ─── Seed Data — Colors (Phase 2) ────────────────────────────────────────────
INSERT INTO product_colors (id, product_id, color_name, hex_code) VALUES
  -- Linen Pants
  ('col-pants-olive',  'prod-pants',    'Olive',  '#6B6B42'),
  ('col-pants-khaki',  'prod-pants',    'Khaki',  '#C4A97D'),
  ('col-pants-black',  'prod-pants',    'Black',  '#1C1C1A'),
  -- Shorts
  ('col-shorts-khaki', 'prod-shorts',   'Khaki',  '#C4A97D'),
  ('col-shorts-maroon','prod-shorts',   'Maroon', '#7A2535'),
  -- Culottes
  ('col-cul-khaki',    'prod-culottes', 'Khaki',  '#C4A97D'),
  ('col-cul-indigo',   'prod-culottes', 'Indigo', '#3D4B7A'),
  -- Striped Dress
  ('col-dress-stripe', 'prod-dress',    'Stripe', '#B5A898'),
  -- Shirts & Tops
  ('col-tops-white',   'prod-tops',     'White',  '#FAFAF7'),
  ('col-tops-beige',   'prod-tops',     'Beige',  '#D4C9B5'),
  ('col-tops-stripe',  'prod-tops',     'Stripe', '#B5A898')
ON CONFLICT (id) DO NOTHING;

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- Run separately if using Supabase Storage for image uploads:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('shoot-media', 'shoot-media', true)
-- ON CONFLICT DO NOTHING;

-- ─── RLS (disabled — internal tool) ──────────────────────────────────────────
ALTER TABLE projects        DISABLE ROW LEVEL SECURITY;
ALTER TABLE products        DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors  DISABLE ROW LEVEL SECURITY;
ALTER TABLE shots           DISABLE ROW LEVEL SECURITY;
ALTER TABLE shot_references DISABLE ROW LEVEL SECURITY;
ALTER TABLE bts_ideas       DISABLE ROW LEVEL SECURITY;
ALTER TABLE styling_pairings DISABLE ROW LEVEL SECURITY;
ALTER TABLE matching_shirts DISABLE ROW LEVEL SECURITY;
