import {test,expect} from '@playwright/test';
const base='http://127.0.0.1:4173';
const timings={Fajr:'05:05',Sunrise:'06:25',Dhuhr:'12:10',Asr:'15:25',Maghrib:'17:38',Isha:'19:05'};

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_prayer_location_v1',JSON.stringify({
      name:'দুবাই',country:'United Arab Emirates',code:'AE',
      lat:25.2048,lon:55.2708,tz:'Asia/Dubai',
      method:'16',school:0,mode:'city',lastCheck:Date.now()
    }));
  });
  await page.route('https://api.aladhan.com/**',route=>{
    const calendar=new URL(route.request().url()).pathname.includes('/calendar/');
    return route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({data:calendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}})});
  });
});
async function open(page){
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="duas"]').click();
  await expect(page.locator('.dc-dua-page')).toBeVisible();
}
test('new 20-category metadata loads, but the old 11 Duo rows and 5 legacy topic filters remain',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await open(page);
  await expect(page.locator('.dc-dua-row')).toHaveCount(11);
  await expect(page.locator('.dl2-category-grid .dl2-cat')).toHaveCount(4);
  await expect(page.locator('.dl2-scopes button')).toHaveCount(3);
  const metadata=await page.evaluate(()=>{
    const c=window.DhikrDuaCatalog;
    return {
      categories:c.categories.length,
      entries:c.entries.length,
      stableIds:c.entries.map(e=>e.id),
      allPending:c.entries.every(e=>e.editorial.status==='pending_review'&&e.text.arabic===null),
      personal:c.get('work-personal').source.kind,
      untranslatedHasBeenGenerated:c.entries.some(e=>e.text.arabic!==null)
    };
  });
  expect(metadata.categories).toBe(20);
  expect(metadata.entries).toBe(11);
  expect(new Set(metadata.stableIds).size).toBe(11);
  expect(metadata.allPending).toBe(true);
  expect(metadata.personal).toBe('personal');
  expect(metadata.untranslatedHasBeenGenerated).toBe(false);
  expect(errors).toEqual([]);
});
test('search understands new topic aliases without showing empty categories',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await open(page);
  const input=page.locator('#dc-dua-search');
  await input.fill('আত্মশুদ্ধি');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(1);
  await expect(page.locator('.dc-dua-row:visible')).toContainText('ইস্তিগফার');
  await input.fill('পড়াশোনা');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(1);
  await expect(page.locator('.dc-dua-row:visible')).toContainText('সঠিক জ্ঞান');
  await input.fill('হজ');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(0);
  await expect(page.locator('#dc-dua-empty')).toBeVisible();
  await input.fill('');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(11);
});
test('old reading IDs and saved progress survive metadata loading and a reload',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_dubai_dua_v5',
      JSON.stringify({'2026-11-26':['rizq-need','remembrance']}));
  });
  await open(page);
  const existing=await page.evaluate(()=>localStorage.getItem('dhikr_dubai_dua_v5'));
  await page.locator('#dc-dua-search').fill('রিজিক');
  await page.reload();
  await page.locator('.nav [data-screen="duas"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(11);
  expect(await page.evaluate(()=>localStorage.getItem('dhikr_dubai_dua_v5'))).toBe(existing);
  const compat=await page.evaluate(()=>({
    rows:NIGHT_DUAS.length,
    originalId:NIGHT_DUAS[0].id,
    sameId:window.DhikrDuaCatalog.get(NIGHT_DUAS[0].id).id
  }));
  expect(compat.rows).toBe(11);
  expect(compat.originalId).toBe(compat.sameId);
});
test('original Dua reader opens and closes with new metadata present',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await open(page);
  await page.locator('.dc-dua-row[data-id="wellness-ayyub"]').click();
  await expect(page.locator('.ex-reader')).toBeVisible();
  await expect(page.locator('.ex-reader')).toContainText('কষ্ট ও অসুস্থতায় সাহায্য');
  await page.locator('.ex-reader [data-exp="dua-close"]').first().click();
  await expect(page.locator('.dc-dua-page')).toBeVisible();
});
