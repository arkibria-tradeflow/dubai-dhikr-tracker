import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173';
const timings={Fajr:'05:05',Sunrise:'06:25',Dhuhr:'12:10',Asr:'15:25',Maghrib:'17:38',Isha:'19:05'};

test.beforeEach(async({page})=>{
  await page.clock.install({time:new Date('2026-11-26T06:00:00Z')});
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_prayer_location_v1',JSON.stringify({
      name:'দুবাই',country:'United Arab Emirates',code:'AE',
      lat:25.2048,lon:55.2708,tz:'Asia/Dubai',
      method:'16',school:0,mode:'city',lastCheck:Date.now()
    }));
  });
  await page.route('https://api.aladhan.com/**',route=>{
    const calendar=new URL(route.request().url()).pathname.includes('/calendar/');
    route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      data:calendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}
    })});
  });
});

async function ready(page){
  await page.goto(base+'/');
  await expect(page.locator('.p2-home')).toBeVisible();
  await page.waitForFunction(()=>!loading&&validTimes(dayInfo().tm));
}
async function failWrites(page,key){
  await page.evaluate(storageKey=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){
      if(k===storageKey)throw new DOMException('Quota exceeded','QuotaExceededError');
      return original.call(this,k,v);
    };
  },key);
}
async function openFajrCounter(page){
  await page.locator('.p2-home .ex-prayer-grid [data-action="prayer"][data-prayer="Fajr"]').click();
  await expect(page.locator('.v2-session-hero')).toBeVisible();
  await page.locator('.v2-continue.session-start').click();
  await expect(page.locator('.v2-focus-page')).toBeVisible();
}

test('failed five-waqt storage write does not show a count or completion',async({page})=>{
  await ready(page);
  await openFajrCounter(page);
  const counter=page.locator('.v2-counter-top strong');
  await expect(counter).toContainText('০');
  await failWrites(page,'dhikr_dubai_records_v1');
  await page.locator('.v2-giant-tap').click();
  await expect(counter).toContainText('০');
  await expect(page.locator('#toast')).toContainText('সেভ করা যাচ্ছে না');
  expect(await page.evaluate(()=>localStorage.getItem('dhikr_dubai_records_v1'))).toBeNull();
});

test('successful five-waqt count persists after refresh and supports one-step undo',async({page})=>{
  await ready(page);
  await openFajrCounter(page);
  await page.locator('.v2-giant-tap').click();
  await expect(page.locator('.v2-counter-top strong')).toContainText('১');
  await page.reload();
  await expect(page.locator('.p2-home')).toBeVisible();
  await openFajrCounter(page);
  await expect(page.locator('.v2-counter-top strong')).toContainText('১');
  await page.locator('.v2-minus').click();
  await expect(page.locator('.v2-counter-top strong')).toContainText('০');
});

test('Daily 21 never increments when device storage throws',async({page})=>{
  await ready(page);
  await page.locator('.p2-personal[data-d21="open-list"]').click();
  await page.locator('.d21-item[data-d21="open-reader"]').first().click();
  await expect(page.locator('.d21-dock-count strong')).toContainText('০');
  await failWrites(page,'dhikr_dubai_daily21_v1');
  await page.locator('.d21-add').click();
  await expect(page.locator('.d21-dock-count strong')).toContainText('০');
  await expect(page.locator('#toast')).toContainText('সেভ করা যাচ্ছে না');
});

test('Tahajjud failure does not display two completed rakaat',async({page})=>{
  await ready(page);
  await page.clock.setFixedTime(new Date('2026-11-26T16:00:00Z')); // 20:00 Dubai
  await page.locator('.p2-secondary-links [data-screen="night"]').click();
  const count=page.locator('.ex-rakaat-stat');
  await expect(count).toContainText('০');
  await expect(page.locator('.ex-primary-action[data-night="rakaat"]')).toBeEnabled();
  await failWrites(page,'dhikr_dubai_tahajjud_v1');
  await page.locator('.ex-primary-action[data-night="rakaat"]').click();
  await expect(count).toContainText('০');
  await expect(page.locator('#toast')).toContainText('সেভ করা যাচ্ছে না');
});

test('Tahajjud successful count survives a refresh and can be decremented',async({page})=>{
  await ready(page);
  await page.clock.setFixedTime(new Date('2026-11-26T16:00:00Z'));
  await page.locator('.p2-secondary-links [data-screen="night"]').click();
  await page.locator('.ex-primary-action[data-night="rakaat"]').click();
  await expect(page.locator('.ex-rakaat-stat')).toContainText('২');
  await page.reload();
  await expect(page.locator('.p2-home')).toBeVisible();
  await page.locator('.p2-secondary-links [data-screen="night"]').click();
  await expect(page.locator('.ex-rakaat-stat')).toContainText('২');
  await page.locator('.ex-undo[data-night="rakaat-minus"]').click();
  await expect(page.locator('.ex-rakaat-stat')).toContainText('০');
});
