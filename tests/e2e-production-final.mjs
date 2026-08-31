import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'https://school.0com.my';
const suffix = Date.now().toString(36).slice(-7);
const studentId = `e2ef${suffix}`.toLowerCase();
const childId = `e2efc${suffix}`.toLowerCase();
const studentPin = '731946';
const resetPin = '739146';
const childPin = '842751';
const parentPin = '654321';

const results = [];
const unexpectedApiErrors = [];
const pageErrors = [];
let browser, page;

async function step(name, fn) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - start });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false, ms: Date.now() - start, error: String(error?.stack || error) });
    console.error(`✗ ${name}\n${error?.stack || error}`);
    try { await page?.screenshot({ path: 'e2e-final-failure.png', fullPage: true }); } catch {}
    throw error;
  }
}

async function waitToast(text) {
  await page.waitForFunction(expected => {
    const el = document.getElementById('toast');
    return !!el && el.classList.contains('show') && (!expected || (el.textContent || '').includes(expected));
  }, text || '', { timeout: 30000 });
}

async function nav(screen) {
  await page.locator(`.nav button[data-screen="${screen}"]`).click();
  await page.locator(`#screen-${screen}.active`).waitFor({ state: 'visible', timeout: 5000 });
}

async function waitStudentApp() {
  await page.locator('#studentApp:not(.hidden)').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#screen-home.active').waitFor({ state: 'visible', timeout: 5000 });
}

async function clickAndWaitApi(locator, pathname, method = 'POST') {
  const responsePromise = page.waitForResponse(r => {
    try {
      const u = new URL(r.url());
      return u.pathname === pathname && r.request().method() === method;
    } catch { return false; }
  }, { timeout: 15000 });
  await locator.click();
  const response = await responsePromise;
  if (!response.ok()) throw new Error(`${method} ${pathname} returned HTTP ${response.status()}`);
  return response;
}

async function registerStudent() {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#regName').fill('E2E Final Pelajar');
  await page.locator('#regStudentId').fill(studentId);
  await page.locator('#regPin').fill(studentPin);
  await page.locator('#regIdStatus.success').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#regSubmit').click();
  await waitStudentApp();
}

async function testAllTaskButtonsAndCheckboxes() {
  for (let day = 1; day <= 8; day++) {
    await nav('home');
    await page.locator('#days .day').nth(day - 1).click();
    const count = await page.locator('#tasks .task-open').count();
    if (!count) throw new Error(`Day ${day}: no Buka/Ulang buttons`);
    console.log(`  Day ${day}: ${count} task buttons`);

    for (let i = 0; i < count; i++) {
      await page.locator('#tasks .task-open').nth(i).click();
      await page.locator('#screen-learn.active').waitFor({ state: 'visible', timeout: 5000 });
      const content = ((await page.locator('#quizQuestion').textContent()) || '').trim();
      if (!content) throw new Error(`Day ${day} task button ${i + 1} opened blank content`);
      await nav('home');
      await page.locator('#days .day').nth(day - 1).click();
    }

    const checkbox = page.locator('#tasks input[type="checkbox"]').first();
    const before = await checkbox.isChecked();
    const responsePromise = page.waitForResponse(r => {
      try { return new URL(r.url()).pathname === '/api/student/progress' && r.request().method() === 'POST'; }
      catch { return false; }
    }, { timeout: 15000 });
    await checkbox.click();
    const response = await responsePromise;
    if (!response.ok()) throw new Error(`Day ${day} checkbox API returned ${response.status()}`);
    const expected = !before;
    await page.waitForFunction(({ day, expected }) => {
      const current = eval('currentDay');
      if (current !== day) return false;
      const el = document.querySelector('#tasks input[type="checkbox"]');
      return !!el && el.checked === expected;
    }, { day, expected }, { timeout: 5000 });

    const cloudState = await page.evaluate(({ day, expected }) => {
      const p = eval('state.progress').find(x => Number(x.day_no) === day && x.task_key === `d${day}-t0`);
      return { currentDay: eval('currentDay'), checked: document.querySelector('#tasks input[type="checkbox"]')?.checked, progress: p, expected };
    }, { day, expected });
    if (!cloudState.progress || Number(cloudState.progress.is_done) !== (expected ? 1 : 0)) {
      throw new Error(`Day ${day} checkbox local cloud-state mismatch: ${JSON.stringify(cloudState)}`);
    }
  }
}

async function main() {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', locale: 'ms-MY' });
  page = await context.newPage();
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('response', r => {
    if (r.url().includes('/api/') && r.status() >= 500) unexpectedApiErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`);
  });

  await step('Register fresh production learner', registerStudent);

  await step('Every Day 1-8 task Buka/Ulang button and checklist toggle works', testAllTaskButtonsAndCheckboxes);

  await step('All 4 Quick Start buttons load practice', async () => {
    await nav('home');
    const buttons = page.locator('#subjects button');
    if (await buttons.count() !== 4) throw new Error('Expected 4 Quick Start buttons');
    for (let i = 0; i < 4; i++) {
      await page.locator('#subjects button').nth(i).click();
      await page.locator('#screen-learn.active').waitFor({ state: 'visible' });
      if (!((await page.locator('#quizQuestion').textContent()) || '').trim()) throw new Error(`Quick Start ${i + 1} blank`);
      await nav('home');
    }
  });

  await step('All 4 Math/Science/BM/English practice buttons respond', async () => {
    await nav('learn');
    const buttons = page.locator('#screen-learn .panel').last().locator(':scope > div:last-child button');
    if (await buttons.count() !== 4) throw new Error(`Expected 4 practice buttons, got ${await buttons.count()}`);
    for (let i = 0; i < 4; i++) {
      await buttons.nth(i).click();
      if (!((await page.locator('#quizQuestion').textContent()) || '').trim()) throw new Error(`Practice ${i + 1} blank`);
    }
  });

  await step('BM / EN / Dwi and Tukar bahasa buttons persist', async () => {
    await nav('learn');
    for (const [label, expected] of [['EN', 'English'], ['BM', 'Bahasa Melayu'], ['Dwi', 'Dwi Bahasa']]) {
      const responsePromise = page.waitForResponse(r => new URL(r.url()).pathname === '/api/student/stats' && r.request().method() === 'POST');
      await page.getByRole('button', { name: label, exact: true }).click();
      if (!(await responsePromise).ok()) throw new Error(`${label} language API failed`);
      await nav('profile');
      if ((await page.locator('#langSetting').textContent())?.trim() !== expected) throw new Error(`${label} did not persist`);
      await nav('learn');
    }
    await nav('profile');
    const before = (await page.locator('#langSetting').textContent())?.trim();
    const responsePromise = page.waitForResponse(r => new URL(r.url()).pathname === '/api/student/stats' && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Tukar bahasa', exact: true }).click();
    if (!(await responsePromise).ok()) throw new Error('Tukar bahasa API failed');
    const after = (await page.locator('#langSetting').textContent())?.trim();
    if (!after || after === before) throw new Error('Tukar bahasa did not change value');
  });

  await step('Correct answer gives immediate feedback, advances, adds XP and completes active module', async () => {
    await nav('home');
    await page.locator('#days .day').first().click();
    await nav('learn');
    const firstModule = page.locator('#learningModules button').first();
    await firstModule.click();
    const correct = await page.evaluate(() => eval('currentQuiz.q.c'));
    const questionBefore = (await page.locator('#quizQuestion').textContent())?.trim();
    const xpBefore = Number((await page.locator('#xp').textContent()) || 0);
    await page.locator('#answers button').nth(correct).click();
    await waitToast('Bagus! +10 XP');
    await page.waitForFunction(previous => document.querySelector('#quizQuestion')?.textContent?.trim() !== previous, questionBefore, { timeout: 5000 });
    await page.waitForFunction(before => Number(document.querySelector('#xp')?.textContent || 0) > before, xpBefore, { timeout: 30000 });
    await nav('home');
    const xpAfter = Number((await page.locator('#xp').textContent()) || 0);
    if (!(xpAfter > xpBefore)) throw new Error(`XP did not increase: ${xpBefore} -> ${xpAfter}`);
    await nav('learn');
    const firstCard = page.locator('#learningModules .learning-card').first();
    if (!(await firstCard.evaluate(el => el.classList.contains('done')))) throw new Error('Correct answer did not mark module done');
  });

  await step('First wrong answer retries; second wrong enters Buku Silap and can be mastered', async () => {
    await nav('learn');
    await page.evaluate(() => eval("activeLearningModule=null;currentTask=null;newQuestion('Math')"));
    const count = await page.locator('#answers button').count();
    const correct = await page.evaluate(() => eval('currentQuiz.q.c'));
    const wrong = (correct + 1) % count;
    const questionBefore = (await page.locator('#quizQuestion').textContent())?.trim();
    await page.locator('#answers button').nth(wrong).click();
    await waitToast('Cuba sekali lagi');
    await page.waitForTimeout(1100);
    const questionAfterRetry = (await page.locator('#quizQuestion').textContent())?.trim();
    if (questionAfterRetry !== questionBefore) throw new Error('First wrong answer unexpectedly advanced the question');
    await page.locator('#answers button').nth(wrong).click();
    await waitToast('Belum tepat');
    await page.waitForTimeout(1600);
    await nav('mistakes');
    const card = page.locator('#mistakeList .child-card').first();
    await card.waitFor({ state: 'visible', timeout: 30000 });
    await card.getByRole('button', { name: /Saya dah faham/ }).click();
    await waitToast('mastered');
  });

  await step('Rewards page renders all 4 badges', async () => {
    await nav('rewards');
    if (await page.locator('#badgeList p').count() !== 4) throw new Error('Expected 4 badges');
  });

  let linkCode = '';
  await step('Jana Link Code, Import progress lama, and Buang-from-device cancel work', async () => {
    await nav('profile');
    await page.getByRole('button', { name: /Jana 6-digit Link Code/ }).click();
    await page.locator('#linkCodeBox .code-box').waitFor({ state: 'visible', timeout: 5000 });
    linkCode = ((await page.locator('#linkCodeBox .code-box').textContent()) || '').trim();
    if (!/^\d{6}$/.test(linkCode)) throw new Error(`Bad Link Code ${linkCode}`);

    await page.getByRole('button', { name: 'Import progress lama', exact: true }).click();
    await waitToast('Tiada progress');

    page.once('dialog', d => d.dismiss());
    await page.getByRole('button', { name: 'Buang dari device ini', exact: true }).click();
    await page.locator('#studentApp:not(.hidden)').waitFor({ state: 'visible' });
  });

  await step('Tukar Pelajar and remembered learner card work', async () => {
    await nav('home');
    await page.getByRole('button', { name: /Tukar Pelajar/ }).first().click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
    const card = page.locator('#studentProfiles .profile-card').filter({ hasText: `@${studentId}` });
    await card.click();
    await page.locator('#studentLoginForm:not(.hidden)').waitFor({ state: 'visible' });
    if ((await page.locator('#loginStudentId').inputValue()) !== studentId) throw new Error('Remembered learner did not prefill ID');
  });

  await step('Duplicate Student ID availability blocks duplicate registration', async () => {
    await page.locator('#tabStudentRegister').click();
    await page.locator('#regName').fill('Duplicate');
    await page.locator('#regStudentId').fill(studentId);
    await page.locator('#regPin').fill(studentPin);
    await page.locator('#regIdStatus.error').waitFor({ state: 'visible', timeout: 10000 });
    if (!(await page.locator('#regSubmit').isDisabled())) throw new Error('Duplicate ID submit remained enabled');
  });

  let parentCode = '';
  await step('Daftar Parent Area button creates guardian', async () => {
    await page.locator('#tabParentRegister').click();
    await page.locator('#guardianName').fill('E2E Final Parent');
    await page.locator('#guardianPin').fill(parentPin);
    await page.getByRole('button', { name: 'Daftar Parent Area', exact: true }).click();
    await page.locator('#parentApp:not(.hidden)').waitFor({ state: 'visible', timeout: 15000 });
    parentCode = ((await page.locator('#parentCode').textContent()) || '').trim();
    if (!parentCode) throw new Error('Parent code missing');
  });

  await step('Pautkan anak links existing learner', async () => {
    await page.locator('#parentLinkCode').fill(linkCode);
    await page.locator('#parentRelationship').fill('anak');
    await page.getByRole('button', { name: 'Pautkan anak', exact: true }).click();
    await page.locator('#parentChildren .child-card').filter({ hasText: `@${studentId}` }).waitFor({ state: 'visible', timeout: 10000 });
  });

  await step('Simpan profil pada device button works', async () => {
    const card = page.locator('#parentChildren .child-card').filter({ hasText: `@${studentId}` });
    await card.getByRole('button', { name: 'Simpan profil pada device', exact: true }).click();
    await waitToast('Profil disimpan');
  });

  await step('Reset PIN button works', async () => {
    const card = page.locator('#parentChildren .child-card').filter({ hasText: `@${studentId}` });
    page.once('dialog', d => d.accept(resetPin));
    await card.getByRole('button', { name: 'Reset PIN', exact: true }).click();
    await waitToast('PIN berjaya direset');
  });

  await step('Unlink button removes guardian access', async () => {
    const card = page.locator('#parentChildren .child-card').filter({ hasText: `@${studentId}` });
    page.once('dialog', d => d.accept());
    await card.getByRole('button', { name: 'Unlink', exact: true }).click();
    await waitToast('Akses parent diputuskan');
    await page.waitForFunction(id => ![...document.querySelectorAll('#parentChildren .child-card')].some(el => (el.textContent || '').includes('@' + id)), studentId, { timeout: 5000 });
  });

  await step('Parent Daftar & pautkan button creates and links new child', async () => {
    await page.locator('#parentChildName').fill('E2E Final Child');
    await page.locator('#parentChildId').fill(childId);
    await page.locator('#parentChildPin').fill(childPin);
    await page.locator('#parentChildIdStatus.success').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#parentChildSubmit').click();
    await page.locator('#parentChildren .child-card').filter({ hasText: `@${childId}` }).waitFor({ state: 'visible', timeout: 30000 });
  });

  await step('Parent Keluar/Tukar User, remembered parent card, and parent login work', async () => {
    await page.getByRole('button', { name: 'Keluar / Tukar User', exact: true }).click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
    const card = page.locator('#guardianProfiles .profile-card').filter({ hasText: parentCode });
    await card.click();
    await page.locator('#guardianLoginForm:not(.hidden)').waitFor({ state: 'visible' });
    if ((await page.locator('#parentCodeLogin').inputValue()) !== parentCode) throw new Error('Remembered parent did not prefill code');
    await page.locator('#parentPinLogin').fill(parentPin);
    await page.getByRole('button', { name: 'Masuk Parent Area', exact: true }).click();
    await page.locator('#parentApp:not(.hidden)').waitFor({ state: 'visible', timeout: 10000 });
  });

  await step('Learner login works with parent-reset PIN', async () => {
    await page.getByRole('button', { name: 'Keluar / Tukar User', exact: true }).click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
    const card = page.locator('#studentProfiles .profile-card').filter({ hasText: `@${studentId}` });
    await card.click();
    await page.locator('#loginPin').fill(resetPin);
    await page.locator('#studentLoginForm').getByRole('button', { name: 'Log masuk', exact: true }).click();
    await waitStudentApp();
  });

  await step('Profile Tukar Pelajar button works', async () => {
    await nav('profile');
    await page.getByRole('button', { name: /Tukar Pelajar/ }).click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
  });

  await step('Remembered profile × remove buttons work', async () => {
    const sBefore = await page.locator('#studentProfiles .profile-card').count();
    if (sBefore) {
      await page.locator('#studentProfiles .profile-card').last().locator('.profile-remove').click();
      await page.waitForFunction(before => document.querySelectorAll('#studentProfiles .profile-card').length === before - 1, sBefore, { timeout: 3000 });
    }
    const pBefore = await page.locator('#guardianProfiles .profile-card').count();
    if (pBefore) {
      await page.locator('#guardianProfiles .profile-card').last().locator('.profile-remove').click();
      await page.waitForFunction(before => document.querySelectorAll('#guardianProfiles .profile-card').length === before - 1, pBefore, { timeout: 3000 });
    }
  });

  if (pageErrors.length) throw new Error(`Page errors: ${pageErrors.join(' | ')}`);
  if (unexpectedApiErrors.length) throw new Error(`Unexpected 5xx APIs: ${unexpectedApiErrors.join(' | ')}`);

  console.log('\n=== FINAL INTERACTION SUMMARY ===');
  for (const r of results) console.log(`PASS ${r.name} (${r.ms}ms)`);
  console.log(`PASS ${results.length}/${results.length} test groups`);
  console.log(`Isolated test learner: ${studentId}; child: ${childId}`);
  await browser.close();
}

main().catch(async error => {
  console.error('\nFINAL E2E FAILED:', error?.stack || error);
  console.error('\nPartial results:');
  for (const r of results) console.error(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}`);
  try { await browser?.close(); } catch {}
  process.exit(1);
});
