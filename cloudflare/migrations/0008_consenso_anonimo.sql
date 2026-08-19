CREATE TABLE IF NOT EXISTS validation_cases (
  case_key TEXT PRIMARY KEY,
  question_normalized TEXT NOT NULL,
  representative_question TEXT NOT NULL,
  representative_answer TEXT NOT NULL,
  sources_json TEXT NOT NULL DEFAULT '[]',
  latest_response_id TEXT NOT NULL,
  latest_interaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'supported', 'conflict', 'rejected', 'dangerous')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_validation_cases_status
  ON validation_cases(status, updated_at);

CREATE TABLE IF NOT EXISTS case_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_key TEXT NOT NULL REFERENCES validation_cases(case_key) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  response_id TEXT NOT NULL,
  interaction_id TEXT,
  verdict TEXT NOT NULL
    CHECK (verdict IN ('correct', 'partial', 'incorrect', 'dangerous')),
  correction TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (case_key, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_case_validations_case_verdict
  ON case_validations(case_key, verdict);
