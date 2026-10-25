import {expect} from '@playwright/test';
import {test,anonymousTest} from './fixtures';

test('chapter selection, worked references, and original practice survive navigation',async({page})=>{
 const mutations:string[]=[];page.on('request',request=>{if(request.method()==='POST')mutations.push(request.url());});
 await page.goto('/library?student=bart-v1');
 const chapters=page.getByRole('navigation',{name:'Problem chapters'});
 await expect(chapters.getByRole('link')).toHaveCount(4);
 await chapters.getByRole('link',{name:'03 Vectors & projectiles'}).click();
 await expect(page.getByRole('heading',{name:'Kinematics in Two or Three Dimensions; Vectors'})).toBeVisible();
 await expect(page.locator('.problem-list a')).toHaveCount(12);
 await expect(page.locator('.pending-problem')).toHaveCount(0);
 await expect(page.locator('.problem-list a').filter({hasText:'Original practice'})).toHaveCount(5);
 await page.reload();await expect(chapters.getByRole('link',{name:'03 Vectors & projectiles'})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:'Professor Shalva’s problem-solving guide'}).click();
 await expect(page).toHaveURL(/\/library\/guide\?chapter=chapter-3&student=bart-v1$/);
 await page.getByRole('link',{name:'Problems',exact:true}).last().click();
 await expect(chapters.getByRole('link',{name:'03 Vectors & projectiles'})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:/West, then southwest/}).click();
 await expect(page.locator('.eyebrow')).toContainText('CHAPTER 3 · PROBLEM 1');
 await expect(page.locator('.chapter-three-diagram svg')).toBeVisible();
 const next=page.getByRole('button',{name:'Next',exact:true});
 for(let i=0;i<7;i++)await next.click();
 await expect(page.locator('.solution-slide')).toContainText('14.3° south of west');
 await expect(page.locator('.solution-slide .katex').first()).toBeVisible();
 await page.getByRole('link',{name:'Problems',exact:true}).last().click();
 await expect(page).toHaveURL(/\/library\?chapter=chapter-3&student=bart-v1$/);
 await page.getByRole('link',{name:/Two angles, one range/}).click();
 for(let i=0;i<7;i++)await next.click();
 await expect(page.locator('.solution-slide')).toContainText('23° or 67°');
 await page.getByRole('link',{name:'Problems',exact:true}).last().click();
 for(const name of ['04 Newton’s laws','05 Friction & circular motion']){
  await chapters.getByRole('link',{name}).click();
  await expect(page.getByText('This chapter is ready for its first problems.')).toBeVisible();
  await expect(page.locator('.problem-list a')).toHaveCount(0);
 }
 expect(mutations).toEqual([]);
});

test('chapter diagrams and equations stay readable on a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/library?chapter=chapter-3');
 await expect(page.locator('.problem-list a')).toHaveCount(12);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'docs/screenshots/chapter-three-library-mobile.png',fullPage:true});
 const ids=['car-displacement','vector-components','opposite-vectors','particle-derivatives','displacement-at-five','horizontal-launch','projectile-range'];
 for(const id of ids){
  await page.goto(`/problems/ch3-${id}`);
  const svg=page.locator('.chapter-three-diagram svg');await expect(svg).toBeVisible();
  // Verify labels do not overlap each other or escape the diagram viewport.
  const geometry=await svg.evaluate(node=>{
   const labels=Array.from(node.querySelectorAll('text')).map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,width:b.width,height:b.height};});
   const overlaps=labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.x<b.x+b.width-1&&a.x+a.width>b.x+1&&a.y<b.y+b.height-1&&a.y+a.height>b.y+1).map(b=>`${a.text} / ${b.text}`));
   return {overlaps,outside:labels.filter(a=>a.x<0||a.y<0||a.x+a.width>500||a.y+a.height>320).map(a=>a.text)};
  });
  expect(geometry.overlaps).toEqual([]);expect(geometry.outside).toEqual([]);
  for(let i=0;i<7;i++)await page.getByRole('button',{name:'Next',exact:true}).click();
  await expect(page.locator('.solution-slide .equation-prose')).toHaveCount(0);
  await expect(page.locator('.solution-slide .katex-error')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();window.scrollTo({top:0,behavior:'instant'});});
 await page.waitForFunction(()=>window.scrollY===0);
 await page.screenshot({path:'docs/screenshots/chapter-three-projectile-mobile.png',fullPage:true,animations:'disabled'});
});

anonymousTest('a chapter deep link returns through sign-in',async({page})=>{
 await page.goto('/library?chapter=chapter-3&student=bart-v1');
 await expect(page).toHaveURL(/\/login\?/);
 expect(new URL(page.url()).searchParams.get('next')).toBe('/library?chapter=chapter-3&student=bart-v1');
});
