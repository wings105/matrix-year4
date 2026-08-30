const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_progress_student_day ON daily_progress(student_id, day_no);
CREATE INDEX IF NOT EXISTS idx_quiz_student_subject ON quiz_attempts(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_mistakes_student_status ON mistakes(student_id, status);
`;

async function ensureSchema(db) {
  const existing = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='students'"
  ).first();

  if (!existing) {
    await db.exec(SCHEMA);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      try {
        await ensureSchema(env.DB);

        const result = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ).first();

        return json({
          ok: true,
          app: 'matrix-year4',
          database: 'connected',
          schema: 'ready',
          tables: Number(result?.count || 0),
          time: new Date().toISOString(),
        });
      } catch (error) {
        return json(
          {
            ok: false,
            app: 'matrix-year4',
            database: 'error',
            error: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'API route not found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
