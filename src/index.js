const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extraHeaders,
    },
  });

const enc = new TextEncoder();
const dec = new TextDecoder();
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const nowIso = () => new Date().toISOString();
const futureIso = ms => new Date(Date.now() + ms).toISOString();
const boolInt = value => value ? 1 : 0;

const CREATE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    student_code TEXT,
    name TEXT NOT NULL,
    pin_hash TEXT,
    pin_salt TEXT,
    recovery_hash TEXT,
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
  `CREATE TABLE IF NOT EXISTS guardians (
    id TEXT PRIMARY KEY,
    parent_code TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    pin_salt TEXT NOT NULL,
    recovery_hash TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS guardian_students (
    guardian_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    relationship TEXT NOT NULL DEFAULT 'guardian',
    role TEXT NOT NULL DEFAULT 'owner' CHECK(role IN ('owner','guardian','viewer')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(guardian_id, student_id),
    FOREIGN KEY(guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT NOT NULL UNIQUE,
    actor_type TEXT NOT NULL CHECK(actor_type IN ('student','guardian')),
    actor_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS link_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    code_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS auth_failures (
    scope_key TEXT PRIMARY KEY,
    fail_count INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_progress_student_day ON daily_progress(student_id, day_no)`,
  `CREATE INDEX IF NOT EXISTS idx_quiz_student_subject ON quiz_attempts(student_id, subject)`,
  `CREATE INDEX IF NOT EXISTS idx_mistakes_student_status ON mistakes(student_id, status)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_students_code_unique ON students(student_code COLLATE NOCASE) WHERE student_code IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_actor ON sessions(actor_type, actor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_guardian_students_student ON guardian_students(student_id)`,
];

async function ensureColumn(db, table, name, definition) {
  const rows = await db.prepare(`PRAGMA table_info(${table})`).all();
  if (!(rows.results || []).some(row => row.name === name)) {
    await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`).run();
  }
}

async function ensureSchema(db) {
  for (const sql of CREATE_STATEMENTS.slice(0, 10)) await db.prepare(sql).run();

  // Backward-compatible migration from the prototype students table.
  await ensureColumn(db, 'students', 'student_code', 'TEXT');
  await ensureColumn(db, 'students', 'pin_hash', 'TEXT');
  await ensureColumn(db, 'students', 'pin_salt', 'TEXT');
  await ensureColumn(db, 'students', 'recovery_hash', 'TEXT');

  for (const sql of CREATE_STATEMENTS.slice(10)) await db.prepare(sql).run();
}

async function bodyJson(request) {
  try { return await request.json(); } catch { return null; }
}

function normalizeStudentCode(value) {
  return text(value, 20).toLowerCase();
}

function validStudentCode(value) {
  return /^[a-z0-9][a-z0-9_-]{2,19}$/.test(value);
}

function validPin(value) {
  return /^\d{6}$/.test(String(value ?? ''));
}

function bytesToBase64Url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

function randomToken(bytes = 32) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return bytesToBase64Url(data);
}

function randomDigits(length = 6) {
  const max = 10 ** length;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % max).padStart(length, '0');
}

function randomParentCode() {
  return `P-${randomToken(6).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
}

function randomRecoveryCode() {
  const raw = randomToken(9).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12).padEnd(12, 'X');
  return `R-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

async function derivePin(pin, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt: base64UrlToBytes(salt),
    iterations: 100000,
  }, key, 256);
  return bytesToBase64Url(new Uint8Array(bits));
}

async function makePinRecord(pin) {
  const salt = randomToken(16);
  return { salt, hash: await derivePin(pin, salt) };
}

async function checkPin(pin, salt, expected) {
  if (!salt || !expected) return false;
  return (await derivePin(pin, salt)) === expected;
}

async function isStudentCodeAvailable(db, code) {
  const found = await db.prepare('SELECT id FROM students WHERE student_code=? COLLATE NOCASE LIMIT 1').bind(code).first();
  return !found;
}

async function createStudent(db, { name, studentCode, pin }) {
  const displayName = text(name, 80);
  const code = normalizeStudentCode(studentCode);
  if (displayName.length < 2) throw Object.assign(new Error('Nama pelajar diperlukan'), { status: 400 });
  if (!validStudentCode(code)) throw Object.assign(new Error('ID pelajar mesti 3–20 aksara: huruf, nombor, - atau _'), { status: 400 });
  if (!validPin(pin)) throw Object.assign(new Error('PIN mesti 6 digit nombor'), { status: 400 });
  if (!(await isStudentCodeAvailable(db, code))) throw Object.assign(new Error('ID pelajar sudah digunakan'), { status: 409 });

  const id = crypto.randomUUID();
  const pinRecord = await makePinRecord(pin);
  const recoveryCode = randomRecoveryCode();
  const recoveryHash = await sha256(recoveryCode);

  try {
    await db.prepare(`
      INSERT INTO students (id, student_code, name, pin_hash, pin_salt, recovery_hash, year_level, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 4, CURRENT_TIMESTAMP)
    `).bind(id, code, displayName, pinRecord.hash, pinRecord.salt, recoveryHash).run();
  } catch (error) {
    if (String(error).toLowerCase().includes('unique')) {
      throw Object.assign(new Error('ID pelajar sudah digunakan'), { status: 409 });
    }
    throw error;
  }

  await db.prepare(`INSERT INTO student_stats (student_id) VALUES (?) ON CONFLICT(student_id) DO NOTHING`).bind(id).run();
  return { student: { id, name: displayName, studentId: code, yearLevel: 4 }, recoveryCode };
}

async function getStudentPublic(db, id) {
  const row = await db.prepare(`
    SELECT id, student_code, name, year_level, created_at, updated_at
    FROM students WHERE id=?
  `).bind(id).first();
  if (!row) return null;
  return { id: row.id, studentId: row.student_code, name: row.name, yearLevel: row.year_level, createdAt: row.created_at, updatedAt: row.updated_at };
}

async function createGuardian(db, { name, pin }) {
  const displayName = text(name, 80);
  if (displayName.length < 2) throw Object.assign(new Error('Nama ibu bapa/penjaga diperlukan'), { status: 400 });
  if (!validPin(pin)) throw Object.assign(new Error('PIN mesti 6 digit nombor'), { status: 400 });

  const id = crypto.randomUUID();
  const pinRecord = await makePinRecord(pin);
  const recoveryCode = randomRecoveryCode();
  const recoveryHash = await sha256(recoveryCode);

  let parentCode;
  for (let i = 0; i < 5; i++) {
    parentCode = randomParentCode();
    const exists = await db.prepare('SELECT id FROM guardians WHERE parent_code=? COLLATE NOCASE').bind(parentCode).first();
    if (!exists) break;
  }

  await db.prepare(`
    INSERT INTO guardians (id, parent_code, name, pin_hash, pin_salt, recovery_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, parentCode, displayName, pinRecord.hash, pinRecord.salt, recoveryHash).run();

  return { guardian: { id, name: displayName, parentCode }, recoveryCode };
}

async function createSession(db, actorType, actorId) {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const expiresAt = futureIso(12 * 60 * 60 * 1000);
  await db.prepare(`
    INSERT INTO sessions (token_hash, actor_type, actor_id, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(tokenHash, actorType, actorId, expiresAt).run();
  return { token, expiresAt };
}

async function authorize(request, db, actorType = null) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) throw Object.assign(new Error('Log masuk diperlukan'), { status: 401 });
  const tokenHash = await sha256(match[1]);
  const session = await db.prepare(`
    SELECT id, actor_type, actor_id, expires_at
    FROM sessions
    WHERE token_hash=? AND revoked_at IS NULL AND expires_at > ?
    LIMIT 1
  `).bind(tokenHash, nowIso()).first();
  if (!session) throw Object.assign(new Error('Sesi tamat atau tidak sah'), { status: 401 });
  if (actorType && session.actor_type !== actorType) throw Object.assign(new Error('Akses tidak dibenarkan'), { status: 403 });
  await db.prepare('UPDATE sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE id=?').bind(session.id).run();
  return { sessionId: session.id, actorType: session.actor_type, actorId: session.actor_id, tokenHash };
}

async function logoutSession(db, sessionId) {
  await db.prepare('UPDATE sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=?').bind(sessionId).run();
}

async function throttleState(db, key) {
  const row = await db.prepare('SELECT fail_count, locked_until FROM auth_failures WHERE scope_key=?').bind(key).first();
  if (!row) return { locked: false, failCount: 0 };
  const locked = row.locked_until && new Date(row.locked_until).getTime() > Date.now();
  return { locked, failCount: Number(row.fail_count || 0), lockedUntil: row.locked_until };
}

async function recordFailure(db, key) {
  const current = await throttleState(db, key);
  const failCount = current.failCount + 1;
  const lockedUntil = failCount >= 5 ? futureIso(10 * 60 * 1000) : null;
  await db.prepare(`
    INSERT INTO auth_failures (scope_key, fail_count, locked_until, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(scope_key) DO UPDATE SET
      fail_count=excluded.fail_count,
      locked_until=excluded.locked_until,
      updated_at=CURRENT_TIMESTAMP
  `).bind(key, failCount, lockedUntil).run();
  return { failCount, lockedUntil };
}

async function clearFailures(db, key) {
  await db.prepare('DELETE FROM auth_failures WHERE scope_key=?').bind(key).run();
}

function clientKey(request, type, code) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  return `${type}:${code.toLowerCase()}:${ip}`;
}

async function getStudentState(db, studentId) {
  const student = await getStudentPublic(db, studentId);
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

async function guardianCanAccess(db, guardianId, studentId) {
  return !!(await db.prepare(`
    SELECT 1 AS ok FROM guardian_students WHERE guardian_id=? AND student_id=? LIMIT 1
  `).bind(guardianId, studentId).first());
}

async function getGuardianChildren(db, guardianId) {
  const result = await db.prepare(`
    SELECT
      s.id,
      s.student_code,
      s.name,
      gs.relationship,
      gs.role,
      COALESCE(st.xp, 0) AS xp,
      COALESCE(st.stars, 0) AS stars,
      COALESCE(st.streak, 1) AS streak,
      COALESCE(st.preferred_language, 'dual') AS preferred_language,
      (SELECT COUNT(*) FROM daily_progress dp WHERE dp.student_id=s.id AND dp.is_done=1) AS completed_tasks,
      (SELECT COUNT(*) FROM mistakes m WHERE m.student_id=s.id AND m.status='open') AS open_mistakes
    FROM guardian_students gs
    JOIN students s ON s.id=gs.student_id
    LEFT JOIN student_stats st ON st.student_id=s.id
    WHERE gs.guardian_id=?
    ORDER BY s.name COLLATE NOCASE
  `).bind(guardianId).all();

  return (result.results || []).map(row => ({
    id: row.id,
    studentId: row.student_code,
    name: row.name,
    relationship: row.relationship,
    role: row.role,
    stats: {
      xp: Number(row.xp || 0),
      stars: Number(row.stars || 0),
      streak: Number(row.streak || 1),
      preferredLanguage: row.preferred_language,
      completedTasks: Number(row.completed_tasks || 0),
      openMistakes: Number(row.open_mistakes || 0),
    },
  }));
}

function apiError(error) {
  const status = Number(error?.status || 500);
  return json({ ok: false, error: error instanceof Error ? error.message : String(error) }, status);
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
          schemaVersion: 2,
          tables: Number(result?.count || 0),
          time: nowIso(),
        });
      } catch (error) {
        return apiError(error);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        await ensureSchema(env.DB);

        if (url.pathname === '/api/auth/student-id-availability' && request.method === 'GET') {
          const code = normalizeStudentCode(url.searchParams.get('id'));
          if (!code) return json({ ok: true, valid: false, available: false, normalizedId: '', reason: 'Masukkan ID pelajar' });
          if (!validStudentCode(code)) {
            return json({ ok: true, valid: false, available: false, normalizedId: code, reason: 'Guna 3–20 aksara: huruf, nombor, - atau _' });
          }
          return json({ ok: true, valid: true, available: await isStudentCodeAvailable(env.DB, code), normalizedId: code });
        }

        if (url.pathname === '/api/auth/student/register' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const created = await createStudent(env.DB, { name: body.name, studentCode: body.studentId, pin: body.pin });
          const session = await createSession(env.DB, 'student', created.student.id);
          return json({ ok: true, ...created, ...session }, 201);
        }

        if (url.pathname === '/api/auth/student/login' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const code = normalizeStudentCode(body.studentId);
          const pin = String(body.pin ?? '');
          if (!validStudentCode(code) || !validPin(pin)) return json({ ok: false, error: 'ID atau PIN tidak sah' }, 400);

          const throttleKey = clientKey(request, 'student', code);
          const throttle = await throttleState(env.DB, throttleKey);
          if (throttle.locked) return json({ ok: false, error: 'Terlalu banyak cubaan. Cuba semula selepas 10 minit.', lockedUntil: throttle.lockedUntil }, 429);

          const row = await env.DB.prepare(`
            SELECT id, student_code, name, year_level, pin_hash, pin_salt
            FROM students WHERE student_code=? COLLATE NOCASE LIMIT 1
          `).bind(code).first();

          if (!row || !(await checkPin(pin, row.pin_salt, row.pin_hash))) {
            await recordFailure(env.DB, throttleKey);
            return json({ ok: false, error: 'ID atau PIN salah' }, 401);
          }

          await clearFailures(env.DB, throttleKey);
          const session = await createSession(env.DB, 'student', row.id);
          return json({
            ok: true,
            student: { id: row.id, name: row.name, studentId: row.student_code, yearLevel: row.year_level },
            ...session,
          });
        }

        if (url.pathname === '/api/auth/guardian/register' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const created = await createGuardian(env.DB, { name: body.name, pin: body.pin });
          const session = await createSession(env.DB, 'guardian', created.guardian.id);
          return json({ ok: true, ...created, ...session }, 201);
        }

        if (url.pathname === '/api/auth/guardian/login' && request.method === 'POST') {
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const parentCode = text(body.parentCode, 30).toUpperCase();
          const pin = String(body.pin ?? '');
          if (!parentCode || !validPin(pin)) return json({ ok: false, error: 'Parent Code atau PIN tidak sah' }, 400);

          const throttleKey = clientKey(request, 'guardian', parentCode);
          const throttle = await throttleState(env.DB, throttleKey);
          if (throttle.locked) return json({ ok: false, error: 'Terlalu banyak cubaan. Cuba semula selepas 10 minit.', lockedUntil: throttle.lockedUntil }, 429);

          const row = await env.DB.prepare(`
            SELECT id, parent_code, name, pin_hash, pin_salt
            FROM guardians WHERE parent_code=? COLLATE NOCASE LIMIT 1
          `).bind(parentCode).first();

          if (!row || !(await checkPin(pin, row.pin_salt, row.pin_hash))) {
            await recordFailure(env.DB, throttleKey);
            return json({ ok: false, error: 'Parent Code atau PIN salah' }, 401);
          }

          await clearFailures(env.DB, throttleKey);
          const session = await createSession(env.DB, 'guardian', row.id);
          return json({ ok: true, guardian: { id: row.id, name: row.name, parentCode: row.parent_code }, ...session });
        }

        if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
          const auth = await authorize(request, env.DB);
          await logoutSession(env.DB, auth.sessionId);
          return json({ ok: true });
        }

        if (url.pathname === '/api/me' && request.method === 'GET') {
          const auth = await authorize(request, env.DB);
          if (auth.actorType === 'student') {
            return json({ ok: true, actorType: 'student', student: await getStudentPublic(env.DB, auth.actorId) });
          }
          const guardian = await env.DB.prepare('SELECT id, parent_code, name FROM guardians WHERE id=?').bind(auth.actorId).first();
          return json({ ok: true, actorType: 'guardian', guardian: guardian ? { id: guardian.id, name: guardian.name, parentCode: guardian.parent_code } : null });
        }

        if (url.pathname === '/api/student/state' && request.method === 'GET') {
          const auth = await authorize(request, env.DB, 'student');
          return json({ ok: true, ...(await getStudentState(env.DB, auth.actorId)) });
        }

        if (url.pathname === '/api/student/progress' && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'student');
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
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
          `).bind(auth.actorId, dayNo, taskKey, isDone, isDone).run();
          return json({ ok: true });
        }

        if (url.pathname === '/api/student/quiz' && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'student');
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
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
          `).bind(auth.actorId, subject, topic || null, question, selectedAnswer || null, correctAnswer, isCorrect).run();

          if (!isCorrect) {
            await env.DB.prepare(`
              INSERT INTO mistakes (student_id, subject, topic, question, selected_answer, correct_answer)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(auth.actorId, subject, topic || null, question, selectedAnswer || null, correctAnswer).run();
          }

          const xpGain = isCorrect ? 10 : 2;
          await env.DB.prepare(`
            UPDATE student_stats
            SET xp=xp+?, stars=CAST((xp+?)/50 AS INTEGER), updated_at=CURRENT_TIMESTAMP
            WHERE student_id=?
          `).bind(xpGain, xpGain, auth.actorId).run();

          const stats = await env.DB.prepare('SELECT xp, stars, streak, preferred_language FROM student_stats WHERE student_id=?').bind(auth.actorId).first();
          return json({ ok: true, stats });
        }

        if (url.pathname === '/api/student/stats' && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'student');
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const lang = ['bm','en','dual'].includes(body.preferredLanguage) ? body.preferredLanguage : null;
          const streak = Number(body.streak);
          if (lang) await env.DB.prepare('UPDATE student_stats SET preferred_language=?, updated_at=CURRENT_TIMESTAMP WHERE student_id=?').bind(lang, auth.actorId).run();
          if (Number.isInteger(streak) && streak >= 1 && streak <= 999) await env.DB.prepare('UPDATE student_stats SET streak=?, updated_at=CURRENT_TIMESTAMP WHERE student_id=?').bind(streak, auth.actorId).run();
          return json({ ok: true });
        }

        const mastered = url.pathname.match(/^\/api\/student\/mistakes\/(\d+)\/mastered$/);
        if (mastered && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'student');
          const id = Number(mastered[1]);
          const result = await env.DB.prepare(`
            UPDATE mistakes SET status='mastered', mastered_at=CURRENT_TIMESTAMP
            WHERE id=? AND student_id=?
          `).bind(id, auth.actorId).run();
          return json({ ok: true, changed: Number(result.meta?.changes || 0) });
        }

        if (url.pathname === '/api/student/link-code' && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'student');
          await env.DB.prepare('DELETE FROM link_codes WHERE student_id=? AND (used_at IS NOT NULL OR expires_at <= ?)').bind(auth.actorId, nowIso()).run();

          let code;
          let codeHash;
          for (let i = 0; i < 8; i++) {
            code = randomDigits(6);
            codeHash = await sha256(code);
            const existing = await env.DB.prepare('SELECT id FROM link_codes WHERE code_hash=?').bind(codeHash).first();
            if (!existing) break;
          }
          const expiresAt = futureIso(10 * 60 * 1000);
          await env.DB.prepare(`
            INSERT INTO link_codes (student_id, code_hash, expires_at)
            VALUES (?, ?, ?)
          `).bind(auth.actorId, codeHash, expiresAt).run();
          return json({ ok: true, linkCode: code, expiresAt });
        }

        if (url.pathname === '/api/guardian/children' && request.method === 'GET') {
          const auth = await authorize(request, env.DB, 'guardian');
          return json({ ok: true, children: await getGuardianChildren(env.DB, auth.actorId) });
        }

        if (url.pathname === '/api/guardian/link' && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'guardian');
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const linkCode = String(body.linkCode ?? '').trim();
          if (!/^\d{6}$/.test(linkCode)) return json({ ok: false, error: 'Kod pautan mesti 6 digit' }, 400);
          const codeHash = await sha256(linkCode);
          const link = await env.DB.prepare(`
            SELECT id, student_id FROM link_codes
            WHERE code_hash=? AND used_at IS NULL AND expires_at > ?
            LIMIT 1
          `).bind(codeHash, nowIso()).first();
          if (!link) return json({ ok: false, error: 'Kod pautan tidak sah atau telah tamat' }, 404);

          const relationship = text(body.relationship, 30) || 'guardian';
          await env.DB.prepare(`
            INSERT INTO guardian_students (guardian_id, student_id, relationship, role)
            VALUES (?, ?, ?, 'owner')
            ON CONFLICT(guardian_id, student_id) DO UPDATE SET relationship=excluded.relationship
          `).bind(auth.actorId, link.student_id, relationship).run();
          await env.DB.prepare('UPDATE link_codes SET used_at=CURRENT_TIMESTAMP WHERE id=?').bind(link.id).run();
          return json({ ok: true, student: await getStudentPublic(env.DB, link.student_id) });
        }

        if (url.pathname === '/api/guardian/children/register' && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'guardian');
          const body = await bodyJson(request);
          if (!body) return json({ ok: false, error: 'Invalid JSON' }, 400);
          const created = await createStudent(env.DB, { name: body.name, studentCode: body.studentId, pin: body.pin });
          await env.DB.prepare(`
            INSERT INTO guardian_students (guardian_id, student_id, relationship, role)
            VALUES (?, ?, ?, 'owner')
          `).bind(auth.actorId, created.student.id, text(body.relationship, 30) || 'anak').run();
          return json({ ok: true, ...created }, 201);
        }

        const resetPin = url.pathname.match(/^\/api\/guardian\/children\/([^/]+)\/reset-pin$/);
        if (resetPin && request.method === 'POST') {
          const auth = await authorize(request, env.DB, 'guardian');
          const studentId = decodeURIComponent(resetPin[1]);
          if (!(await guardianCanAccess(env.DB, auth.actorId, studentId))) return json({ ok: false, error: 'Anak tidak dipautkan kepada akaun ini' }, 403);
          const body = await bodyJson(request);
          const pin = String(body?.pin ?? '');
          if (!validPin(pin)) return json({ ok: false, error: 'PIN mesti 6 digit nombor' }, 400);
          const pinRecord = await makePinRecord(pin);
          await env.DB.prepare(`
            UPDATE students SET pin_hash=?, pin_salt=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
          `).bind(pinRecord.hash, pinRecord.salt, studentId).run();
          await env.DB.prepare(`
            UPDATE sessions SET revoked_at=CURRENT_TIMESTAMP
            WHERE actor_type='student' AND actor_id=? AND revoked_at IS NULL
          `).bind(studentId).run();
          return json({ ok: true });
        }

        const unlink = url.pathname.match(/^\/api\/guardian\/children\/([^/]+)$/);
        if (unlink && request.method === 'DELETE') {
          const auth = await authorize(request, env.DB, 'guardian');
          const studentId = decodeURIComponent(unlink[1]);
          const result = await env.DB.prepare(`
            DELETE FROM guardian_students WHERE guardian_id=? AND student_id=?
          `).bind(auth.actorId, studentId).run();
          return json({ ok: true, changed: Number(result.meta?.changes || 0) });
        }

        return json({ ok: false, error: 'API route not found' }, 404);
      } catch (error) {
        return apiError(error);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
