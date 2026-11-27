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
async function library(page){
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="duas"]').click();
  await expect(page.locator('.dl2-page')).toBeVisible();
}
for(const width of [320,375,430]){
  test('expanded source-linked Dua catalogue '+width+'px has all categories with no sideways overflow',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width,height:812});
    await library(page);
    await expect(page.locator('.dl2-total')).toContainText('৬৯');
    await expect(page.locator('.dc-dua-row')).toHaveCount(69);
    await page.locator('[data-dualib="expand"]').click();
    await expect(page.locator('.dl2-category-grid .dl2-cat')).toHaveCount(20);
    const status=await page.evaluate(()=>{
      const c=window.DhikrDuaCatalog;
      return {all20:c.categoryStats().every(x=>x.count>0),
        ids:c.entries.map(x=>x.id),
        overflows:document.documentElement.scrollWidth>innerWidth+2,
        buttons:[...document.querySelectorAll('.dl2-cat')].every(el=>
          el.tagName==='BUTTON'&&el.getAttribute('data-dualib')==='category')
      };
    });
    expect(status.all20).toBe(true);
    expect(new Set(status.ids).size).toBe(69);
    expect(status.overflows).toBe(false);
    expect(status.buttons).toBe(true);
    expect(errors).toEqual([]);
  });
}
test('Arabic and Bengali text show together for sourced Qur’an Dua with honest editorial note',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await library(page);
  await page.locator('.dc-dua-row[data-id="q-23-118"]').click();
  await expect(page.locator('.dr3-reader')).toBeVisible();
  await expect(page.locator('[data-dr3-layer="arabic"]')).toBeChecked();
  await expect(page.locator('.dr3-arabic')).toContainText('رَبِّ اغْفِرْ');
  await expect(page.locator('.dr3-pron')).toBeVisible();
  await expect(page.locator('.dr3-meaning')).toBeVisible();
  await expect(page.locator('.dr3-review-note')).toContainText('বাংলা অর্থ ও উচ্চারণের স্বাধীন');
  await expect(page.locator('.dr3-source a')).toHaveAttribute('href','https://quran.com/23/118');
  const padding=await page.locator('.dr3-content').evaluate(el=>({
    left:parseFloat(getComputedStyle(el).paddingLeft),
    right:parseFloat(getComputedStyle(el).paddingRight),
    overflow:el.scrollWidth>el.clientWidth+2
  }));
  expect(padding.left).toBeGreaterThanOrEqual(20);
  expect(padding.right).toBeGreaterThanOrEqual(20);
  expect(padding.overflow).toBe(false);
  await page.locator('[data-dr3-layer="arabic"]').uncheck();
  await expect(page.locator('.dr3-arabic')).toHaveCount(0);
  await expect(page.locator('.dr3-pron')).toBeVisible();
});
test('Hisn al-Muslim source records can be found via Ramadan and Hajj categories',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await library(page);
  await page.locator('[data-dualib="expand"]').click();
  await page.locator('.dl2-cat[data-category="hajj-umrah"]').click();
  await expect(page.locator('.dc-dua-row[data-id="h-233"]')).toBeVisible();
  await page.locator('.dc-dua-row[data-id="h-233"]').click();
  await expect(page.locator('.dr3-source a')).toHaveAttribute('href','https://sunnah.com/hisn:233');
  await expect(page.locator('.dr3-arabic')).toContainText('لَبَّيْكَ');
  await page.locator('[data-exp="dua-close"]').click();
  await page.locator('[data-dualib="clear-category"]').click();
  await page.locator('.dl2-cat[data-category="ramadan-fasting"]').click();
  await expect(page.locator('.dc-dua-row[data-id="h-176"]')).toBeVisible();
});
test('new IDs preserve Favorites, recent list and daily Save after reload',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await library(page);
  await page.locator('.dl2-fav[data-id="q-23-118"]').click();
  await page.locator('.dc-dua-row[data-id="q-23-118"]').click();
  await page.locator('[data-dr3="save"]').click();
  await expect(page.locator('[data-dr3="save"]')).toContainText('আজ পড়েছেন');
  await page.locator('[data-exp="dua-close"]').click();
  await page.reload();
  await page.locator('.nav [data-screen="duas"]').click();
  await page.locator('.dl2-scopes [data-scope="favorites"]').click();
  await expect(page.locator('.dc-dua-row[data-id="q-23-118"]')).toBeVisible();
  await page.locator('.dl2-scopes [data-scope="recent"]').click();
  await expect(page.locator('.dc-dua-row[data-id="q-23-118"]')).toBeVisible();
  await page.locator('.dc-dua-row[data-id="q-23-118"]').click();
  await expect(page.locator('[data-dr3="save"]')).toContainText('আজ পড়েছেন');
  const stored=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('dhikr_dubai_dua_v5'));
    return Object.values(d).flat().filter(x=>x==='q-23-118');
  });
  expect(stored).toEqual(['q-23-118']);
});
test('unreviewed original legacy Duas remain intact and without invented Arabic',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_dubai_dua_v5',JSON.stringify({'2026-11-26':['rizq-need']}));
  });
  await library(page);
  await page.locator('.dc-dua-row[data-id="rizq-need"]').click();
  await expect(page.locator('[data-dr3-layer="arabic"]')).toHaveCount(0);
  await expect(page.locator('.dr3-pron')).toContainText('রাব্বি ইন্নী');
  await page.locator('[data-exp="dua-close"]').click();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('dhikr_dubai_dua_v5'))['2026-11-26']);
  expect(saved).toEqual(['rizq-need']);
});
