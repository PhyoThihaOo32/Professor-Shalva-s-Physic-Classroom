import {expect} from '@playwright/test';
import {test} from './fixtures';

test('original practice replaces missing questions and labels every authored figure and value set',async({page})=>{
 const requests:string[]=[];page.on('request',r=>{if(r.method()==='POST')requests.push(r.url());});
 await page.goto('/library?chapter=chapter-3&student=bart-v1');
 await expect(page.locator('.problem-toggle')).toHaveCount(12);await expect(page.locator('.pending-problem')).toHaveCount(0);
 for(const [slug,title] of [['vector-differences','Subtracting two vectors'],['vector-combinations','Combining three vectors'],['drone-route','A drone changes course'],['projectile','Launch, rise, and land'],['river-crossing','Across a moving river']]){
  await page.goto(`/problems/ch3-original-${slug}?student=bart-v1`);
  await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await expect(page.locator('.reference-edition')).toContainText('Original practice');
  await expect(page.locator('.original-practice-diagram svg')).toBeVisible();
  for(let i=0;i<7;i++)await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.locator('.solution-position')).toHaveText('Step 8 of 8');
  await expect(page.locator('.solution-slide .katex').first()).toBeVisible();
  await expect(page.locator('.solution-slide .equation-prose')).toHaveCount(0);
 }
 await page.goto('/library?student=bart-v1');await expect(page.locator('.problem-toggle')).toHaveCount(10);
 await page.getByRole('button',{name:/Reading a position–time graph/}).click();
 await expect(page.locator('.reference-edition')).toContainText('Original practice');
 await expect(page.locator('.original-practice-diagram svg polyline')).toBeVisible();
 expect(requests).toEqual([]);
});

test('all six original figures have readable labels and intact math on a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 const ids=['ch3-original-vector-differences','ch3-original-vector-combinations','ch3-original-drone-route','ch3-original-projectile','ch3-original-river-crossing','ch2-original-position-graph'];
 for(const id of ids){
  await page.goto(`/problems/${id}`);const svg=page.locator('.original-practice-diagram svg');await expect(svg).toBeVisible();
  const geometry=await svg.evaluate(node=>{
   const labels=Array.from(node.querySelectorAll('text')).map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,width:b.width,height:b.height};});
   return {outside:labels.filter(a=>a.x<0||a.y<0||a.x+a.width>500||a.y+a.height>320).map(a=>a.text),overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.x<b.x+b.width-1&&a.x+a.width>b.x+1&&a.y<b.y+b.height-1&&a.y+a.height>b.y+1).map(b=>`${a.text} / ${b.text}`))};
  });expect(geometry.outside).toEqual([]);expect(geometry.overlaps).toEqual([]);
  for(let i=0;i<7;i++)await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.locator('.solution-slide .katex-error')).toHaveCount(0);await expect(page.locator('.solution-slide .equation-prose')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo({top:0,behavior:'instant'});});
  await page.waitForFunction(()=>window.scrollY===0);
  await page.screenshot({path:`docs/screenshots/${id}-mobile.png`,fullPage:true,animations:'disabled'});
 }
});
