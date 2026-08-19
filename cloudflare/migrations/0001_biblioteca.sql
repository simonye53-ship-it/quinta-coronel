PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS manuals (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  edition TEXT,
  description TEXT NOT NULL DEFAULT '',
  r2_key TEXT NOT NULL UNIQUE,
  cover_r2_key TEXT,
  sha256 TEXT NOT NULL UNIQUE,
  bytes INTEGER NOT NULL CHECK (bytes >= 0),
  pages INTEGER CHECK (pages IS NULL OR pages > 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'replaced', 'archived')),
  source_url TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manuals_status_title
  ON manuals(status, title);

CREATE TABLE IF NOT EXISTS manual_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  manual_id TEXT NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  page_start INTEGER NOT NULL CHECK (page_start > 0),
  page_end INTEGER NOT NULL CHECK (page_end >= page_start),
  heading TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL CHECK (length(content) > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manual_chunks_manual_page
  ON manual_chunks(manual_id, page_start, page_end);

CREATE VIRTUAL TABLE IF NOT EXISTS manual_chunks_fts USING fts5(
  heading,
  content,
  manual_id UNINDEXED,
  content='manual_chunks',
  content_rowid='id',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS manual_chunks_after_insert
AFTER INSERT ON manual_chunks BEGIN
  INSERT INTO manual_chunks_fts(rowid, heading, content, manual_id)
  VALUES (new.id, new.heading, new.content, new.manual_id);
END;

CREATE TRIGGER IF NOT EXISTS manual_chunks_after_delete
AFTER DELETE ON manual_chunks BEGIN
  INSERT INTO manual_chunks_fts(manual_chunks_fts, rowid, heading, content, manual_id)
  VALUES ('delete', old.id, old.heading, old.content, old.manual_id);
END;

CREATE TRIGGER IF NOT EXISTS manual_chunks_after_update
AFTER UPDATE ON manual_chunks BEGIN
  INSERT INTO manual_chunks_fts(manual_chunks_fts, rowid, heading, content, manual_id)
  VALUES ('delete', old.id, old.heading, old.content, old.manual_id);
  INSERT INTO manual_chunks_fts(rowid, heading, content, manual_id)
  VALUES (new.id, new.heading, new.content, new.manual_id);
END;
