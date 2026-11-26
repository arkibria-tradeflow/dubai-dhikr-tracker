import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

const base='http://127.0.0.1:4173';
const timings={Fajr:'05:05',Sunrise:'06:25',Dhuhr:'12:10',Asr:'15:25',Maghrib:'17:38',Isha:'19:05'};
const FILE='Dubai Dhikr Tracker';

test.beforeEach(async({page})=>{
  await page.clock.install({time:new Date('2026-11-26T06:00:00Z')});
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_prayer_location_v1',JSON.stringify({
      name:'দুবাই',country:'United Arab Emirates',code:'AE',
      lat:25.2048,lon:55.2708,tz:'Asia/Dubai',method:'16',school:0,mode:'city',lastCheck:Date.now()
    }));
  });
  await page.route('https://api.aladhan.com/**',route=>{
    const calendar=new URL(route.request().url()).pathname.includes('/calendar/');
    route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({data:calendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}})});
  });
});
async function ready(page){
  await page.goto(base+'/');
  await expect(page.locator('.p2-home')).toBeVisible();
  await page.waitForFunction(()=>!loading&&validTimes(dayInfo().tm));
}
async function settings(page){
  await page.locator('.ex-top-action[data-screen="settings"]').click();
  await expect(page.locator('.settings-card')).toHaveCount(4);
}
async function setBackup(page,payload,name='backup.json'){
  await page.locator('#restore-input').setInputFiles({
    name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(payload))
  });
}
async function legacy(page,count=1){
  const id=await page.evaluate(()=>STEPS[0].id);
  return {app:FILE,version:1,exportedAt:'2026-11-25T12:20:00Z',
    sessions:{'2026-11-26|Fajr':{items:{[id]:{count,updatedAt:null,completedAt:null}}}}};
}
async function seed(page,n=1){
  await page.evaluate(n=>{
    const id=STEPS[0].id;
    const day=dayInfo().day;
    db={version:1,sessions:{[day+'|Fajr']:{items:{[id]:{count:n,updatedAt:null,completedAt:null}}}}};
    localStorage.setItem(DATA_KEY,JSON.stringify(db));
  },n);
}

test('full backup downloads all five record categories and gives honest status',async({page})=>{
  await ready(page);
  await settings(page);
  const event=page.waitForEvent('download');
  await page.locator('.settings-card [data-action="export"]').click();
  const download=await event;
  expect(download.suggestedFilename()).toContain('dhikr-full-backup-');
  const archive=JSON.parse(readFileSync(await download.path(),'utf8'));
  expect(archive.version).toBe(4);
  for(const key of ['sessions','tahajjud','quran','duas','daily21'])expect(archive).toHaveProperty(key);
  await expect(page.locator('#toast')).toContainText('ডাউনলোড শুরু হয়েছে');
});

test('legacy backup preview is required, and missing categories are retained',async({page})=>{
  await ready(page);
  await settings(page);
  await setBackup(page,await legacy(page,2),'old-backup.json');
  await expect(page.locator('.bk-dialog')).toBeVisible();
  await expect(page.locator('.bk-file')).toContainText('old-backup.json');
  await expect(page.locator('.bk-compare')).toContainText('প্রতিস্থাপনের পর');
  await expect(page.locator('.bk-note')).toContainText('পুরোনো ব্যাকআপ');
  await expect(page.locator('[data-bk="commit"]')).toBeDisabled();
  expect(await page.evaluate(()=>localStorage.getItem(DATA_KEY))).toBeNull();
  await page.locator('#bk-ack').check();
  await page.locator('[data-bk="commit"]').click();
  await expect(page.locator('.bk-dialog')).toHaveCount(0);
  const saved=JSON.parse(await page.evaluate(()=>localStorage.getItem(DATA_KEY)));
  expect(saved.sessions['2026-11-26|Fajr']).toBeTruthy();
  expect(saved.sessions['2026-11-26|Fajr'].items[Object.keys(saved.sessions['2026-11-26|Fajr'].items)[0]].count).toBe(2);
  expect(JSON.parse(await page.evaluate(()=>localStorage.getItem('dhikr_dubai_tahajjud_v1'))).nights).toEqual({});
});

test('cancelled preview never alters current saved records',async({page})=>{
  await ready(page);
  await seed(page,1);
  await settings(page);
  const before=await page.evaluate(()=>localStorage.getItem(DATA_KEY));
  await setBackup(page,await legacy(page,3));
  await expect(page.locator('.bk-dialog')).toBeVisible();
  await page.locator('[data-bk="cancel"]').last().click();
  await expect(page.locator('.bk-dialog')).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem(DATA_KEY))).toBe(before);
});

test('failed restore rolls back every category and keeps preview open',async({page})=>{
  await ready(page);
  await seed(page,1);
  await settings(page);
  const before=await page.evaluate(()=>localStorage.getItem(DATA_KEY));
  await setBackup(page,await legacy(page,3));
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    let once=false;
    Storage.prototype.setItem=function(k,v){
      if(k==='dhikr_dubai_quran_v5'&&!once){once=true;throw new DOMException('quota exceeded','QuotaExceededError')}
      return original.call(this,k,v);
    };
  });
  await page.locator('#bk-ack').check();
  await page.locator('[data-bk="commit"]').click();
  await expect(page.locator('.bk-error')).toContainText('আগের রেকর্ড অক্ষত');
  expect(await page.evaluate(()=>localStorage.getItem(DATA_KEY))).toBe(before);
  expect(await page.evaluate(()=>localStorage.getItem('dhikr_dubai_backup_journal_v1'))).toBeNull();
});

test('Delete All requires acknowledgment and cancel is safe',async({page})=>{
  await ready(page);
  await seed(page,1);
  await settings(page);
  await page.locator('.settings-card [data-action="clear"]').click();
  await expect(page.locator('.bk-dialog')).toContainText('সব রেকর্ড মুছবেন?');
  await expect(page.locator('[data-bk="commit"]')).toBeDisabled();
  await page.locator('[data-bk="cancel"]').last().click();
  expect(JSON.parse(await page.evaluate(()=>localStorage.getItem(DATA_KEY))).sessions['2026-11-26|Fajr']).toBeTruthy();
  await page.locator('.settings-card [data-action="clear"]').click();
  await page.locator('#bk-ack').check();
  await page.locator('[data-bk="commit"]').click();
  expect(JSON.parse(await page.evaluate(()=>localStorage.getItem(DATA_KEY))).sessions).toEqual({});
  await expect(page.locator('.bk-dialog')).toHaveCount(0);
});

test('reject unsupported backup versions without opening destructive confirmation',async({page})=>{
  await ready(page);
  await settings(page);
  await setBackup(page,{app:FILE,version:99,sessions:{}});
  await expect(page.locator('.bk-dialog')).toHaveCount(0);
  await expect(page.locator('#toast')).toContainText('সমর্থিত নয়');
});
