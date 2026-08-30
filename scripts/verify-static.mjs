import fs from 'node:fs';

const index = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('src/index.js', 'utf8');
const schema = fs.readFileSync('db/schema.sql', 'utf8');
const sw = fs.readFileSync('sw.js', 'utf8');

function must(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

const inline = index.match(/<script>([\s\S]*?)<\/script>/);
if (!inline) throw new Error('index.html inline script not found');
new Function(inline[1]);

must(index, 'Nama pelajar', 'student name field');
must(index, 'ID pelajar', 'student id field');
must(index, '6 digit number', 'PIN helper note');
must(index, '/api/auth/student-id-availability', 'ID availability frontend call');
must(index, 'Siapa yang belajar sekarang?', 'shared-device profile chooser');
must(index, 'Parent Area', 'Parent Area UI');

must(worker, '/api/auth/student/register', 'student registration route');
must(worker, '/api/auth/student/login', 'student login route');
must(worker, '/api/auth/guardian/register', 'guardian registration route');
must(worker, '/api/guardian/link', 'guardian link route');
must(worker, "iterations: 120000", 'PBKDF2 work factor');
must(worker, "schemaVersion: 2", 'schema version');

for (const table of ['guardians', 'guardian_students', 'sessions', 'link_codes', 'auth_failures']) {
  must(schema, `CREATE TABLE IF NOT EXISTS ${table}`, `${table} table`);
}

must(schema, 'student_code TEXT UNIQUE COLLATE NOCASE', 'chosen public student ID schema');
must(sw, "url.pathname.startsWith('/api/')", 'API cache bypass');

console.log('Static verification passed: auth UI, routes, schema and service-worker guards are present.');
