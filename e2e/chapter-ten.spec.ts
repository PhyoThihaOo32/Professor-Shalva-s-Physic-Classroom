import {expect} from '@playwright/test';
import {test,anonymousTest} from './fixtures';
import type {Page} from '@playwright/test';
async function capture(page:Page,path:string){
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo({top:0,behavior:'instant'});});
 await page.waitForFunction(()=>window.scrollY===0);
 await page.screenshot({path,fullPage:true,animations:'disabled'});
}

test('Chapter 10 keeps its own rotational guide, lecture slides, and return context',async({page})=>{
 const mutations:string[]=[];page.on('request',r=>{if(r.method()==='POST')mutations.push(r.url());});
 await page.goto('/library?student=bart-v1');
 const chapters=page.getByRole('navigation',{name:'Problem chapters'});
 await chapters.getByRole('link',{name:'10 Rotational motion'}).click();
 await expect(page).toHaveURL(/\/library\?chapter=chapter-10&student=bart-v1$/);
 await expect(page.getByRole('heading',{name:'Rotational Motion',exact:true})).toBeVisible();
 await expect(page.locator('.problem-toggle')).toHaveCount(25);
 await capture(page,'docs/screenshots/chapter-ten-library.png');
 await expect(page.getByText('Supplied problem 7 · Circular motion', {exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Professor Shalva’s problem-solving guide'}).click();
 await expect(page).toHaveURL(/\/library\/guide\?chapter=chapter-10&student=bart-v1$/);
 await expect(page.locator('.guide-heading')).toContainText('Chapter 10 · Solving problems in rotational dynamics');
 await expect(page.locator('.problem-guide-steps li')).toHaveCount(8);
 await expect(page.getByRole('heading',{name:'Draw each free-body diagram'})).toBeVisible();
 await page.getByText('View Professor Shalva’s lecture slides',{exact:true}).click();
 const slides=page.locator('.guide-lecture-slides img');await expect(slides).toHaveCount(2);
 for(const img of await slides.all())await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).complete&&(el as HTMLImageElement).naturalWidth>0)).toBe(true);
 await capture(page,'docs/screenshots/chapter-ten-guide.png');
 await page.reload();await expect(page.locator('.problem-guide-steps li')).toHaveCount(8);
 await page.getByRole('link',{name:'Problems',exact:true}).last().click();
 await expect(page).toHaveURL(/\/library\?chapter=chapter-10&student=bart-v1$/);
 await page.getByRole('button',{name:/Opening a door at two force angles/}).click();
 await expect(page.locator('.rotation-diagram svg')).toBeVisible();
 await page.getByRole('link',{name:'Open full page'}).click();
 await expect(chapters.getByRole('link',{name:'10 Rotational motion'})).toHaveAttribute('aria-current','page');
 for(let i=0;i<7;i++)await page.getByRole('button',{name:'Next',exact:true}).click();
 await expect(page.locator('.solution-slide')).toContainText('35.52');
 await page.getByRole('link',{name:'Problems',exact:true}).last().click();
 await chapters.getByRole('link',{name:'07 Work & energy'}).click();
 await page.getByRole('link',{name:'Professor Shalva’s problem-solving guide'}).click();
 await expect(page.locator('.problem-guide-steps li')).toHaveCount(9);
 await expect(page.locator('.guide-lecture-slides')).toHaveCount(0);
 expect(mutations).toEqual([]);
});

test('Chapter 10 figures and all worked steps fit a phone',async({page})=>{
 test.setTimeout(240000);
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/library?chapter=chapter-10');
 await expect(page.locator('.problem-toggle')).toHaveCount(25);
 const links=await page.locator('.problem-toggle').evaluateAll(nodes=>nodes.map(n=>'/problems/'+n.id.replace(/^toggle-/,'')));
 for(const href of links){
  await page.goto(href);const svg=page.locator('.rotation-diagram svg');await expect(svg).toBeVisible();
  const geometry=await svg.evaluate(node=>{
   const labels=Array.from(node.querySelectorAll('text')).map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,w:b.width,h:b.height};});
   return {outside:labels.filter(a=>a.x<0||a.y<0||a.x+a.w>500||a.y+a.h>340).map(a=>a.text),overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.x<b.x+b.w-1&&a.x+a.w>b.x+1&&a.y<b.y+b.h-1&&a.y+a.h>b.y+1).map(b=>a.text+' / '+b.text))};
  });
  expect.soft(geometry.outside,href).toEqual([]);expect.soft(geometry.overlaps,href).toEqual([]);
  for(let i=0;i<8;i++){
   await expect(page.locator('.solution-position')).toHaveText('Step '+(i+1)+' of 8');
   await expect(page.locator('.solution-slide .katex-error')).toHaveCount(0);
   await expect(page.locator('.solution-slide .equation-prose')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),href+' step '+(i+1)).toBe(true);
   if(i<7)await page.getByRole('button',{name:'Next',exact:true}).click();
  }
  if(href.includes('original-'))await expect(page.locator('.reference-edition')).toContainText('Original practice');
  if(href.includes('original-compound-wheel')||href.includes('original-rolling-velocities')){
   const name=href.includes('compound')?'compound':'rolling';
   await capture(page,'docs/screenshots/chapter-ten-'+name+'-phone.png');
  }
 }
 await page.goto('/library/guide?chapter=chapter-10');
 await page.getByText('View Professor Shalva’s lecture slides',{exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await capture(page,'docs/screenshots/chapter-ten-guide-phone.png');
});

anonymousTest('Chapter 10 deep links preserve the destination through sign-in',async({page})=>{
 for(const path of ['/library?chapter=chapter-10&student=bart-v1','/library/guide?chapter=chapter-10&student=bart-v1','/problems/ch10-original-compound-wheel']){
  await page.goto(path);await expect(page).toHaveURL(/\/login\?/);
  expect(new URL(page.url()).searchParams.get('next')).toBe(path);
 }
});
