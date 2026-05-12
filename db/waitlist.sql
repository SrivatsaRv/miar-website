CREATE TABLE IF NOT EXISTS waitlist_submissions (
  id TEXT PRIMARY KEY,
  submitted_at TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  organization TEXT,
  role TEXT,
  interest TEXT NOT NULL,
  focus TEXT NOT NULL,
  timeline TEXT,
  mission TEXT,
  source_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  cf_country TEXT,
  cf_region TEXT,
  cf_city TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_submitted_at
  ON waitlist_submissions (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_waitlist_submissions_email
  ON waitlist_submissions (email);
