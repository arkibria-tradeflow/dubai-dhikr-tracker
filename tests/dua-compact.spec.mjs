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

async function openDuas(page){
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="duas"]').click();
  await expect(page.locator('.dc-dua-page')).toBeVisible();
}

for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('Dua header is compact and first reading is visible at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await openDuas(page);
    await expect(page.locator('#dc-title')).toHaveText('দোয়া সংগ্রহ');
    await expect(page.locator('.ex-dua-banner')).toHaveCount(0);
    await expect(page.locator('.dc-dua-page h1')).toHaveCount(1);
    await expect(page.locator('.dl2-total')).toContainText('১১');
    await expect(page.locator('.dc-dua-row')).toHaveCount(11);
    const layout=await page.evaluate(()=>{
      const first=document.querySelector('.dc-dua-row');
      return {
        top:first.getBoundingClientRect().top,
        navTop:document.querySelector('.nav').getBoundingClientRect().top,
        header:document.querySelector('.dc-dua-page .ex-top').getBoundingClientRect().height,
        width:document.documentElement.scrollWidth,
        viewport:innerWidth
      };
    });
    expect(layout.top).toBeGreaterThan(0);
    expect(page.locator('.dl2-directory')).toBeTruthy();
    expect(layout.header).toBeLessThan(92);
    expect(layout.width).toBeLessThanOrEqual(layout.viewport+2);
    expect(errors).toEqual([]);
  });
}

test('search filters the dua list without losing input focus and can be cleared',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openDuas(page);
  const field=page.locator('#dc-dua-search');
  await field.fill('তিরমিজি');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(1);
  await expect(page.locator('#dc-search-status')).toContainText('১টি পাওয়া গেছে');
  await expect(field).toBeFocused();
  await field.fill('');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(11);
  await expect(field).toBeFocused();
  await field.fill('এমনকোনোদোয়ানেই');
  await expect(page.locator('#dc-dua-empty')).toBeVisible();
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(0);
  await field.fill('');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(11);
});

test('topic pills filter correctly and preserve search and active state',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openDuas(page);
  const work=page.locator('.dc-filter-scroll [data-filter="work"]');
  await work.click();
  await expect(page.locator('.dc-dua-row')).toHaveCount(2);
  await expect(page.locator('.dc-filter-scroll [data-filter="work"]')).toHaveAttribute('aria-pressed','true');
  const query=page.locator('#dc-dua-search');
  await query.fill('জ্ঞান');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(1);
  await page.locator('.dc-filter-scroll [data-filter="family"]').click();
  await expect(page.locator('#dc-dua-search')).toHaveValue('জ্ঞান');
  await expect(page.locator('#dc-dua-empty')).toBeVisible();
  await page.locator('#dc-dua-search').fill('');
  await expect(page.locator('.dc-dua-row:visible')).toHaveCount(2);
  await expect(page.locator('.dc-filter-scroll [data-filter="family"]')).toHaveAttribute('aria-pressed','true');
});

test('Dua reader navigation and saved daily count still work',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openDuas(page);
  await page.locator('.dc-dua-row').first().click();
  await expect(page.locator('.ex-reader')).toBeVisible();
  await page.locator('.ex-reader [data-exp="dua-close"]').first().click();
  await expect(page.locator('.dc-dua-page')).toBeVisible();
  await page.evaluate(()=>{
    dudb={...dudb,[dayInfo().day]:['rizq-need','rizq-halal']};
    render();
  });
  await expect(page.locator('.dc-counts')).toContainText('আজ পড়েছেন ২টি');
});

test('settings entry remains reachable from compact Dua page',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await openDuas(page);
  await page.locator('.dc-dua-page .ex-top-action[data-screen="settings"]').click();
  await expect(page.locator('.settings-card')).toHaveCount(4);
});
