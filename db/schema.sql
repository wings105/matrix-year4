PRAGMA foreign_keys = ON;

-- Immutable internal student identity. `student_code` is the public ID chosen by
-- the learner during registration and is used for login / device pairing.
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  student_code TEXT UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  pin_hash TEXT,
  pin_salt TEXT,
  recovery_hash TEXT,
  year_level INTEGER NOT NULL DEFAULT 4,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  day_no INTEGER NOT NULL CHECK(day_no BETWEEN 1 AND 8),
  task_key TEXT NOT NULL,
  is_done INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  UNIQUE(student_id, day_no, task_key),
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  selected_answer TEXT,
  correct_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mistakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  selected_answer TEXT,
  correct_answer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','mastered')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mastered_at TEXT,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_stats (
  student_id TEXT PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 1,
  preferred_language TEXT NOT NULL DEFAULT 'dual' CHECK(preferred_language IN ('bm','en','dual')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guardians (
  id TEXT PRIMARY KEY,
  parent_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  pin_salt TEXT NOT NULL,
  recovery_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guardian_students (
  guardian_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'guardian',
  role TEXT NOT NULL DEFAULT 'owner' CHECK(role IN ('owner','guardian','viewer')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(guardian_id, student_id),
  FOREIGN KEY(guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  actor_type TEXT NOT NULL CHECK(actor_type IN ('student','guardian')),
  actor_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS link_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_failures (
  scope_key TEXT PRIMARY KEY,
  fail_count INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_student_day ON daily_progress(student_id, day_no);
CREATE INDEX IF NOT EXISTS idx_quiz_student_subject ON quiz_attempts(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_mistakes_student_status ON mistakes(student_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_code_unique ON students(student_code COLLATE NOCASE) WHERE student_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_actor ON sessions(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_guardian_students_student ON guardian_students(student_id);
