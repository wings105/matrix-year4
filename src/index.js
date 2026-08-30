const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

const statements = [
  `CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    year_level INTEGER NOT NULL DEFAULT 4,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS daily_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    day_no INTEGER NOT NULL CHECK(day_no BETWEEN 1 AND 8),
    task_key TEXT NOT NULL,
    is_done INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    UNIQUE(student_id, day_no, task_key),
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS quiz_attempts (
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
  )`,
  `CREATE TABLE IF NOT EXISTS mistakes (
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
  )`,
  `CREATE TABLE IF NOT EXISTS student_stats (
    student_id TEXT PRIMARY KEY,
    xp INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 1,
    preferred_language TEXT NOT NULL DEFAULT 'dual' CHECK(preferred_language IN ('bm','en','dual')),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_progress_student_day ON daily_progress(student_id, day_no)`,
  `CREATE INDEX IF NOT EXISTS idx_quiz_student_subject ON quiz_attempts(student_id, subject)`,
  `CREATE INDEX IF NOT EXISTS idx_mistakes_student_status ON mistakes(student_id, status)`
];

async function ensureSchema(db) {
  const existing = await db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='students'"
  ).first();
  if (!existing) {
    for (const sql of statements) await db.prepare(sql).run();
  }
}

async function bodyJson(request) {
  try { return await request.json(); } catch { return null; }
}

const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const boolInt = value => value ? 1 : 0;

async function ensureStudent(db, id, name = 'Pelajar') {
  const studentId = text(id, 80);
  if (!studentId) throw new Error('studentId is required');
  const studentName = text(name, 80) || 'Pelajar';
  await db.prepare(`
    INSERT INTO students (id, name, year_level, updated_at)
    VALUES (?, ?, 4, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, updated_at=CURRENT_TIMESTAMP
  `).bind(studentId, studentName).run();
  await db.prepare(`
    INSERT INTO student_stats (student_id)
    VALUES (?)
    ON CONFLICT(student_id) DO NOTHING
  `).bind(studentId).run();
  return studentId;
}

async function getState(db, studentId) {
  const student = await db.prepare('SELECT id, name, year_level, created_at, updated_at FROM students WHERE id=?')
    .bind(studentId).first();
  const stats = await db.prepare('SELECT xp, stars, streak, preferred_language, updated_at FROM student_stats WHERE student_id=?')
    .bind(studentId).first();
  const progress = await db.prepare('SELECT day_no, task_key, is_done, completed_at FROM daily_progress WHERE student_id=? ORDER BY day_no, task_key')
    .bind(studentId).all();
  const mistakes = await db.prepare(`
    SELECT id, subject, topic, question, selected_answer, correct_answer, status, created_at, mastered_at
    FROM mistakes WHERE student_id=? ORDER BY id DESC LIMIT 100
  `).bind(studentId).all();
  return { student, stats, progress: progress.results || [], mistakes: mistakes.results || [] };
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
        return json({ ok: false, app: 'matrix-year4', database: 'error', error: error instanceof Error ? error.message : String(error) }, 500);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        await ensureSchema(env.DB);

        if (url.pathname === '/api/bootstrap' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const studentId = await ensureStudent(env.DB, body.studentId, body.name);
          return json({ ok: true, ...(await getState(env.DB, studentId)) });
        }

        if (url.pathname === '/api/state' && request.method === 'GET') {
          const studentId = text(url.searchParams.get('studentId'), 80);
          if (!studentId) return json({ ok: false, error: 'studentId is required' }, 400);
          return json({ ok: true, ...(await getState(env.DB, studentId)) });
        }

        if (url.pathname === '/api/progress' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const studentId = await ensureStudent(env.DB, body.studentId, body.name);
          const dayNo = Number(body.dayNo);
          const taskKey = text(body.taskKey, 160);
          if (!Number.isInteger(dayNo) || dayNo < 1 || dayNo > 8 || !taskKey) return json({ ok: false, error: 'Invalid dayNo or taskKey' }, 400);
          const isDone = boolInt(body.isDone);
          await env.DB.prepare(`
            INSERT INTO daily_progress (student_id, day_no, task_key, is_done, completed_at)
            VALUES (?, ?, ?, ?, CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END)
            ON CONFLICT(student_id, day_no, task_key) DO UPDATE SET
              is_done=excluded.is_done,
              completed_at=CASE WHEN excluded.is_done=1 THEN CURRENT_TIMESTAMP ELSE NULL END
          `).bind(studentId, dayNo, taskKey, isDone, isDone).run();
          return json({ ok: true });
        }

        if (url.pathname === '/api/quiz' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const studentId = await ensureStudent(env.DB, body.studentId, body.name);
          const subject = text(body.subject, 50);
          const topic = text(body.topic, 100);
          const question = text(body.question, 1200);
          const selectedAnswer = text(body.selectedAnswer, 500);
          const correctAnswer = text(body.correctAnswer, 500);
          const isCorrect = boolInt(body.isCorrect);
          if (!subject || !question || !correctAnswer) return json({ ok: false, error: 'subject, question and correctAnswer are required' }, 400);

          await env.DB.prepare(`
            INSERT INTO quiz_attempts (student_id, subject, topic, question, selected_answer, correct_answer, is_correct)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(studentId, subject, topic || null, question, selectedAnswer || null, correctAnswer, isCorrect).run();

          if (!isCorrect) {
            await env.DB.prepare(`
              INSERT INTO mistakes (student_id, subject, topic, question, selected_answer, correct_answer)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(studentId, subject, topic || null, question, selectedAnswer || null, correctAnswer).run();
          }

          const xpGain = isCorrect ? 10 : 2;
          await env.DB.prepare(`
            UPDATE student_stats
            SET xp=xp+?, stars=CAST((xp+?)/50 AS INTEGER), updated_at=CURRENT_TIMESTAMP
            WHERE student_id=?
          `).bind(xpGain, xpGain, studentId).run();

          const stats = await env.DB.prepare('SELECT xp, stars, streak, preferred_language FROM student_stats WHERE student_id=?').bind(studentId).first();
          return json({ ok: true, stats });
        }

        if (url.pathname === '/api/stats' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const studentId = await ensureStudent(env.DB, body.studentId, body.name);
          const lang = ['bm','en','dual'].includes(body.preferredLanguage) ? body.preferredLanguage : null;
          const streak = Number(body.streak);
          if (lang) await env.DB.prepare('UPDATE student_stats SET preferred_language=?, updated_at=CURRENT_TIMESTAMP WHERE student_id=?').bind(lang, studentId).run();
          if (Number.isInteger(streak) && streak >= 1 && streak <= 999) await env.DB.prepare('UPDATE student_stats SET streak=?, updated_at=CURRENT_TIMESTAMP WHERE student_id=?').bind(streak, studentId).run();
          return json({ ok: true });
        }

        const mastered = url.pathname.match(/^\/api\/mistakes\/(\d+)\/mastered$/);
        if (mastered && request.method === 'POST') {
          const body = await bodyJson(request) || {};
          const studentId = text(body.studentId, 80);
          if (!studentId) return json({ ok: false, error: 'studentId is required' }, 400);
          const id = Number(mastered[1]);
          const result = await env.DB.prepare(`
            UPDATE mistakes SET status='mastered', mastered_at=CURRENT_TIMESTAMP
            WHERE id=? AND student_id=?
          `).bind(id, studentId).run();
          return json({ ok: true, changed: Number(result.meta?.changes || 0) });
        }

        return json({ ok: false, error: 'API route not found' }, 404);
      } catch (error) {
        return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
