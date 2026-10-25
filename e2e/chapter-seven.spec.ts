import {expect} from '@playwright/test';
import {test,anonymousTest} from './fixtures';

test('Chapter 7 lists thirteen exercises and keeps chapter context across references and guide',async({page})=>{
 const mutations:string[]=[];page.on('request',r=>{if(r.method()==='POST')mutations.push(r.url());});
 await page.goto('/library?student=bart-v1');
 const chapters=page.getByRole('navigation',{name:'Problem chapters'});
 await chapters.getByRole('link',{name:'07 Work & energy'}).click();
 await expect(page.getByRole('heading',{name:'Work and Energy',exact:true})).toBeVisible();
 await expect(page.locator('.problem-toggle')).toHaveCount(13);
 await expect(page.locator('.pending-problem')).toHaveCount(0);
 await expect(page.locator('.problem-toggle').filter({hasText:'Original practice'})).toHaveCount(2);
 await page.reload();await expect(chapters.getByRole('link',{name:'07 Work & energy'})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:'Professor Shalva’s problem-solving guide'}).click();
 await expect(page).toHaveURL(/\/library\/guide\?chapter=chapter-7&student=bart-v1$/);
 await page.getByRole('link',{name:'Problems',exact:true}).last().click();
 await page.getByRole('button',{name:/Stretching a spring a little farther/}).click();
 await expect(page).toHaveURL(/\/library\?chapter=chapter-7&student=bart-v1#problem-ch7-spring-work$/);
 await page.getByRole('link',{name:'Open full page',exact:true}).click();
 await expect(chapters.getByRole('link',{name:'07 Work & energy'})).toHaveAttribute('aria-current','page');
 await expect(page.locator('.eyebrow')).toContainText('CHAPTER 7 · PROBLEM 37');
 await expect(page.locator('[data-work-area="trapezoid"]')).toBeVisible();
 for(let i=0;i<7;i++)await page.getByRole('button',{name:'Next',exact:true}).click();
 await expect(page.locator('.solution-position')).toHaveText('Step 8 of 8');
 await expect(page.locator('.solution-slide')).toContainText('+0.15 J');
 await page.getByRole('link',{name:'Problems',exact:true}).last().click();
 await expect(page).toHaveURL(/\/library\?chapter=chapter-7&student=bart-v1$/);
 expect(mutations).toEqual([]);
});

test('all Chapter 7 diagrams and every solution step stay readable on a phone',async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/library?chapter=chapter-7');
 await expect(page.locator('.problem-toggle')).toHaveCount(13);
 const links=await page.locator('.problem-toggle').evaluateAll(nodes=>nodes.map(n=>'/problems/'+n.id.replace(/^toggle-/,'')));
 expect(links).toHaveLength(13);
 for(const href of links){
  await page.goto(href);const svg=page.locator('.energy-diagram svg');await expect(svg).toBeVisible();
  const geometry=await svg.evaluate(node=>{
   const labels=Array.from(node.querySelectorAll('text')).map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,width:b.width,height:b.height};});
   return {outside:labels.filter(a=>a.x<0||a.y<0||a.x+a.width>500||a.y+a.height>320).map(a=>a.text),overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.x<b.x+b.width-1&&a.x+a.width>b.x+1&&a.y<b.y+b.height-1&&a.y+a.height>b.y+1).map(b=>a.text+' / '+b.text))};
  });expect(geometry.outside,href).toEqual([]);expect(geometry.overlaps,href).toEqual([]);
  for(let i=0;i<8;i++){
   await expect(page.locator('.solution-position')).toHaveText('Step '+(i+1)+' of 8');
   await expect(page.locator('.solution-slide .katex-error')).toHaveCount(0);
   await expect(page.locator('.solution-slide .equation-prose')).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),href).toBe(true);
   if(i<7)await page.getByRole('button',{name:'Next',exact:true}).click();
  }
  if(href.includes('original-gondola')||href.includes('original-dot-combinations'))await expect(page.locator('.reference-edition')).toContainText('Original practice');
  if(href.includes('ramp-cart')||href.includes('spring-work')){
   await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo({top:0,behavior:'instant'});});
   await page.waitForFunction(()=>window.scrollY===0);
   const name=href.includes('ramp-cart')?'ramp':'spring';
   await page.screenshot({path:'docs/screenshots/chapter-seven-'+name+'-mobile.png',fullPage:true,animations:'disabled'});
  }
 }
});

anonymousTest('Chapter 7 deep links return through sign-in',async({page})=>{
 await page.goto('/library?chapter=chapter-7&student=bart-v1');
 await expect(page).toHaveURL(/\/login\?/);
 expect(new URL(page.url()).searchParams.get('next')).toBe('/library?chapter=chapter-7&student=bart-v1');
});
