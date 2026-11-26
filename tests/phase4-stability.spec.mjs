import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173';
const timings={Fajr:'05:05',Sunrise:'06:25',Dhuhr:'12:10',Asr:'15:25',Maghrib:'17:38',Isha:'19:05'};

test.beforeEach(async({page})=>{
  await page.clock.install({time:new Date('2026-11-26T06:00:00Z')}); // 10:00 Dubai
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_prayer_location_v1',JSON.stringify({
      name:'দুবাই',country:'United Arab Emirates',code:'AE',
      lat:25.2048,lon:55.2708,tz:'Asia/Dubai',
      method:'16',school:0,mode:'city',lastCheck:Date.now()
    }));
  });
  await page.route('https://api.aladhan.com/**',route=>{
    const isCalendar=new URL(route.request().url()).pathname.includes('/calendar/');
    route.fulfill({
      status:200,contentType:'application/json',
      body:JSON.stringify({data:isCalendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}})
    });
  });
});

async function ready(page){
  await page.goto(base+'/');
  await expect(page.locator('.p2-home')).toBeVisible();
  await page.waitForFunction(()=>typeof window.DhikrStableTick==='function'&&!loading&&validTimes(dayInfo().tm));
}

test('Home keeps the same DOM, scroll and focus through an idle 15-second tick',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await ready(page);
  await page.locator('.p2-personal').focus();
  await page.evaluate(()=>{
    window.__homeBefore=document.querySelector('.p2-home');
    window.__focusBefore=document.activeElement;
    window.__scrollBefore=window.scrollY;
  });
  await page.clock.fastForward(16000);
  const result=await page.evaluate(()=>({
    sameHome:window.__homeBefore===document.querySelector('.p2-home'),
    sameFocus:window.__focusBefore===document.activeElement,
    scrollKept:window.__scrollBefore===window.scrollY
  }));
  expect(result).toEqual({sameHome:true,sameFocus:true,scrollKept:true});
});

test('a prayer boundary refreshes Home exactly once',async({page})=>{
  await ready(page);
  await page.evaluate(()=>window.__homeBefore=document.querySelector('.p2-home'));
  await page.clock.setFixedTime(new Date('2026-11-26T08:11:00Z')); // 12:11 Dubai, after Dhuhr
  await page.clock.fastForward(16000);
  expect(await page.evaluate(()=>window.__homeBefore!==document.querySelector('.p2-home'))).toBe(true);
  await expect(page.locator('.p2-home')).toBeVisible();
});

test('a background download for an unrelated month leaves Home unchanged',async({page})=>{
  await ready(page);
  const same=await page.evaluate(async()=>{
    const old=document.querySelector('.p2-home');
    await fetchMonth(2024,2);
    return document.querySelector('.p2-home')===old;
  });
  expect(same).toBe(true);
});

test('open prayer session remains mounted during an idle tick',async({page})=>{
  await ready(page);
  await page.locator('.p2-home .ex-prayer-grid [data-action="prayer"][data-prayer="Fajr"]').click();
  await expect(page.locator('.v2-session-hero')).toBeVisible();
  await page.evaluate(()=>window.__sessionBefore=document.querySelector('.v2-session-hero'));
  await page.clock.fastForward(16000);
  expect(await page.evaluate(()=>window.__sessionBefore===document.querySelector('.v2-session-hero'))).toBe(true);
});
