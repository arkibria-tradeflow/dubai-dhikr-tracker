import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173';
const timings={Fajr:'05:05',Sunrise:'06:25',Dhuhr:'12:10',Asr:'15:25',Maghrib:'17:38',Isha:'19:05'};

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('dhikr_prayer_location_v1',JSON.stringify({
      name:'দুবাই',country:'United Arab Emirates',code:'AE',
      lat:25.2048,lon:55.2708,tz:'Asia/Dubai',method:'16',school:0,mode:'city',lastCheck:Date.now()
    }));
  });
  await page.route('https://api.aladhan.com/**',route=>{
    const calendar=new URL(route.request().url()).pathname.includes('/calendar/');
    route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({data:calendar?[]:{timings,meta:{timezone:'Asia/Dubai'}}})
    });
  });
});

async function openQuran(page){
  await page.goto(base+'/');
  await page.locator('.nav [data-screen="quran"]').click();
  await expect(page.locator('.qc-quran-page')).toBeVisible();
}

for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('compact Quran header shows first surah without excessive scrolling at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height});
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await openQuran(page);
    await expect(page.locator('#qc-title')).toHaveText('আল-কুরআন');
    await expect(page.locator('.qc-today')).toContainText('আজ পড়েছেন');
    await expect(page.locator('.ex-quran-banner')).toHaveCount(0);
    await expect(page.locator('.qc-quran-page h1')).toHaveCount(1);
    await expect(page.locator('.qc-quran-page .ex-surah-row[href]')).toHaveCount(30);
    const layout=await page.evaluate(()=>{
      const first=document.querySelector('.qc-quran-page .ex-surah-row[href]');
      const nav=document.querySelector('.nav');
      const top=first.getBoundingClientRect().top;
      return {
        top,
        bottomLimit:nav.getBoundingClientRect().top,
        headerHeight:document.querySelector('.qc-quran-page .ex-top').getBoundingClientRect().height,
        scrollWidth:document.documentElement.scrollWidth,
        windowWidth:innerWidth
      };
    });
    expect(layout.top).toBeLessThan(layout.bottomLimit-4);
    expect(layout.headerHeight).toBeLessThan(90);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.windowWidth+2);
    expect(errors).toEqual([]);
  });
}

test('surah filters and navigation stay functional after compact layout',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await openQuran(page);
  await page.locator('#ex-search-surah').fill('112');
  await expect(page.locator('.qc-quran-page .ex-surah-row[href]:visible')).toHaveCount(1);
  await page.locator('#ex-search-surah').fill('');
  await page.locator('[data-exp="quran-tab"][data-tab="all"]').click();
  await expect(page.locator('.qc-quran-page .ex-surah-row')).toHaveCount(114);
  await expect(page.locator('.qc-quran-page .ex-surah-row[href]')).toHaveCount(30);
  await expect(page.locator('.qc-quran-page .ex-surah-row.ex-unavailable')).toHaveCount(84);
  const href=await page.locator('.qc-quran-page .ex-surah-row[href]').first().getAttribute('href');
  expect(href).toContain('reader.html?surah=78&from=all');
  await page.locator('.qc-quran-page .ex-top-action[data-screen="settings"]').click();
  await expect(page.locator('.settings-card')).toHaveCount(4);
});

test('daily progress is live from existing saved Quran records',async({page})=>{
  await openQuran(page);
  await page.evaluate(()=>{
    const today=dayInfo().day;
    qdb={...qdb,[today]:['103','112','114']};
    render();
  });
  await expect(page.locator('.qc-today strong')).toContainText('৩');
  await expect(page.locator('.qc-quran-page .ex-surah-row[href]')).toHaveCount(30);
});
