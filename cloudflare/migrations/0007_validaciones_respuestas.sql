CREATE TABLE IF NOT EXISTS response_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  interaction_id TEXT,
  verdict TEXT NOT NULL
    CHECK (verdict IN ('correct', 'partial', 'incorrect', 'dangerous')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sources_json TEXT NOT NULL DEFAULT '[]',
  correction TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (response_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_response_validations_verdict_created
  ON response_validations(verdict, created_at);

CREATE INDEX IF NOT EXISTS idx_response_validations_interaction
  ON response_validations(interaction_id);
