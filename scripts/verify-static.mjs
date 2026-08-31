import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('src/index.js', 'utf8');
const schema = fs.readFileSync('db/schema.sql', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');
const learning = fs.readFileSync('learning-content.js', 'utf8');

function must(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

const inline = index.match(/<script>([\s\S]*?)<\/script>/);
if (!inline) throw new Error('index.html inline script not found');
new Function(inline[1]);
new Function(learning);

must(index, 'Nama pelajar', 'student name field');
must(index, 'ID pelajar', 'student id field');
must(index, '6 digit number', 'PIN helper note');
must(index, '/api/auth/student-id-availability', 'ID availability frontend call');
must(index, 'Siapa yang belajar sekarang?', 'shared-device profile chooser');
must(index, 'Parent Area', 'Parent Area UI');
must(index, 'function startMission()', 'Day mission launcher');
must(index, 'function startTaskModule(', 'task module launcher');
must(index, 'function saveTaskProgress(', 'task progress persistence helper');
must(index, 'function renderRewards()', 'dynamic rewards renderer');
must(index, "window.scrollTo({top:0", 'screen navigation scroll reset');
must(index, 'id="missionContext"', 'learning module context UI');
must(index, '/learning-content.js', 'structured learning content script');
must(index, 'function renderLearningModules()', 'structured module renderer');
must(index, 'function openLearningModule(', 'structured module launcher');
must(index, 'module-${m.id}', 'D1-backed structured module progress key');
must(index, 'if(resultClass)b.classList.add(resultClass)', 'safe quiz answer result class handling');

must(learning, 'window.MATRIX_LEARNING=', 'structured learning content root');
must(learning, "version:'2026-08-30-source-modules-v1'", 'learning content version');
for (let day = 1; day <= 8; day++) {
  must(learning, `${day}:{theme:`, `Day ${day} learning definition`);
}
for (const id of [
  'd1-math-diagnostic',
  'd2-math-number',
  'd3-science-skills',
  'd4-problem-solving',
  'd5-science-humans',
  'd6-stem',
  'd7-red-math',
  'd8-mini-math',
  'd8-mini-science',
  'd8-red-plan'
]) {
  must(learning, `id:'${id}'`, `learning module ${id}`);
}
must(learning, "green:{min:80", 'green mastery threshold');
must(learning, "yellow:{min:60", 'yellow mastery threshold');
must(learning, "red:{min:0", 'red mastery threshold');

must(worker, '/api/auth/student/register', 'student registration route');
must(worker, '/api/auth/student/login', 'student login route');
must(worker, '/api/auth/guardian/register', 'guardian registration route');
must(worker, '/api/guardian/link', 'guardian link route');

const pbkdf2Iterations = [...worker.matchAll(/iterations:\s*(\d+)/g)].map(match => Number(match[1]));
if (!pbkdf2Iterations.length) throw new Error('PBKDF2 iteration count not found');
if (pbkdf2Iterations.some(value => value > 100000)) {
  throw new Error(`Cloudflare Workers PBKDF2 limit exceeded: ${pbkdf2Iterations.join(', ')}`);
}
if (!pbkdf2Iterations.includes(100000)) {
  throw new Error(`Expected PBKDF2 work factor 100000, found: ${pbkdf2Iterations.join(', ')}`);
}

must(worker, "schemaVersion: 2", 'schema version');

for (const table of ['guardians', 'guardian_students', 'sessions', 'link_codes', 'auth_failures']) {
  must(schema, `CREATE TABLE IF NOT EXISTS ${table}`, `${table} table`);
}

must(schema, 'student_code TEXT UNIQUE COLLATE NOCASE', 'chosen public student ID schema');
must(sw, "url.pathname.startsWith('/api/')", 'API cache bypass');

console.log('Static verification passed: auth, structured Day 1-8 learning modules, Cloudflare-compatible PBKDF2, schema and service-worker guards are present.');
