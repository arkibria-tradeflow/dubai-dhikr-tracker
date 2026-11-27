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
    const isCalendar=new URL(route.request().url()).pathname.includes('/calendar/');
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      data:isCalendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}
    })});
  });
});
async function open(page){
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="duas"]').click();
  await expect(page.locator('.dl2-page')).toBeVisible();
}

for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('mobile '+width+'px has a compact directory and no sideways overflow',async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize({width,height});
    await open(page);
    await expect(page.locator('.dl2-category-grid .dl2-cat')).toHaveCount(4);
    await expect(page.locator('.dl2-scopes button')).toHaveCount(3);
    await expect(page.locator('.dc-dua-row')).toHaveCount(69);
    await expect(page.locator('.dl2-fav')).toHaveCount(69);
    const measurements=await page.evaluate(()=>{
      const w=innerWidth;
      const cats=[...document.querySelectorAll('.dl2-cat')].map(x=>x.getBoundingClientRect());
      const scopes=[...document.querySelectorAll('.dl2-scopes button')].map(x=>x.getBoundingClientRect());
      const rows=[...document.querySelectorAll('.dl2-item')].map(x=>x.getBoundingClientRect());
      const search=document.getElementById('dc-dua-search').getBoundingClientRect();
      return {
        documentWidth:document.documentElement.scrollWidth,
        viewport:w,
        catTargets:cats.every(r=>r.height>=70&&r.left>=0&&r.right<=w+1),
        scopeTargets:scopes.every(r=>r.height>=44),
        rowsSafe:rows.every(r=>r.left>=0&&r.right<=w+1),
        searchHeight:search.height,
        headings:document.querySelectorAll('.dl2-page h1').length
      };
    });
    expect(measurements.documentWidth).toBeLessThanOrEqual(measurements.viewport+2);
    expect(measurements.catTargets).toBe(true);
    expect(measurements.scopeTargets).toBe(true);
    expect(measurements.rowsSafe).toBe(true);
    expect(measurements.searchHeight).toBeGreaterThanOrEqual(44);
    expect(measurements.headings).toBe(1);
    expect(errors).toEqual([]);
  });
}

test('all 20 populated categories are discoverable and clickable',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await open(page);
  await page.locator('[data-dualib="expand"]').click();
  await expect(page.locator('.dl2-category-grid .dl2-cat')).toHaveCount(20);
  const hajj=page.locator('.dl2-cat[data-category="hajj-umrah"]');
  await expect(hajj).toContainText('হজ ও উমরাহ');
  await expect(hajj).toContainText('টি দোয়া');
  await expect(hajj).toHaveAttribute('data-dualib','category');
  await expect(hajj).not.toHaveAttribute('aria-disabled','true');
  await page.locator('[data-dualib="expand"]').click();
  await expect(page.locator('.dl2-category-grid .dl2-cat')).toHaveCount(4);
});

test('category filter uses multiple tags without duplicating readings and can be cleared',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await open(page);
  await page.locator('[data-dualib="expand"]').click();
  const pick=page.locator('.dl2-cat[data-category="livelihood-debt"]');
  await pick.click();
  await expect(page.locator('.dl2-cat[data-category="livelihood-debt"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.dl2-row-copy')).toHaveCount(8); // Includes source-linked cross-listed entries.
  await expect(page.locator('#dl2-results-title')).toContainText('রিজিক');
  await page.locator('[data-dualib="clear-category"]').click();
  await expect(page.locator('.dl2-row-copy')).toHaveCount(69);
});

test('Bengali and source search stays focused, including combining marks',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await open(page);
  const input=page.locator('#dc-dua-search');
  await input.fill('পড়াশোনা');
  await expect(page.locator('.dc-dua-row[data-id="work-knowledge"]')).toHaveCount(1);
  await expect(input).toBeFocused();
  await input.fill('তিরমিজি');
  await expect(page.locator('.dc-dua-row')).toHaveCount(1);
  await expect(input).toBeFocused();
  await input.fill('অচেনাবিষয়কোনোদোয়ানেই');
  await expect(page.locator('.dc-dua-row')).toHaveCount(0);
  await expect(page.locator('#dc-dua-empty')).toBeVisible();
  await expect(page.locator('.dl2-directory')).toBeHidden();
  await page.locator('[data-dualib="clear-search"]').click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page.locator('.dc-dua-row')).toHaveCount(69);
});

test('favorites can be saved, filtered, removed and preserved across page reload',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await open(page);
  const first=page.locator('.dl2-fav[data-id="rizq-need"]');
  await expect(first).toHaveAttribute('aria-pressed','false');
  await first.click();
  await expect(page.locator('.dl2-fav[data-id="rizq-need"]')).toHaveAttribute('aria-pressed','true');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('dhikr_dua_favorites_v1')));
  expect(stored).toEqual(['rizq-need']);
  await page.locator('.dl2-scopes [data-scope="favorites"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(1);
  await expect(page.locator('#dl2-results-title')).toContainText('পছন্দের');
  await page.reload();
  await page.locator('.nav [data-screen="duas"]').click();
  await page.locator('.dl2-scopes [data-scope="favorites"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(1);
  await page.locator('.dl2-fav[data-id="rizq-need"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(0);
  await expect(page.locator('#dc-dua-empty')).toContainText('এখনও পছন্দের দোয়া নেই');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dhikr_dua_favorites_v1')))).toEqual([]);
});

test('recently read tracks reader navigation without changing legacy completion records',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_dubai_dua_v5',JSON.stringify({'2026-11-24':['rizq-need']}));
  });
  await open(page);
  const before=await page.evaluate(()=>localStorage.getItem('dhikr_dubai_dua_v5'));
  await page.locator('.dl2-scopes [data-scope="recent"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(1);
  await page.locator('.dl2-scopes [data-scope="all"]').click();
  await page.locator('.dc-dua-row[data-id="family-calm"]').click();
  await expect(page.locator('.ex-reader')).toBeVisible();
  await page.locator('.ex-reader [data-exp="dua-close"]').first().click();
  await expect(page.locator('.dl2-page')).toBeVisible();
  await page.locator('.dl2-scopes [data-scope="recent"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(2);
  const ids=await page.locator('.dc-dua-row').evaluateAll(items=>items.map(i=>i.dataset.id));
  expect(ids).toEqual(['family-calm','rizq-need']);
  expect(await page.evaluate(()=>localStorage.getItem('dhikr_dubai_dua_v5'))).toBe(before);
});

test('personal wording is labelled, and the current Dua reader and Settings remain accessible',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await open(page);
  await page.locator('.dc-dua-row[data-id="work-personal"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.dc-dua-row[data-id="work-personal"]')).toContainText('নিজের ভাষার দোয়া');
  await page.locator('.dc-dua-row[data-id="wellness-ayyub"]').click();
  await expect(page.locator('.ex-reader')).toBeVisible();
  await expect(page.locator('.ex-reader')).toContainText('কষ্ট ও অসুস্থতায় সাহায্য');
  await page.locator('.ex-reader [data-exp="dua-close"]').first().click();
  await expect(page.locator('.dl2-page')).toBeVisible();
  await page.locator('.dl2-page .ex-top-action[data-screen="settings"]').click();
  await expect(page.locator('.settings-card')).toHaveCount(4);
});
