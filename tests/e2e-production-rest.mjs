import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'https://school.0com.my';
const suffix = Date.now().toString(36).slice(-7);
const studentId = `e2er${suffix}`.toLowerCase();
const childId = `e2erc${suffix}`.toLowerCase();
const studentPin = '731946';
const resetPin = '739146';
const childPin = '842751';
const parentPin = '654321';
const results = [];
const apiErrors = [];
const pageErrors = [];
let browser, page;

async function step(name, fn) {
  const t = Date.now();
  try { await fn(); results.push({name,ok:true,ms:Date.now()-t}); console.log(`✓ ${name}`); }
  catch (e) { results.push({name,ok:false,ms:Date.now()-t,error:String(e?.stack||e)}); console.error(`✗ ${name}\n${e?.stack||e}`); try{await page.screenshot({path:'e2e-rest-failure.png',fullPage:true})}catch{}; throw e; }
}
const toast = async text => { const el=page.locator('#toast'); await el.waitFor({state:'visible',timeout:10000}); const v=(await el.textContent())||''; if(text&&!v.includes(text)) throw new Error(`Expected toast ${text}; got ${v}`); };
const nav = async screen => { await page.locator(`.nav button[data-screen="${screen}"]`).click(); await page.locator(`#screen-${screen}.active`).waitFor({state:'visible'}); };
const waitApp = async()=>{await page.locator('#studentApp:not(.hidden)').waitFor({state:'visible',timeout:15000});await page.locator('#screen-home.active').waitFor({state:'visible'});};

async function registerStudent() {
  await page.goto(BASE_URL,{waitUntil:'networkidle',timeout:30000});
  await page.locator('#regName').fill('E2E Rest Pelajar');
  await page.locator('#regStudentId').fill(studentId);
  await page.locator('#regPin').fill(studentPin);
  await page.locator('#regIdStatus.success').waitFor({state:'visible',timeout:10000});
  await page.locator('#regSubmit').click();
  await waitApp();
}

async function testTaskButtonsAndCheckboxes() {
  for(let day=1;day<=8;day++){
    await nav('home');
    await page.locator('#days .day').nth(day-1).click();
    const count=await page.locator('#tasks .task-open').count();
    if(!count) throw new Error(`Day ${day}: no Buka/Ulang buttons`);
    for(let i=0;i<count;i++){
      await page.locator('#tasks .task-open').nth(i).click();
      await page.locator('#screen-learn.active').waitFor({state:'visible'});
      if(!((await page.locator('#quizQuestion').textContent())||'').trim()) throw new Error(`Day ${day} task ${i+1} opened blank module`);
      await nav('home');
      await page.locator('#days .day').nth(day-1).click();
    }
    const cb=page.locator('#tasks input[type="checkbox"]').first();
    const before=await cb.isChecked();
    await cb.click();
    await toast(before?'dibuka semula':'Disimpan');
    const expected=!before;
    try {
      await page.waitForFunction(exp=>document.querySelector('#tasks input[type="checkbox"]')?.checked===exp, expected, {timeout:5000});
    } catch(e) {
      const diag=await page.evaluate(()=>({
        currentDay: eval('currentDay'),
        firstChecked: document.querySelector('#tasks input[type="checkbox"]')?.checked,
        progress: eval('state.progress').filter(p=>Number(p.day_no)===eval('currentDay')).slice(0,10)
      }));
      throw new Error(`Day ${day} checkbox failed. expected=${expected}; diag=${JSON.stringify(diag)}`);
    }
  }
}

async function main(){
  browser=await chromium.launch({headless:true});
  const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',locale:'ms-MY'});
  page=await ctx.newPage();
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('response',r=>{if(r.url().includes('/api/')&&r.status()>=400)apiErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`)});

  await step('Register isolated learner for remaining interaction tests',registerStudent);
  await step('Every Day 1-8 Buka/Ulang task button and checklist checkbox works',testTaskButtonsAndCheckboxes);

  await step('All Quick Start Mula buttons work',async()=>{
    await nav('home'); const q=page.locator('#subjects button'); if(await q.count()!==4)throw new Error('Expected 4 Quick Start buttons');
    for(let i=0;i<4;i++){await page.locator('#subjects button').nth(i).click();await page.locator('#screen-learn.active').waitFor({state:'visible'});if(!((await page.locator('#quizQuestion').textContent())||'').trim())throw new Error(`Quick Start ${i+1} blank`);await nav('home');}
  });

  await step('All fixed Math/Science/BM/English practice buttons work',async()=>{
    await nav('learn'); const buttons=page.locator('#screen-learn .panel').last().locator(':scope > div:last-child button'); const n=await buttons.count(); if(n!==4)throw new Error(`Expected 4 fixed practice buttons, got ${n}`);
    for(let i=0;i<4;i++){await buttons.nth(i).click();if(!((await page.locator('#quizQuestion').textContent())||'').trim())throw new Error(`Practice ${i+1} blank`);}
  });

  await step('BM EN Dwi buttons and profile Tukar bahasa work',async()=>{
    await nav('learn');
    for(const [label,expected] of [['EN','English'],['BM','Bahasa Melayu'],['Dwi','Dwi Bahasa']]){await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(500);await nav('profile');if((await page.locator('#langSetting').textContent())?.trim()!==expected)throw new Error(`${label} failed`);await nav('learn');}
    await nav('profile');const before=(await page.locator('#langSetting').textContent())?.trim();await page.getByRole('button',{name:'Tukar bahasa',exact:true}).click();await page.waitForTimeout(500);const after=(await page.locator('#langSetting').textContent())?.trim();if(!after||after===before)throw new Error('Tukar bahasa failed');
  });

  await step('Wrong-answer button creates Buku Silap and mastered button works',async()=>{
    await nav('learn');await page.evaluate(()=>eval("activeLearningModule=null;currentTask=null;newQuestion('Math')"));
    const count=await page.locator('#answers button').count();const correct=await page.evaluate(()=>eval('currentQuiz.q.c'));const wrong=(correct+1)%count;await page.locator('#answers button').nth(wrong).click();await toast('Belum tepat');await page.waitForTimeout(1600);
    await nav('mistakes');const card=page.locator('#mistakeList .child-card').first();await card.waitFor({state:'visible'});await card.getByRole('button',{name:/Saya dah faham/}).click();await toast('mastered');
  });

  await step('Rewards screen renders badge state',async()=>{await nav('rewards');if(await page.locator('#badgeList p').count()!==4)throw new Error('Badge count mismatch');});

  let linkCode;
  await step('Profile Link Code, Import lama and Buang-from-device cancel buttons work',async()=>{
    await nav('profile');await page.getByRole('button',{name:/Jana 6-digit Link Code/}).click();await page.locator('#linkCodeBox .code-box').waitFor({state:'visible'});linkCode=((await page.locator('#linkCodeBox .code-box').textContent())||'').trim();if(!/^\d{6}$/.test(linkCode))throw new Error('Link code invalid');
    await page.getByRole('button',{name:'Import progress lama',exact:true}).click();await toast('Tiada progress');
    page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'Buang dari device ini',exact:true}).click();await page.waitForTimeout(200);await page.locator('#studentApp:not(.hidden)').waitFor({state:'visible'});
  });

  await step('Tukar Pelajar and remembered student profile card work',async()=>{
    await nav('home');await page.getByRole('button',{name:/Tukar Pelajar/}).first().click();await page.locator('#gate:not(.hidden)').waitFor({state:'visible'});const card=page.locator('#studentProfiles .profile-card').filter({hasText:`@${studentId}`});await card.click();await page.locator('#studentLoginForm:not(.hidden)').waitFor({state:'visible'});if(await page.locator('#loginStudentId').inputValue()!==studentId)throw new Error('Remembered learner did not prefill ID');
  });

  await step('Duplicate Student ID check disables registration',async()=>{
    await page.locator('#tabStudentRegister').click();await page.locator('#regName').fill('Dup');await page.locator('#regStudentId').fill(studentId);await page.locator('#regPin').fill(studentPin);await page.locator('#regIdStatus.error').waitFor({state:'visible',timeout:10000});if(!(await page.locator('#regSubmit').isDisabled()))throw new Error('Duplicate ID submit enabled');
  });

  let parentCode;
  await step('Parent registration button works',async()=>{
    await page.locator('#tabParentRegister').click();await page.locator('#guardianName').fill('E2E Parent');await page.locator('#guardianPin').fill(parentPin);await page.getByRole('button',{name:'Daftar Parent Area',exact:true}).click();await page.locator('#parentApp:not(.hidden)').waitFor({state:'visible',timeout:15000});parentCode=((await page.locator('#parentCode').textContent())||'').trim();if(!parentCode)throw new Error('No Parent Code');
  });

  await step('Pautkan anak existing button works',async()=>{await page.locator('#parentLinkCode').fill(linkCode);await page.locator('#parentRelationship').fill('anak');await page.getByRole('button',{name:'Pautkan anak',exact:true}).click();await page.locator('#parentChildren .child-card').filter({hasText:`@${studentId}`}).waitFor({state:'visible',timeout:10000});});
  await step('Simpan profil pada device button works',async()=>{const card=page.locator('#parentChildren .child-card').filter({hasText:`@${studentId}`});await card.getByRole('button',{name:'Simpan profil pada device',exact:true}).click();await toast('Profil disimpan');});
  await step('Reset PIN button works',async()=>{const card=page.locator('#parentChildren .child-card').filter({hasText:`@${studentId}`});page.once('dialog',d=>d.accept(resetPin));await card.getByRole('button',{name:'Reset PIN',exact:true}).click();await toast('PIN berjaya direset');});
  await step('Unlink button works',async()=>{const card=page.locator('#parentChildren .child-card').filter({hasText:`@${studentId}`});page.once('dialog',d=>d.accept());await card.getByRole('button',{name:'Unlink',exact:true}).click();await toast('Akses parent diputuskan');await page.waitForTimeout(300);if(await page.locator('#parentChildren .child-card').filter({hasText:`@${studentId}`}).count())throw new Error('Unlink failed');});

  await step('Parent Daftar & pautkan new child button works',async()=>{await page.locator('#parentChildName').fill('E2E Child');await page.locator('#parentChildId').fill(childId);await page.locator('#parentChildPin').fill(childPin);await page.locator('#parentChildIdStatus.success').waitFor({state:'visible',timeout:10000});await page.locator('#parentChildSubmit').click();await page.locator('#parentChildren .child-card').filter({hasText:`@${childId}`}).waitFor({state:'visible',timeout:10000});});

  await step('Parent Keluar/Tukar User and remembered Parent card/login work',async()=>{await page.getByRole('button',{name:'Keluar / Tukar User',exact:true}).click();await page.locator('#gate:not(.hidden)').waitFor({state:'visible'});const card=page.locator('#guardianProfiles .profile-card').filter({hasText:parentCode});await card.click();await page.locator('#guardianLoginForm:not(.hidden)').waitFor({state:'visible'});if(await page.locator('#parentCodeLogin').inputValue()!==parentCode)throw new Error('Remembered parent did not prefill');await page.locator('#parentPinLogin').fill(parentPin);await page.getByRole('button',{name:'Masuk Parent Area',exact:true}).click();await page.locator('#parentApp:not(.hidden)').waitFor({state:'visible',timeout:10000});});

  await step('Student logs in with parent-reset PIN',async()=>{await page.getByRole('button',{name:'Keluar / Tukar User',exact:true}).click();await page.locator('#gate:not(.hidden)').waitFor({state:'visible'});const card=page.locator('#studentProfiles .profile-card').filter({hasText:`@${studentId}`});await card.click();await page.locator('#loginPin').fill(resetPin);await page.locator('#studentLoginForm').getByRole('button',{name:'Log masuk',exact:true}).click();await waitApp();});

  await step('Profile Tukar Pelajar button works',async()=>{await nav('profile');await page.getByRole('button',{name:/Tukar Pelajar/}).click();await page.locator('#gate:not(.hidden)').waitFor({state:'visible'});});
  await step('Remembered learner and parent × remove buttons work locally',async()=>{const sc=await page.locator('#studentProfiles .profile-card').count();if(sc){await page.locator('#studentProfiles .profile-card').last().locator('.profile-remove').click();await page.waitForTimeout(150);if(await page.locator('#studentProfiles .profile-card').count()!==sc-1)throw new Error('Student × failed');}const pc=await page.locator('#guardianProfiles .profile-card').count();if(pc){await page.locator('#guardianProfiles .profile-card').last().locator('.profile-remove').click();await page.waitForTimeout(150);if(await page.locator('#guardianProfiles .profile-card').count()!==pc-1)throw new Error('Parent × failed');}});

  if(pageErrors.length)throw new Error(`Page errors: ${pageErrors.join(' | ')}`);
  // API 4xx/5xx are not expected in this script. Duplicate-ID check is a 200 availability response.
  if(apiErrors.length)throw new Error(`Unexpected API errors: ${apiErrors.join(' | ')}`);
  console.log('\n=== REMAINING INTERACTION SUMMARY ===');for(const r of results)console.log(`PASS ${r.name} (${r.ms}ms)`);console.log(`PASS ${results.length}/${results.length}`);
  await browser.close();
}
main().catch(async e=>{console.error('E2E REST FAILED',e?.stack||e);try{await browser?.close()}catch{};process.exit(1)});
