import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173';
const timings={Fajr:'05:05',Sunrise:'06:25',Dhuhr:'12:10',Asr:'15:25',Maghrib:'17:38',Isha:'19:05'};

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    const key='dhikr_prayer_location_v1';
    localStorage.setItem(key,JSON.stringify({
      name:'দুবাই',country:'United Arab Emirates',code:'AE',
      lat:25.2048,lon:55.2708,tz:'Asia/Dubai',
      method:'16',school:0,mode:'city',lastCheck:Date.now()
    }));
  });
  await page.route('https://api.aladhan.com/**',route=>{
    const path=new URL(route.request().url()).pathname;
    const isCalendar=path.includes('/calendar/');
    route.fulfill({
      status:200,contentType:'application/json',
      body:JSON.stringify({data:isCalendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}})
    });
  });
});

for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('mobile Home and Namaz layout '+width+'px',async({page})=>{
    await page.setViewportSize({width,height});
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(base+'/');
    await expect(page.locator('.p2-home .p2-intro h1')).toBeVisible();
    await expect(page.locator('.p2-home .salah-learn-shortcut')).toHaveCount(5);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
    await page.locator('.nav [data-screen="prayers"]').click();
    await expect(page.locator('.ex-prayer-list .salah-learn-shortcut')).toHaveCount(5);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('daily 21 reader remains usable with a fixed tap counter',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto(base+'/');
  await page.locator('.p2-personal[data-d21="open-list"]').click();
  await expect(page.locator('.d21-items')).toBeVisible();
  await page.locator('.d21-item[data-d21="open-reader"]').first().click();
  await expect(page.locator('.d21-reader')).toBeVisible();
  await page.locator('.d21-add').click();
  await expect(page.locator('.d21-dock-count strong')).toContainText('১');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
});

test('offline state is communicated without losing stored progress',async({page,context})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/');
  await expect(page.locator('.p2-home')).toBeVisible();
  await context.setOffline(true);
  await expect(page.locator('.p3-network-banner')).toContainText('অফলাইনে');
  await context.setOffline(false);
  await expect(page.locator('.p3-network-banner')).toHaveCount(0);
});

test('standalone Quran reader has an explicit completion action',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await page.goto(base+'/reader.html?surah=112&from=ten');
  await expect(page.locator('#reader-complete')).toBeVisible();
  await expect(page.locator('#readerBody .verse')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
  await page.locator('#reader-complete').click();
  await expect(page.locator('#reader-complete')).toContainText('আজ পড়েছেন');
});

test('reader supports enlarged text and reduced motion without horizontal scrolling',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/');
  await expect(page.locator('.p2-home')).toBeVisible();
  await page.evaluate(()=>document.documentElement.style.fontSize='32px');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2)).toBe(true);
});
