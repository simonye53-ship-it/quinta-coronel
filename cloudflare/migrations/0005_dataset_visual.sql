CREATE TABLE IF NOT EXISTS visual_assets (
  id TEXT PRIMARY KEY,
  manual_id TEXT NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL CHECK (page_number > 0),
  r2_key TEXT NOT NULL UNIQUE,
  sha256 TEXT NOT NULL,
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  ocr_text TEXT NOT NULL DEFAULT '',
  analysis TEXT NOT NULL DEFAULT '',
  analysis_model TEXT,
  status TEXT NOT NULL DEFAULT 'unprocessed'
    CHECK (status IN ('unprocessed', 'pending', 'supported', 'conflict', 'rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (manual_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_visual_assets_manual_page
  ON visual_assets(manual_id, page_number);

CREATE INDEX IF NOT EXISTS idx_visual_assets_status
  ON visual_assets(status, updated_at);

CREATE TABLE IF NOT EXISTS visual_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id TEXT NOT NULL REFERENCES visual_assets(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  verdict TEXT NOT NULL
    CHECK (verdict IN ('correct', 'partial', 'incorrect', 'unknown')),
  correction TEXT NOT NULL DEFAULT '',
  question_context TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (asset_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_visual_validations_asset
  ON visual_validations(asset_id, verdict);
