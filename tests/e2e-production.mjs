import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'https://school.0com.my';
const suffix = Date.now().toString(36).slice(-7);
const studentId = `e2e${suffix}`.toLowerCase();
const childId = `e2ec${suffix}`.toLowerCase();
const studentPin = '731946';
const resetPin = '739146';
const childPin = '842751';
const parentPin = '654321';

const results = [];
const apiErrors = [];
const pageErrors = [];
let browser;
let page;

async function step(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - started });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false, ms: Date.now() - started, error: String(error?.stack || error) });
    console.error(`✗ ${name}\n${error?.stack || error}`);
    try { await page?.screenshot({ path: 'e2e-failure.png', fullPage: true }); } catch {}
    throw error;
  }
}

async function waitApp() {
  await page.locator('#studentApp:not(.hidden)').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#screen-home.active').waitFor({ state: 'visible', timeout: 10000 });
}

async function nav(screen) {
  await page.locator(`.nav button[data-screen="${screen}"]`).click();
  await page.locator(`#screen-${screen}.active`).waitFor({ state: 'visible' });
}

async function waitToast(text) {
  const toast = page.locator('#toast');
  await toast.waitFor({ state: 'visible', timeout: 10000 });
  if (text) {
    const value = (await toast.textContent()) || '';
    if (!value.includes(text)) throw new Error(`Toast mismatch. Expected ${text}, got ${value}`);
  }
}

async function answerKnownWrong() {
  const count = await page.locator('#answers button').count();
  if (!count) throw new Error('No answer buttons available');
  const correct = await page.evaluate(() => eval('currentQuiz?.q?.c'));
  if (!Number.isInteger(correct)) throw new Error('Could not inspect current quiz answer index');
  const wrong = (correct + 1) % count;
  await page.locator('#answers button').nth(wrong).click();
  await waitToast('Belum tepat');
  await page.waitForTimeout(1400);
}

async function exerciseAllStructuredModules() {
  for (let day = 1; day <= 8; day++) {
    await nav('home');
    const dayButton = page.locator('#days .day').nth(day - 1);
    await dayButton.click();
    const selected = await page.locator('#learningDayNo').textContent();
    if (selected?.trim() !== String(day)) throw new Error(`Day selector ${day} did not update learningDayNo`);

    await nav('learn');
    const moduleButtons = page.locator('#learningModules button');
    const moduleCount = await moduleButtons.count();
    if (moduleCount < 1) throw new Error(`Day ${day} has no structured module buttons`);
    console.log(`  Day ${day}: ${moduleCount} structured modules`);

    for (let i = 0; i < moduleCount; i++) {
      const button = page.locator('#learningModules button').nth(i);
      await button.scrollIntoViewIfNeeded();
      await button.click();
      await page.locator('#screen-learn.active').waitFor({ state: 'visible' });
      const question = ((await page.locator('#quizQuestion').textContent()) || '').trim();
      if (!question) throw new Error(`Day ${day} module ${i + 1} opened with empty learning content`);

      const answerButtons = page.locator('#answers button');
      if (await answerButtons.count()) {
        await answerButtons.first().click();
        await page.waitForTimeout(1500);
      }
    }
  }
}

async function exerciseDayTaskButtons() {
  for (let day = 1; day <= 8; day++) {
    await nav('home');
    await page.locator('#days .day').nth(day - 1).click();
    const opens = page.locator('#tasks .task-open');
    const count = await opens.count();
    if (!count) throw new Error(`Day ${day} has no task open buttons`);
    for (let i = 0; i < count; i++) {
      await page.locator('#tasks .task-open').nth(i).click();
      await page.locator('#screen-learn.active').waitFor({ state: 'visible' });
      await nav('home');
      await page.locator('#days .day').nth(day - 1).click();
    }

    const checkbox = page.locator('#tasks input[type="checkbox"]').first();
    if (await checkbox.count()) {
      const before = await checkbox.isChecked();
      await checkbox.click();
      await page.waitForTimeout(500);
      const after = await page.locator('#tasks input[type="checkbox"]').first().isChecked();
      if (before === after) throw new Error(`Day ${day} checkbox did not change`);
    }
  }
}

async function main() {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
    locale: 'ms-MY'
  });
  page = await context.newPage();
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('response', r => {
    if (r.url().includes('/api/') && r.status() >= 400) apiErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`);
  });

  await step('Production page loads and gate is visible', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
    await page.getByText('MATRIX Tahun 4', { exact: true }).first().waitFor();
  });

  await step('Student and Parent gate tabs switch correctly', async () => {
    await page.locator('#tabStudentLogin').click();
    await page.locator('#studentLoginForm:not(.hidden)').waitFor({ state: 'visible' });
    await page.locator('#tabStudentRegister').click();
    await page.locator('#studentRegisterForm:not(.hidden)').waitFor({ state: 'visible' });
    await page.locator('#tabParentLogin').click();
    await page.locator('#guardianLoginForm:not(.hidden)').waitFor({ state: 'visible' });
    await page.locator('#tabParentRegister').click();
    await page.locator('#guardianRegisterForm:not(.hidden)').waitFor({ state: 'visible' });
  });

  await step('Student ID availability auto-check and registration work', async () => {
    await page.locator('#regName').fill('E2E Pelajar');
    await page.locator('#regStudentId').fill(studentId);
    await page.locator('#regPin').fill(studentPin);
    await page.locator('#regIdStatus.success').waitFor({ state: 'visible', timeout: 10000 });
    if (await page.locator('#regSubmit').isDisabled()) throw new Error('Register button remained disabled after available ID');
    await page.locator('#regSubmit').click();
    await waitApp();
  });

  await step('All five student navigation buttons work', async () => {
    for (const screen of ['learn', 'mistakes', 'rewards', 'profile', 'home']) await nav(screen);
  });

  await step('Mula Misi Day Ini opens a learning module', async () => {
    await nav('home');
    await page.getByRole('button', { name: /Mula Misi Day Ini/ }).click();
    await page.locator('#screen-learn.active').waitFor({ state: 'visible' });
    await page.locator('#missionContext:not(.hidden)').waitFor({ state: 'visible' });
  });

  await step('Every Day 1-8 structured module button opens and its main interaction responds', async () => {
    await exerciseAllStructuredModules();
  });

  await step('Every Day 1-8 task Buka/Ulang button works and checklist can toggle', async () => {
    await exerciseDayTaskButtons();
  });

  await step('All four Quick Start buttons work', async () => {
    await nav('home');
    const quick = page.locator('#subjects button');
    if (await quick.count() !== 4) throw new Error('Expected four Quick Start buttons');
    for (let i = 0; i < 4; i++) {
      await page.locator('#subjects button').nth(i).click();
      await page.locator('#screen-learn.active').waitFor({ state: 'visible' });
      if (!((await page.locator('#quizQuestion').textContent()) || '').trim()) throw new Error(`Quick Start ${i + 1} did not load question`);
      await nav('home');
    }
  });

  await step('All four learning quick-subject buttons work', async () => {
    await nav('learn');
    const buttons = page.locator('#screen-learn .panel').last().locator(':scope > div:last-child button');
    if (await buttons.count() !== 4) throw new Error(`Expected 4 subject buttons, got ${await buttons.count()}`);
    for (let i = 0; i < 4; i++) {
      await buttons.nth(i).click();
      if (!((await page.locator('#quizQuestion').textContent()) || '').trim()) throw new Error(`Learning subject button ${i + 1} failed`);
    }
  });

  await step('BM, EN and Dwi language buttons persist', async () => {
    await nav('learn');
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await page.waitForTimeout(400);
    await nav('profile');
    if ((await page.locator('#langSetting').textContent())?.trim() !== 'English') throw new Error('EN did not persist');
    await nav('learn');
    await page.getByRole('button', { name: 'BM', exact: true }).click();
    await page.waitForTimeout(400);
    await nav('profile');
    if ((await page.locator('#langSetting').textContent())?.trim() !== 'Bahasa Melayu') throw new Error('BM did not persist');
    await nav('learn');
    await page.getByRole('button', { name: 'Dwi', exact: true }).click();
    await page.waitForTimeout(400);
    await nav('profile');
    if ((await page.locator('#langSetting').textContent())?.trim() !== 'Dwi Bahasa') throw new Error('Dwi did not persist');
  });

  await step('Profile Tukar bahasa button works', async () => {
    await nav('profile');
    const before = (await page.locator('#langSetting').textContent())?.trim();
    await page.getByRole('button', { name: 'Tukar bahasa', exact: true }).click();
    await page.waitForTimeout(400);
    const after = (await page.locator('#langSetting').textContent())?.trim();
    if (!after || after === before) throw new Error('Cycle language did not change setting');
  });

  await step('Wrong answer enters Buku Silap and mastered button works', async () => {
    await nav('learn');
    await page.evaluate(() => { eval("activeLearningModule=null;currentTask=null;newQuestion('Math')"); });
    await answerKnownWrong();
    await nav('mistakes');
    const cards = page.locator('#mistakeList .child-card');
    if (await cards.count() < 1) throw new Error('Wrong answer did not create open mistake');
    const master = cards.first().getByRole('button', { name: /Saya dah faham/ });
    await master.click();
    await waitToast('mastered');
    await page.waitForTimeout(500);
  });

  await step('Rewards screen renders dynamic badge states', async () => {
    await nav('rewards');
    if (await page.locator('#badgeList p').count() !== 4) throw new Error('Expected four reward badges');
  });

  let linkCode;
  await step('Generate 6-digit Link Code button works', async () => {
    await nav('profile');
    await page.getByRole('button', { name: /Jana 6-digit Link Code/ }).click();
    await page.locator('#linkCodeBox .code-box').waitFor({ state: 'visible', timeout: 10000 });
    linkCode = ((await page.locator('#linkCodeBox .code-box').textContent()) || '').trim();
    if (!/^\d{6}$/.test(linkCode)) throw new Error(`Invalid link code: ${linkCode}`);
  });

  await step('Import progress lama button handles empty legacy state safely', async () => {
    await nav('profile');
    await page.getByRole('button', { name: 'Import progress lama', exact: true }).click();
    await waitToast('Tiada progress');
  });

  await step('Buang dari device ini confirmation can be cancelled safely', async () => {
    await nav('profile');
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Buang dari device ini', exact: true }).click();
    await page.waitForTimeout(250);
    await page.locator('#studentApp:not(.hidden)').waitFor({ state: 'visible' });
  });

  await step('Tukar Pelajar returns to gate and remembered profile card opens login', async () => {
    await nav('home');
    await page.getByRole('button', { name: /Tukar Pelajar/ }).first().click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
    const card = page.locator('#studentProfiles .profile-card').filter({ hasText: `@${studentId}` });
    await card.click();
    await page.locator('#studentLoginForm:not(.hidden)').waitFor({ state: 'visible' });
    if ((await page.locator('#loginStudentId').inputValue()) !== studentId) throw new Error('Remembered student card did not prefill Student ID');
  });

  await step('Duplicate Student ID is rejected by availability check', async () => {
    await page.locator('#tabStudentRegister').click();
    await page.locator('#regName').fill('Duplicate Test');
    await page.locator('#regStudentId').fill(studentId);
    await page.locator('#regPin').fill(studentPin);
    await page.locator('#regIdStatus.error').waitFor({ state: 'visible', timeout: 10000 });
    if (!(await page.locator('#regSubmit').isDisabled())) throw new Error('Duplicate ID register button should be disabled');
  });

  let parentCode;
  await step('Parent registration button creates Parent Area', async () => {
    await page.locator('#tabParentRegister').click();
    await page.locator('#guardianName').fill('E2E Parent');
    await page.locator('#guardianPin').fill(parentPin);
    await page.getByRole('button', { name: 'Daftar Parent Area', exact: true }).click();
    await page.locator('#parentApp:not(.hidden)').waitFor({ state: 'visible', timeout: 15000 });
    parentCode = ((await page.locator('#parentCode').textContent()) || '').trim();
    if (!parentCode) throw new Error('Parent Code not shown after registration');
  });

  await step('Pautkan anak button links existing student with Link Code', async () => {
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

  await step('Reset PIN button works for linked child', async () => {
    const card = page.locator('#parentChildren .child-card').filter({ hasText: `@${studentId}` });
    page.once('dialog', dialog => dialog.accept(resetPin));
    await card.getByRole('button', { name: 'Reset PIN', exact: true }).click();
    await waitToast('PIN berjaya direset');
  });

  await step('Unlink button removes parent access without deleting child', async () => {
    const card = page.locator('#parentChildren .child-card').filter({ hasText: `@${studentId}` });
    page.once('dialog', dialog => dialog.accept());
    await card.getByRole('button', { name: 'Unlink', exact: true }).click();
    await waitToast('Akses parent diputuskan');
    await page.waitForTimeout(400);
    if (await page.locator('#parentChildren .child-card').filter({ hasText: `@${studentId}` }).count()) throw new Error('Child still linked after unlink');
  });

  await step('Parent Daftar & pautkan creates a new child with ID availability', async () => {
    await page.locator('#parentChildName').fill('E2E Child');
    await page.locator('#parentChildId').fill(childId);
    await page.locator('#parentChildPin').fill(childPin);
    await page.locator('#parentChildIdStatus.success').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#parentChildSubmit').click();
    await page.locator('#parentChildren .child-card').filter({ hasText: `@${childId}` }).waitFor({ state: 'visible', timeout: 10000 });
  });

  await step('Parent Keluar/Tukar User works and remembered parent card opens login', async () => {
    await page.getByRole('button', { name: 'Keluar / Tukar User', exact: true }).click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
    const parentCard = page.locator('#guardianProfiles .profile-card').filter({ hasText: parentCode });
    await parentCard.click();
    await page.locator('#guardianLoginForm:not(.hidden)').waitFor({ state: 'visible' });
    if ((await page.locator('#parentCodeLogin').inputValue()) !== parentCode) throw new Error('Remembered parent card did not prefill code');
    await page.locator('#parentPinLogin').fill(parentPin);
    await page.getByRole('button', { name: 'Masuk Parent Area', exact: true }).click();
    await page.locator('#parentApp:not(.hidden)').waitFor({ state: 'visible', timeout: 10000 });
  });

  await step('Student can log in with parent-reset PIN', async () => {
    await page.getByRole('button', { name: 'Keluar / Tukar User', exact: true }).click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
    const card = page.locator('#studentProfiles .profile-card').filter({ hasText: `@${studentId}` });
    await card.click();
    await page.locator('#loginPin').fill(resetPin);
    await page.locator('#studentLoginForm').getByRole('button', { name: 'Log masuk', exact: true }).click();
    await waitApp();
  });

  await step('Profile switch button works from profile screen', async () => {
    await nav('profile');
    await page.getByRole('button', { name: /Tukar Pelajar/ }).click();
    await page.locator('#gate:not(.hidden)').waitFor({ state: 'visible' });
  });

  await step('Remembered profile remove × buttons work locally', async () => {
    const studentCardsBefore = await page.locator('#studentProfiles .profile-card').count();
    if (studentCardsBefore) {
      await page.locator('#studentProfiles .profile-card').last().locator('.profile-remove').click();
      await page.waitForTimeout(150);
      const after = await page.locator('#studentProfiles .profile-card').count();
      if (after !== studentCardsBefore - 1) throw new Error('Student profile remove button failed');
    }
    const parentCardsBefore = await page.locator('#guardianProfiles .profile-card').count();
    if (parentCardsBefore) {
      await page.locator('#guardianProfiles .profile-card').last().locator('.profile-remove').click();
      await page.waitForTimeout(150);
      const after = await page.locator('#guardianProfiles .profile-card').count();
      if (after !== parentCardsBefore - 1) throw new Error('Parent profile remove button failed');
    }
  });

  if (pageErrors.length) throw new Error(`Page errors detected:\n${pageErrors.join('\n')}`);
  if (apiErrors.length) throw new Error(`Unexpected API errors detected:\n${apiErrors.join('\n')}`);

  console.log('\n=== E2E SUMMARY ===');
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name} (${r.ms}ms)`);
  console.log(`PASS ${results.filter(r => r.ok).length}/${results.length} test groups`);
  console.log(`Created isolated test identities: ${studentId}, ${childId}, parent ${parentCode || '(not created)'}`);

  await browser.close();
}

main().catch(async error => {
  console.error('\nE2E FAILED:', error?.stack || error);
  console.error('\nPartial results:');
  for (const r of results) console.error(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}`);
  try { await browser?.close(); } catch {}
  process.exit(1);
});
