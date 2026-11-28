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
    route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({data:calendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}})
    });
  });
});
async function open(page,tab='duas'){
  await page.goto(base+'/');
  if(tab==='duas'){
    await page.locator('.nav [data-screen="worship"]').click();
    await page.locator('.ex-more-list [data-screen="duas"]').click();
  }else await page.locator('.nav [data-screen="'+tab+'"]').click();
  await expect(page.locator('#smart-mobile-header')).toHaveCount(1);
  await page.evaluate(()=>document.documentElement.style.scrollBehavior='auto');
}
async function scroll(page,to){
  await page.evaluate(y=>window.scrollTo(0,y),to);
  await page.waitForTimeout(290); // Allow the 200 ms smart-header slide animation to settle.
}
for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('smart Dua header appears when scrolling UP, hides DOWN at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await open(page);
    await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
    const total=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
    expect(total).toBeGreaterThan(400);
    const lower=Math.min(850,total-80);
    await scroll(page,lower);
    await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
    await scroll(page,lower-145);
    await expect(page.locator('#smart-mobile-header')).toHaveClass(/is-visible/);
    const geometry=await page.evaluate(()=>{
      const el=document.getElementById('smart-mobile-header');
      return {top:el.getBoundingClientRect().top,position:getComputedStyle(el).position,
        sourceHidden:document.querySelector('.dc-dua-page .ex-top').getAttribute('aria-hidden'),
        overlayAccessible:el.getAttribute('aria-hidden'),
        scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
    });
    expect(geometry.top).toBeGreaterThanOrEqual(-1);
    expect(geometry.top).toBeLessThanOrEqual(1);
    expect(geometry.position).toBe('fixed');
    expect(geometry.sourceHidden).toBe('true');
    expect(geometry.overlayAccessible).toBe('false');
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport+2);
    await scroll(page,lower-60);
    await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
    await expect(page.locator('.nav [data-screen="worship"]')).toHaveAttribute('aria-current','page');
    expect(errors).toEqual([]);
  });
}
test('smart header settings action works and returns to top',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await open(page,'quran');
  await scroll(page,900);
  await scroll(page,670);
  await expect(page.locator('#smart-mobile-header')).toHaveClass(/is-visible/);
  await page.locator('#smart-mobile-header [data-smart-head="top"]').click();
  await page.waitForFunction(()=>window.scrollY<10);
  await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
  await scroll(page,900);
  await scroll(page,660);
  await page.locator('#smart-mobile-header [data-screen="settings"]').click();
  await expect(page.locator('.settings-card')).toHaveCount(4);
  await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
});
test('typing in Dua search does not cover keyboard with smart header',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await open(page,'duas');
  await scroll(page,750);
  await scroll(page,520);
  await expect(page.locator('#smart-mobile-header')).toHaveClass(/is-visible/);
  await page.locator('#dc-dua-search').focus();
  await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
  await page.locator('#dc-dua-search').fill('তিরমিজি');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(1);
  await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
});
test('full-screen Dua reader never shows floating header and original controls work',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await open(page,'duas');
  await scroll(page,750);
  await scroll(page,520);
  await expect(page.locator('#smart-mobile-header')).toHaveClass(/is-visible/);
  await page.locator('.dc-dua-row').first().click();
  await expect(page.locator('.ex-reader')).toBeVisible();
  await expect(page.locator('#smart-mobile-header')).not.toHaveClass(/is-visible/);
  await expect(page.locator('.ex-reader [data-exp="dua-close"]').first()).toBeVisible();
  await page.locator('.ex-reader [data-exp="dua-close"]').first().click();
  await expect(page.locator('.dc-dua-page')).toBeVisible();
});
test('smart header remains hidden on desktop and preserves history',async({page})=>{
  await page.setViewportSize({width:1024,height:768});
  await open(page,'duas');
  await scroll(page,730);
  await scroll(page,510);
  await expect(page.locator('#smart-mobile-header')).toBeHidden();
  await expect(page.locator('.dc-dua-page')).toBeVisible();
});
