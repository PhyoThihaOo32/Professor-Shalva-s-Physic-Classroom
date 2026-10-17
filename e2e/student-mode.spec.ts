import {expect} from '@playwright/test';
import {test} from './fixtures';
import {db} from '../lib/db';
import type {Step} from '../lib/domain';

const exampleWork:Step={id:'live',title:'From velocity to acceleration',text:'The car gains 20 m/s in 8 s.',equation:'a=2.5\\,\\mathrm{m/s^2}',value:2.5,unit:'m/s²',diagram:false,solution:[{title:'Find acceleration',explanation:'For constant acceleration, divide the change in velocity by the elapsed time.',formula:'a=\\frac{v_f-v_i}{t}',substitution:'a=\\frac{20-0}{8}',result:'a=2.5\\,\\mathrm{m/s^2}'}],drawing:{title:'Velocity increases with time',description:'The rising line shows velocity increasing from rest to 20 m/s over 8 s.',elements:[{kind:'line',x1:120,y1:460,x2:820,y2:460,color:'ink'},{kind:'line',x1:120,y1:460,x2:120,y2:100,color:'ink'},{kind:'line',x1:120,y1:460,x2:780,y2:140,color:'teal'},{kind:'text',x:780,y:530,text:'Time (s)',color:'ink'},{kind:'text',x:150,y:80,text:'Velocity (m/s)',color:'ink'}]}};

for(const professor of [{id:'rick-v1',name:'Rick Sanchez',short:'Rick'},{id:'nefario-v1',name:'Dr. Nefario',short:'Dr. Nefario'},{id:'edna-v1',name:'Edna Mode',short:'Edna'}]){
 test(`${professor.name} opens a personal learning classroom, sends, resumes, and keeps the mode across navigation`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/roles');await page.getByRole('link',{name:/Be the student/}).click();await expect(page).toHaveURL(/\/professors$/);
  const chosen=page.getByRole('button',{name:new RegExp(professor.name)});await expect(chosen).toBeEnabled();await chosen.click();await expect(chosen).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:/Professor Frink/})).toHaveCount(0);
  await expect.poll(()=>page.locator('.professor-options img').evaluateAll(images=>images.length===3&&images.every(image=>(image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0))).toBe(true);
  if(professor.id==='rick-v1')await page.screenshot({path:'/Users/phyothihaoo/.cache/chalklight-physics-runtime/professor-selection-desktop.png',fullPage:true});
  await page.getByRole('link',{name:'Enter classroom',exact:true}).click();await expect(page).toHaveURL(new RegExp(`/learn\\?professor=${professor.id}$`));await expect(page.getByRole('heading',{name:`${professor.short}’s classroom`,exact:true})).toBeVisible();await expect(page.locator('.teacher-instinct')).toHaveCount(0);
  await expect(page.getByRole('img',{name:`${professor.name} profile picture`,exact:true})).toBeVisible();
  const requests:{text:string;drawing?:unknown}[]=[];
  await page.route('**/api/classrooms/*/messages',async route=>{
   const body=route.request().postDataJSON();requests.push(body);const roomId=route.request().url().split('/').at(-2)!;
   const hint=body.text.startsWith('Give me one small hint'),full=body.text.startsWith('Show the full solution'),message=hint?'Compare the change in velocity with the elapsed time.':full?'Here is the complete worked solution, with the motion sketched below.':requests.length===1?'Start with the velocity change. It increases by 20 m/s in 8 seconds.':'The next step is to divide the change by the elapsed time.';
   await db.sessionEvent.create({data:{sessionId:roomId,type:'open-message',data:{teacher:body.text,message,work:hint?null:exampleWork,teacherDrawing:body.drawing??null,instinctStatus:'not-needed'}}});await db.session.update({where:{id:roomId},data:{revision:{increment:2}}});
   const response=await page.request.get(`/api/classrooms/${roomId}`);await route.fulfill({json:{data:{session:(await response.json()).data}}});
  });
  await page.getByRole('button',{name:'Draw or annotate',exact:true}).click();await page.getByRole('button',{name:'Label',exact:true}).click();await page.getByLabel('Diagram label').fill('Car moving right');await page.getByRole('button',{name:'Add label to paper',exact:true}).click();await page.getByRole('button',{name:'Close drawing',exact:true}).click();
  const composer=page.getByLabel('Message your professor');await composer.fill('A car goes from rest to 20 m/s in 8 s.');await composer.press('Shift+Enter');expect(requests).toHaveLength(0);
  if(professor.id==='rick-v1'){
   await page.route('**/api/classrooms/*/messages',route=>route.fulfill({status:503,json:{error:{message:'Please retry this message.'}}}),{times:1});await composer.press('Enter');await expect(page.locator('.learning-classroom').getByRole('alert')).toContainText('Please retry');await expect(composer).toHaveValue(/A car goes from rest/);await expect(composer).toBeEnabled();
  }
  await composer.press('Enter');await expect(page.getByText('Start with the velocity change.',{exact:false})).toBeVisible();await expect(composer).toHaveValue('');expect(requests[0].drawing).toMatchObject({elements:[{kind:'text',text:'Car moving right'}]});
  await expect(page.getByLabel('Professor explanation')).toBeVisible();await expect(page.getByRole('img',{name:/Velocity increases with time/})).toBeVisible();
  const hint=page.getByRole('button',{name:'Hint',exact:true});await hint.click();await expect(page.getByText('Compare the change in velocity with the elapsed time.',{exact:true})).toBeVisible();expect(requests[1].text).toContain('without the full answer');
  await page.getByRole('button',{name:'Next step',exact:true}).click();await expect(page.getByText('The next step is to divide the change by the elapsed time.',{exact:true})).toBeVisible();expect(requests[2].text).toContain('just the next step');
  await page.getByRole('button',{name:'Show solution',exact:true}).click();await expect(page.getByText('Here is the complete worked solution, with the motion sketched below.',{exact:true})).toBeVisible();expect(requests[3].text).toContain('full solution');
  if(professor.id==='rick-v1')await page.screenshot({path:'/Users/phyothihaoo/.cache/chalklight-physics-runtime/professor-classroom-desktop.png',fullPage:true});
  await composer.fill('My unsent draft');await expect(hint).toBeDisabled();await composer.fill('');
  await page.reload();await expect(composer).toBeVisible();await expect(page.getByText('Compare the change in velocity with the elapsed time.',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Settings',exact:true}).click();await page.getByRole('link',{name:'Classroom',exact:true}).click();await expect(page.getByRole('heading',{name:`${professor.short}’s classroom`,exact:true})).toBeVisible();
  await page.getByRole('link',{name:'My space',exact:true}).first().click();await page.getByRole('link',{name:new RegExp(`Learn with ${professor.short}`)}).click();await expect(composer).toBeVisible();await expect(page.getByText('Compare the change in velocity with the elapsed time.',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Change professor',exact:true}).click();await expect(page.getByRole('button',{name:new RegExp(professor.name)})).toHaveAttribute('aria-pressed','true');expect(errors).toEqual([]);
 });
}

test('professor selection and classroom fit a phone, and switching back preserves teacher mode',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/professors');await expect(page.getByRole('heading',{name:'A different kind of class.'})).toBeVisible();
 await page.getByRole('button',{name:/Edna Mode/}).click();await page.screenshot({path:'/Users/phyothihaoo/.cache/chalklight-physics-runtime/professor-selection-phone.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Enter classroom',exact:true}).click();await expect(page.getByRole('heading',{name:'Edna’s classroom',exact:true})).toBeVisible();await expect(page.getByLabel('Message your professor')).toBeVisible();
 await page.getByRole('button',{name:'Draw or annotate',exact:true}).click();await expect(page.getByRole('region',{name:'Drawing annotations'})).toBeVisible();await page.getByRole('button',{name:'Close drawing',exact:true}).click();
 await page.screenshot({path:'/Users/phyothihaoo/.cache/chalklight-physics-runtime/professor-classroom-phone.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/roles');await page.getByRole('link',{name:/Be the teacher/}).click();await page.getByRole('button',{name:/Bart Simpson/}).click();await page.getByRole('link',{name:'Enter classroom',exact:true}).click();await expect(page.getByLabel('Message your student')).toBeVisible();await expect(page.locator('.teacher-instinct')).toBeVisible();await expect(page.getByRole('group',{name:'Learning help'})).toHaveCount(0);
});

test('an old Frink preference selects Nefario and uses the supplied profile photos',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('chalklight-professor','frink-v1'));
 await page.goto('/professors');const nefario=page.getByRole('button',{name:/Dr\. Nefario/});await expect(nefario).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('button',{name:/Professor Frink/})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Enter classroom',exact:true})).toHaveAttribute('href','/learn?professor=nefario-v1');
 await expect(page.getByRole('img',{name:'Rick Sanchez profile picture'})).toHaveAttribute('src','/professors/rick.jpg');await expect(page.getByRole('img',{name:'Dr. Nefario profile picture'})).toHaveAttribute('src','/professors/nefario.webp');await expect(page.getByRole('img',{name:'Edna Mode profile picture'})).toHaveAttribute('src','/professors/edna.jpeg');
});
