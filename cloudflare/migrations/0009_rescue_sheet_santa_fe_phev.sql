CREATE TABLE IF NOT EXISTS rescue_sheets (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  generation_code TEXT,
  variant TEXT NOT NULL,
  year_from INTEGER,
  year_to INTEGER,
  body_style TEXT,
  seats TEXT,
  propulsion TEXT NOT NULL,
  voltage TEXT,
  market TEXT,
  language TEXT NOT NULL,
  document_id TEXT NOT NULL,
  version TEXT NOT NULL,
  version_date TEXT,
  source_type TEXT NOT NULL,
  source_url TEXT,
  official_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (official_status IN ('unverified', 'manufacturer_verified')),
  validation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'in_review', 'validated', 'rejected')),
  r2_key TEXT NOT NULL UNIQUE,
  sha256 TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  pages INTEGER NOT NULL,
  search_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pilot'
    CHECK (status IN ('pilot', 'active', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rescue_sheets_vehicle
  ON rescue_sheets(manufacturer, model, year_from, propulsion, status);

CREATE TABLE IF NOT EXISTS rescue_sheet_pages (
  sheet_id TEXT NOT NULL REFERENCES rescue_sheets(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL CHECK (page_number > 0),
  r2_key TEXT NOT NULL UNIQUE,
  sha256 TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sheet_id, page_number)
);

CREATE TABLE IF NOT EXISTS rescue_sheet_annotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sheet_id TEXT NOT NULL REFERENCES rescue_sheets(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  geometry_json TEXT NOT NULL,
  evidence_note TEXT NOT NULL DEFAULT '',
  validation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (validation_status IN ('pending', 'supported', 'conflict', 'rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO rescue_sheets
  (id, slug, manufacturer, model, generation_code, variant, year_from, year_to,
   body_style, seats, propulsion, voltage, market, language, document_id,
   version, version_date, source_type, source_url, official_status,
   validation_status, r2_key, sha256, bytes, pages, search_text, status)
VALUES
  ('hyundai-santa-fe-mx5-phev-2024-de', 'hyundai-santa-fe-mx5-phev-2024-de',
   'Hyundai', 'SANTA FE', 'MX5', 'Plug-In Hybrid', 2024, NULL,
   'SUV de 5 puertas', '5 / 6 / 7', 'PHEV', '360 V', 'Alemania', 'de',
   'KMH-MX5-RS-P-5-202404', '02', '2024', 'user_provided', NULL, 'unverified',
   'pending', 'rescue-sheets/hyundai/santa-fe-mx5-phev-2024/de/original.pdf',
   'a3d68f750de9f3298ccdae5b1e185e29d7acf5ce28ca61b7cdd241d65611e2ce',
   5025465, 4,
   'hyundai santa fe santafe mx5 plug in hybrid plugin hybrid phev hibrido enchufable 2024 360v',
   'pilot');

INSERT OR REPLACE INTO rescue_sheet_pages
  (sheet_id, page_number, r2_key, sha256, bytes, width, height)
VALUES
  ('hyundai-santa-fe-mx5-phev-2024-de', 1,
   'rescue-sheets/hyundai/santa-fe-mx5-phev-2024/de/pages/page-01.jpg',
   'e7a4f62b6f4911f0010ec299ca1d75707aebe7fac89dcb248e1f5656898a8c27', 604557, 1350, 1950),
  ('hyundai-santa-fe-mx5-phev-2024-de', 2,
   'rescue-sheets/hyundai/santa-fe-mx5-phev-2024/de/pages/page-02.jpg',
   '287a605d06419af379340367ae62405704586d1e28302a1a5b163c7898c9c3d9', 652827, 1350, 1950),
  ('hyundai-santa-fe-mx5-phev-2024-de', 3,
   'rescue-sheets/hyundai/santa-fe-mx5-phev-2024/de/pages/page-03.jpg',
   '2d2c0e008ffd155fc5b3cf85e8d2b06508cf2a3e2846509d9da10b51ff28bbb9', 623875, 1350, 1950),
  ('hyundai-santa-fe-mx5-phev-2024-de', 4,
   'rescue-sheets/hyundai/santa-fe-mx5-phev-2024/de/pages/page-04.jpg',
   'f1f72764493f6f4b4016317cabe21c56002dd80cfd3c74a43d4f0a9b09e0e5c0', 635069, 1350, 1950);
