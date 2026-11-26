import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

const base='http://127.0.0.1:4173';
const path='/reader.html?surah=112&from=ten';

async function offline(page,width=375,height=812){
  await page.setViewportSize({width,height});
  await page.goto(base+path);
  await expect(page.locator('#readerBody .uv-ayah')).toHaveCount(4);
  await expect(page.locator('.uv-options [data-uv-layer="ar"]')).toBeChecked();
  await expect(page.locator('.uv-options [data-uv-layer="bn"]')).toBeChecked();
  await expect(page.locator('.uv-options [data-uv-layer="meaning"]')).toBeChecked();
}

for(const [width,height] of [[320,568],[375,812],[430,932]]){
  test('verse layers and three footer actions align on '+width+'px mobile',async({page})=>{
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await offline(page,width,height);
    await expect(page.locator('.uv-arabic')).toHaveCount(4);
    await expect(page.locator('.uv-pron')).toHaveCount(4);
    await expect(page.locator('.uv-meaning')).toHaveCount(4);
    const layout=await page.evaluate(()=>{
      const footer=document.getElementById('footer');
      const prev=document.getElementById('prev').getBoundingClientRect();
      const save=document.getElementById('reader-complete').getBoundingClientRect();
      const next=document.getElementById('next').getBoundingClientRect();
      const row=document.querySelector('.uv-ayah').getBoundingClientRect();
      return {
        allSameRow:Math.abs(prev.top-save.top)<2&&Math.abs(save.top-next.top)<2,
        order:prev.right<=save.left+2&&save.right<=next.left+2,
        footerVisible:footer.getBoundingClientRect().bottom<=innerHeight+2,
        noOverflow:document.documentElement.scrollWidth<=innerWidth+2,
        ayahWidth:row.width,windowWidth:innerWidth,
        saveHeight:save.height
      };
    });
    expect(layout.allSameRow).toBe(true);
    expect(layout.order).toBe(true);
    expect(layout.footerVisible).toBe(true);
    expect(layout.noOverflow).toBe(true);
    expect(layout.saveHeight).toBeGreaterThanOrEqual(44);
    expect(errors).toEqual([]);
  });
}

test('independent checkboxes never hide all three reading layers',async({page})=>{
  await offline(page);
  const ar=page.locator('[data-uv-layer="ar"]');
  const pron=page.locator('[data-uv-layer="bn"]');
  const meaning=page.locator('[data-uv-layer="meaning"]');
  await pron.uncheck();
  await expect(page.locator('.uv-pron')).toHaveCount(0);
  await expect(page.locator('.uv-arabic')).toHaveCount(4);
  await expect(page.locator('.uv-meaning')).toHaveCount(4);
  await meaning.uncheck();
  await expect(page.locator('.uv-meaning')).toHaveCount(0);
  await ar.uncheck();
  await expect(ar).toBeChecked();
  await pron.check();
  await expect(page.locator('.uv-pron')).toHaveCount(4);
  await page.reload();
  await expect(pron).toBeChecked();
  await expect(meaning).not.toBeChecked();
});

test('font controls allow two smaller sizes and retain preference',async({page})=>{
  await offline(page,320,568);
  const font=()=>page.locator('.uv-pron').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  const before=await font();
  await page.locator('[data-uv-size="-1"]').click();
  await page.locator('[data-uv-size="-1"]').click();
  const after=await font();
  expect(after).toBeLessThan(before-2);
  await expect(page.locator('[data-uv-size="-1"]')).toBeDisabled();
  await expect(page.locator('[data-uv-size="1"]')).toBeEnabled();
  await page.reload();
  await expect(page.locator('.uv-pron')).toHaveCount(4);
  expect(await font()).toBeCloseTo(after,1);
});

test('a previous or next click does not mark a surah read, but Save does',async({page})=>{
  await offline(page);
  await expect(page.locator('#reader-complete')).toContainText('সেভ করুন');
  await page.locator('#reader-complete').click();
  await expect(page.locator('#reader-complete')).toContainText('আজ পড়েছেন');
  const stored=await page.evaluate(()=>{
    const v=JSON.parse(localStorage.getItem('dhikr_dubai_quran_v5')||'{}');
    return Object.values(v).flat();
  });
  expect(stored).toContain('112');
  await page.locator('#next').click();
  await expect(page).toHaveURL(/surah=113/);
  await expect(page.locator('.uv-ayah')).toHaveCount(5);
  await expect(page.locator('#reader-complete')).toContainText('সেভ করুন');
});

async function mockOnline(page,failPron=false){
  const n=40;
  await page.route('https://api.alquran.cloud/v1/surah/78/**',route=>{
    const url=route.request().url();
    const meaning=url.includes('bn.bengali');
    const ayahs=Array.from({length:n},(_,i)=>({
      text:meaning?'অর্থ পরীক্ষার আয়াত '+(i+1):'آيَةٌ وَبَيَانٌ '+(i+1)
    }));
    return route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({data:{ayahs}})});
  });
  if(failPron)await page.route('**/bangla-pronunciation-a.json',route=>route.fulfill({status:404}));
}
test('online surah renders all 40 aligned ayahs with verified Bengali pronunciation',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await mockOnline(page);
  await page.goto(base+'/reader.html?surah=78&from=all');
  await expect(page.locator('.uv-ayah')).toHaveCount(40);
  await expect(page.locator('.uv-arabic')).toHaveCount(40);
  await expect(page.locator('.uv-pron')).toHaveCount(40);
  await expect(page.locator('.uv-meaning')).toHaveCount(40);
  await expect(page.locator('[data-uv-layer="bn"]')).toBeEnabled();
  const row=page.locator('.uv-ayah').first();
  await expect(row).toContainText('‘আম্মা');
  await expect(row).toContainText('অর্থ পরীক্ষার আয়াত 1');
  await expect(page.locator('#reader-complete')).toBeEnabled();
});
test('missing verified online pronunciation cannot be enabled or fabricated',async({page})=>{
  await mockOnline(page,true);
  await page.goto(base+'/reader.html?surah=78&from=all');
  await expect(page.locator('.uv-ayah')).toHaveCount(40);
  await expect(page.locator('.uv-arabic')).toHaveCount(40);
  await expect(page.locator('.uv-meaning')).toHaveCount(40);
  await expect(page.locator('.uv-pron')).toHaveCount(0);
  await expect(page.locator('[data-uv-layer="bn"]')).toBeDisabled();
  await expect(page.locator('.uv-unavailable')).toBeVisible();
  await expect(page.locator('#reader-complete')).toBeEnabled();
});