import {test,expect} from '@playwright/test';

const base='http://127.0.0.1:4173';
const local='/reader.html?surah=112&from=ten';
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

async function showLocal(page,width,height){
  await page.setViewportSize({width,height});
  await page.goto(base+local);
  await expect(page.locator('.uv-ayah')).toHaveCount(4);
}

for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('compact reader has no clipped Arabic and slimmer controls at '+width+'px',async({page})=>{
    const errors=[];page.on('pageerror',err=>errors.push(err.message));
    await showLocal(page,width,height);
    await expect(page.locator('#back')).toHaveText('✕');
    await expect(page.locator('#back')).toHaveAttribute('aria-label',/বন্ধ/);
    const measurements=await page.evaluate(()=>{
      const scroll=document.getElementById('scroll');
      const rows=[...document.querySelectorAll('.uv-ayah')];
      const footer=document.getElementById('footer');
      const controls=document.getElementById('modes');
      const boxes=[...document.querySelectorAll('.uv-options label')];
      const els=[...document.querySelectorAll('.uv-arabic')];
      const safe=els.every(el=>{
        const r=el.getBoundingClientRect();
        const parent=el.closest('.uv-ayah-text').getBoundingClientRect();
        return r.left>=parent.left-1&&r.right<=parent.right+1
          &&el.scrollWidth<=el.clientWidth+2&&r.left>=-1&&r.right<=innerWidth+1;
      });
      const visible=footer.getBoundingClientRect();
      return {
        safe,
        noDocumentOverflow:document.documentElement.scrollWidth<=innerWidth+2,
        firstRowInside:rows[0].getBoundingClientRect().left>=-1,
        footerHeight:visible.height,
        toolbarHeight:controls.getBoundingClientRect().height,
        checkboxTargets:boxes.every(x=>x.getBoundingClientRect().height>=44),
        verseGap:parseFloat(getComputedStyle(rows[0].querySelector('.uv-ayah-text')).rowGap),
        contentWidth:scroll.clientWidth
      };
    });
    expect(measurements.safe).toBe(true);
    expect(measurements.noDocumentOverflow).toBe(true);
    expect(measurements.firstRowInside).toBe(true);
    expect(measurements.footerHeight).toBeLessThan(70);
    expect(measurements.toolbarHeight).toBeLessThan(58);
    expect(measurements.checkboxTargets).toBe(true);
    expect(measurements.verseGap).toBeLessThanOrEqual(6);
    expect(errors).toEqual([]);
  });
}

test('X closes the reader and keeps the library category',async({page})=>{
  await showLocal(page,375,812);
  await page.locator('#back').click();
  await expect(page).toHaveURL(/view=quran/);
  await expect(page.locator('.qc-quran-page')).toBeVisible();
});

test('previous / save / next stay in one compact row and preserve recorded completion',async({page})=>{
  await showLocal(page,320,568);
  const boxes=await page.evaluate(()=>['prev','reader-complete','next'].map(id=>{
    const r=document.getElementById(id).getBoundingClientRect();
    return {top:r.top,left:r.left,right:r.right,height:r.height};
  }));
  expect(Math.max(...boxes.map(x=>x.top))-Math.min(...boxes.map(x=>x.top))).toBeLessThan(2);
  expect(boxes[0].right).toBeLessThanOrEqual(boxes[1].left+2);
  expect(boxes[1].right).toBeLessThanOrEqual(boxes[2].left+2);
  expect(boxes.every(x=>x.height>=44)).toBe(true);
  await page.locator('#reader-complete').click();
  await expect(page.locator('#reader-complete')).toContainText('আজ পড়েছেন');
  await page.locator('#next').click();
  await expect(page).toHaveURL(/surah=113/);
  await expect(page.locator('#reader-complete')).toContainText('সেভ করুন');
});

async function mockLongSurah(page){
  const baseLine='إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِقَوْمٍ يَتَفَكَّرُونَ';
  const long=Array(16).fill(baseLine).join(' ');
  await page.route('https://api.alquran.cloud/v1/surah/78/**',route=>{
    const meaning=route.request().url().includes('bn.bengali');
    const ayahs=Array.from({length:40},(_,i)=>({
      text:meaning?'অর্থ '+(i+1):i===0?
        'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ عَمَّ يَتَسَاءَلُونَ':
        i===2?long:'عَنِ النَّبَإِ الْعَظِيمِ'
    }));
    route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({data:{ayahs}})});
  });
}

test('long Arabic verse wraps inside its own row and gets smaller without shrinking short rows',async({page})=>{
  await page.setViewportSize({width:320,height:568});
  await mockLongSurah(page);
  await page.goto(base+'/reader.html?surah=78&from=all');
  await expect(page.locator('.uv-ayah')).toHaveCount(40);
  const result=await page.evaluate(()=>{
    const verses=[...document.querySelectorAll('.uv-arabic')];
    const short=verses[1],long=verses[2];
    const font=el=>parseFloat(getComputedStyle(el).fontSize);
    const within=verses.every(el=>{
      const rect=el.getBoundingClientRect();
      const parent=el.closest('.uv-ayah-text').getBoundingClientRect();
      return rect.left>=parent.left-1&&rect.right<=parent.right+1
        &&el.scrollWidth<=el.clientWidth+2;
    });
    const lineHeight=parseFloat(getComputedStyle(long).lineHeight);
    return {
      firstText:verses[0].textContent.trim(),
      standaloneBasmala:document.querySelector('.uv-basmala [lang="ar"]').textContent.trim(),
      within,
      shortFont:font(short),
      longFont:font(long),
      longWrapped:long.getBoundingClientRect().height>lineHeight*2,
      shortUnmodified:short.style.fontSize==='',
      noOverflow:document.documentElement.scrollWidth<=innerWidth+2
    };
  });
  expect(result.firstText).toBe('عَمَّ يَتَسَاءَلُونَ');
  expect(result.standaloneBasmala).toContain('بِسْمِ');
  expect(result.within).toBe(true);
  expect(result.longWrapped).toBe(true);
  expect(result.longFont).toBeLessThan(result.shortFont);
  expect(result.shortUnmodified).toBe(true);
  expect(result.noOverflow).toBe(true);
});

test('long verse resizing remains local after changing reader font level',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await mockLongSurah(page);
  await page.goto(base+'/reader.html?surah=78&from=all');
  await expect(page.locator('.uv-ayah')).toHaveCount(40);
  await page.locator('[data-uv-size="-1"]').click();
  const metrics=await page.evaluate(()=>{
    const [short,_,long]=document.querySelectorAll('.uv-arabic');
    return {
      shortFont:parseFloat(getComputedStyle(short).fontSize),
      longFont:parseFloat(getComputedStyle(long).fontSize),
      noOverflow:[...document.querySelectorAll('.uv-arabic')].every(e=>e.scrollWidth<=e.clientWidth+2)
    };
  });
  expect(metrics.longFont).toBeLessThan(metrics.shortFont);
  expect(metrics.noOverflow).toBe(true);
});

for(const width of [320,375,430]){
  test('Quran display checkboxes have no background cards at '+width+'px',async({page})=>{
    await showLocal(page,width,812);
    const inputs=page.locator('.uv-options input[type="checkbox"]');
    await expect(inputs).toHaveCount(3);
    const appearance=await page.locator('.uv-options').evaluate(toolbar=>{
      const labels=[...toolbar.querySelectorAll('label')];
      return {
        toolbarBackground:getComputedStyle(toolbar).backgroundColor,
        options:labels.map(label=>{
          const style=getComputedStyle(label);
          const r=label.getBoundingClientRect();
          return {
            background:style.backgroundColor,
            borderTop:style.borderTopWidth,
            borderBottom:style.borderBottomWidth,
            height:r.height,
            checked:label.querySelector('input').checked
          };
        })
      };
    });
    expect(appearance.toolbarBackground).toBe('rgba(0, 0, 0, 0)');
    expect(appearance.options).toHaveLength(3);
    for(const option of appearance.options){
      expect(option.background).toBe('rgba(0, 0, 0, 0)');
      expect(option.borderTop).toBe('0px');
      expect(option.borderBottom).toBe('0px');
      expect(option.height).toBeGreaterThanOrEqual(44);
      expect(option.checked).toBe(true);
    }
    await inputs.nth(1).uncheck();
    await expect(inputs.nth(1)).not.toBeChecked();
    const unchecked=await page.locator('.uv-options label').nth(1).evaluate(label=>({
      background:getComputedStyle(label).backgroundColor,
      border:getComputedStyle(label).borderTopWidth
    }));
    expect(unchecked).toEqual({background:'rgba(0, 0, 0, 0)',border:'0px'});
    await inputs.nth(1).check();
    await expect(inputs.nth(1)).toBeChecked();
  });
}
