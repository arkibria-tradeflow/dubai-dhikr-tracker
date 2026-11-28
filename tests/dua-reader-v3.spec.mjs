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
async function openDua(page,id='wellness-ayyub'){
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="worship"]').click();
  await page.locator('.ex-more-list [data-screen="duas"]').click();
  await expect(page.locator('.dl2-page')).toBeVisible();
  await page.locator('.dc-dua-row[data-id="'+id+'"]').click();
  await expect(page.locator('.dr3-reader')).toBeVisible();
}
for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('mobile '+width+'px reader fits with padding and one compact footer row',async({page})=>{
    await page.setViewportSize({width,height});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await openDua(page);
    await expect(page.locator('.dr3-reading .dr3-pron')).toBeVisible();
    await expect(page.locator('.dr3-reading .dr3-meaning')).toBeVisible();
    await expect(page.locator('.dr3-arabic')).toHaveCount(0);
    await expect(page.locator('[data-dr3-layer="arabic"]')).toHaveCount(0);
    await expect(page.locator('.p2-reader-tabs,.dua-flow-nav,.dua-flow-open,.ex-reader-flower')).toHaveCount(0);
    const measure=await page.evaluate(()=>{
      const root=document.querySelector('.dr3-reader');
      const heading=root.querySelector('.dr3-header').getBoundingClientRect();
      const options=root.querySelector('.dr3-options').getBoundingClientRect();
      const footer=root.querySelector('.dr3-dock').getBoundingClientRect();
      const content=root.querySelector('.dr3-content').getBoundingClientRect();
      const buttons=[...root.querySelectorAll('.dr3-dock button')].map(el=>el.getBoundingClientRect());
      const paragraphs=[...root.querySelectorAll('.dr3-reading p')].map(el=>el.getBoundingClientRect());
      return {
        heading:heading.height,options:options.height,footer:footer.height,
        footerSameLine:Math.max(...buttons.map(b=>b.top))-Math.min(...buttons.map(b=>b.top))<2,
        footerTappable:buttons.length===3&&buttons.every(b=>b.height>=44),
        textGutters:paragraphs.every(b=>b.left>=content.left-1&&b.right<=content.right+1&&
          b.left>=19&&b.right<=innerWidth-19),
        contentPadding:getComputedStyle(root.querySelector('.dr3-content')).paddingLeft,
        noOverflow:document.documentElement.scrollWidth<=innerWidth+2,
        readerWidth:root.getBoundingClientRect().width
      };
    });
    expect(measure.heading).toBeLessThan(103);
    expect(measure.options).toBeLessThan(55);
    expect(measure.footer).toBeLessThan(85);
    expect(measure.footerSameLine).toBe(true);
    expect(measure.footerTappable).toBe(true);
    expect(measure.textGutters).toBe(true);
    expect(parseFloat(measure.contentPadding)).toBeGreaterThanOrEqual(20);
    expect(measure.noOverflow).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('checkbox layers are independently selectable and cannot all be hidden',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openDua(page);
  const pron=page.locator('[data-dr3-layer="pron"]');
  const meaning=page.locator('[data-dr3-layer="meaning"]');
  await expect(pron).toBeChecked();
  await expect(meaning).toBeChecked();
  await pron.uncheck();
  await expect(page.locator('.dr3-pron')).toHaveCount(0);
  await expect(page.locator('.dr3-meaning')).toBeVisible();
  await page.locator('[data-dr3-layer="meaning"]').click();
  // The last visible layer is intentionally protected from being hidden.
  await expect(page.locator('[data-dr3-layer="meaning"]')).toBeChecked();
  await page.locator('[data-dr3-layer="pron"]').check();
  await expect(page.locator('.dr3-pron')).toBeVisible();
  await expect(page.locator('.dr3-meaning')).toBeVisible();
});

test('font size controls are bounded and saved across reader reload',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openDua(page);
  const initial=await page.locator('.dr3-pron').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  await page.locator('[data-dr3="smaller"]').click();
  await page.locator('[data-dr3="smaller"]').click();
  await expect(page.locator('.dr3-reader')).toHaveClass(/dr3-size-0/);
  await expect(page.locator('[data-dr3="smaller"]')).toBeDisabled();
  const small=await page.locator('.dr3-pron').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(small).toBeLessThan(initial);
  await page.locator('.dr3-header [data-exp="dua-close"]').click();
  await page.reload();
  await page.locator('.nav [data-screen="worship"]').click();
  await page.locator('.ex-more-list [data-screen="duas"]').click();
  await page.locator('.dc-dua-row[data-id="wellness-ayyub"]').click();
  await expect(page.locator('.dr3-reader')).toHaveClass(/dr3-size-0/);
  expect(await page.locator('.dr3-pron').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBe(small);
  expect(await page.evaluate(()=>localStorage.getItem('dhikr_dubai_reading_size_v3'))).toBeNull();
});

test('personal Bengali Dua has correct labeling and does not get invented Arabic',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openDua(page,'work-personal');
  await expect(page.locator('.dr3-heading')).toContainText('হালাল ব্যবসায়');
  await expect(page.locator('.dr3-source')).toContainText('নিজের ভাষায়');
  await expect(page.locator('.dr3-option')).toContainText(['দোয়া','ব্যাখ্যা']);
  await expect(page.locator('.dr3-arabic,.dr3-arabic-note')).toHaveCount(0);
  await expect(page.locator('.dr3-pron')).toContainText('হে আল্লাহ');
});

test('Save records once, does not toggle off, and keeps three navigation actions',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await openDua(page);
  await expect(page.locator('[data-dr3="save"]')).toContainText('সেভ করুন');
  await page.locator('[data-dr3="save"]').click();
  await expect(page.locator('[data-dr3="save"]')).toContainText('আজ পড়েছেন');
  await expect(page.locator('[data-dr3="save"]')).toBeDisabled();
  const first=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('dhikr_dubai_dua_v5'));
    return Object.values(d).flat();
  });
  expect(first.filter(id=>id==='wellness-ayyub')).toHaveLength(1);
  await page.locator('[data-dr3="next"]').click();
  await expect(page.locator('.dr3-heading')).toContainText('শিফা');
  await page.locator('[data-dr3="previous"]').click();
  await expect(page.locator('[data-dr3="save"]')).toContainText('আজ পড়েছেন');
  const next=await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('dhikr_dubai_dua_v5'));
    return Object.values(d).flat();
  });
  expect(next.filter(id=>id==='wellness-ayyub')).toHaveLength(1);
});

test('navigation follows the filtered category rather than duplicating entries',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="worship"]').click();
  await page.locator('.ex-more-list [data-screen="duas"]').click();
  await page.locator('[data-dualib="expand"]').click();
  await page.locator('.dl2-cat[data-category="health-healing"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(4);
  await page.locator('.dc-dua-row').first().click();
  await expect(page.locator('.dr3-heading')).toContainText('কষ্ট');
  await expect(page.locator('[data-dr3="previous"]')).toBeDisabled();
  await page.locator('[data-dr3="next"]').click();
  await expect(page.locator('.dr3-heading')).toContainText('শিফা');
  await expect(page.locator('[data-dr3="next"]')).toBeEnabled(); // Two more source-linked healing duas follow.
  await page.locator('.dr3-header [data-exp="dua-close"]').click();
  await expect(page.locator('.dl2-page')).toBeVisible();
  await expect(page.locator('.dc-dua-row')).toHaveCount(4);
  await expect(page.locator('.dl2-cat[data-category="health-healing"]')).toHaveAttribute('aria-pressed','true');
});

test('header library list opens a searchable bottom sheet and supports selection/Escape',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openDua(page);
  await page.locator('[data-dr3="list"]').click();
  await expect(page.locator('.dr3-sheet[role="dialog"]')).toBeVisible();
  await expect(page.locator('.dr3-sheet-list [data-dr3="select"]')).toHaveCount(81);
  await page.locator('#dr3-list-search').fill('ঋণ');
  await expect(page.locator('.dr3-sheet-list [data-id="rizq-halal"]:visible')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.dr3-sheet')).toHaveCount(0);
  await page.locator('[data-dr3="list"]').click();
  await page.locator('.dr3-sheet-list [data-id="family-calm"]').click();
  await expect(page.locator('.dr3-heading')).toContainText('পরিবার');
  await expect(page.locator('.dr3-sheet')).toHaveCount(0);
});

test('reader opens and closes with Phase 2 Favorites and Recently Read intact',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="worship"]').click();
  await page.locator('.ex-more-list [data-screen="duas"]').click();
  await page.locator('.dl2-fav[data-id="rizq-need"]').click();
  await page.locator('.dc-dua-row[data-id="rizq-need"]').click();
  await expect(page.locator('.dr3-reader')).toBeVisible();
  await page.locator('.dr3-header [data-exp="dua-close"]').click();
  await page.locator('.dl2-scopes [data-scope="favorites"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(1);
  await page.locator('.dl2-scopes [data-scope="recent"]').click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(1);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dhikr_dua_favorites_v1')))).toEqual(['rizq-need']);
});
