import {expect,type Page} from '@playwright/test';
import {test} from './fixtures';
import {db} from '../lib/db';
const origin=process.env.E2E_BASE_URL??'http://127.0.0.1:3100';
const emails:string[]=[],password='a classroom test password 42';
function email(){const value=`account-e2e-${crypto.randomUUID()}@example.test`;emails.push(value);return value;}
async function get(page:Page,path:string){const cookie=(await page.context().cookies()).map(c=>`${c.name}=${c.value}`).join('; ');return page.request.get(path,{headers:{Cookie:cookie}});}
async function signup(page:Page,address:string,keep=true){
 await page.goto('/login');const tab=page.getByRole('button',{name:'Create account',exact:true});await expect(tab).toBeEnabled();await tab.click();
 await page.getByRole('textbox',{name:'Name',exact:true}).fill('Alex');await page.getByRole('textbox',{name:'Email',exact:true}).fill(address);await page.getByLabel('Password',{exact:true}).fill(password);
 if(!keep)await page.getByRole('checkbox',{name:'Keep conversations from this browser'}).uncheck();await page.getByRole('button',{name:'Create my account',exact:true}).click();await expect(page).toHaveURL(/\/space$/);
}
async function login(page:Page,address:string){await page.goto('/login');await expect(page.getByRole('button',{name:'Sign in',exact:true}).last()).toBeEnabled();await page.getByRole('textbox',{name:'Email',exact:true}).fill(address);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).last().click();await expect(page).toHaveURL(/\/space$/);}
async function seedGuestRoom(page:Page){
 await page.goto('/classroom?student=bart-v1');await expect(page.getByLabel('Message your student')).toBeVisible();
 const rooms=(await (await get(page,'/api/account/conversations')).json()).data;const id=rooms[0].id;
 await db.sessionEvent.create({data:{sessionId:id,type:'open-message',data:{teacher:'Our car and acceleration discussion',message:'I rushed that division. Let me try again, teach.'}}});return id as string;
}
test.afterAll(async()=>{await db.user.deleteMany({where:{email:{in:emails}}});await db.$disconnect();});

test('sign-up imports guest chat, resumes it on another device, and hides it from other users',async({page,browser})=>{
 const id=await seedGuestRoom(page),address=email();await signup(page,address);
 await expect(page.getByRole('heading',{name:'Our car and acceleration discussion'})).toBeVisible();
 const account=(await (await get(page,'/api/account')).json()).data;expect(account.identity.kind).toBe('user');expect(account.user.email).toBe(address);expect(account.user).not.toHaveProperty('passwordHash');
 const authCookie=(await page.context().cookies()).find(c=>c.name.includes('session-token'));expect(authCookie?.httpOnly).toBe(true);expect(authCookie?.secure).toBe(true);expect(authCookie?.sameSite).toBe('Lax');
 const device=await browser.newContext({baseURL:origin});const second=await device.newPage();
 try{await login(second,address);await expect(second.getByRole('heading',{name:'Our car and acceleration discussion'})).toBeVisible();await second.getByRole('link',{name:/Our car and acceleration discussion/}).click();await expect(second.getByText('I rushed that division. Let me try again, teach.',{exact:true})).toBeVisible();await expect(second.getByLabel('Message your student')).toBeVisible();}
 finally{await device.close();}
 const stranger=await browser.newContext({baseURL:origin});const outsider=await stranger.newPage();
 try{await signup(outsider,email());expect((await get(outsider,`/api/classrooms/${id}`)).status()).toBe(404);await expect(outsider.getByRole('heading',{name:'Our car and acceleration discussion'})).toHaveCount(0);expect((await get(outsider,'/api/owner/problems')).status()).toBe(403);}
 finally{await stranger.close();}
});

test('new conversations preserve older rooms and sign-out clears another open tab',async({page,context})=>{
 const id=await seedGuestRoom(page);await signup(page,email());
 await page.getByRole('button',{name:'New conversation',exact:true}).click();await expect(page.getByLabel('Message your student')).toBeVisible();
 const history=(await (await get(page,'/api/account/conversations')).json()).data;expect(history).toHaveLength(2);expect(history.map((s:{id:string})=>s.id)).toContain(id);
 await page.goto('/space');await page.getByRole('link',{name:/Our car and acceleration discussion/}).click();await expect(page.getByText('I rushed that division. Let me try again, teach.',{exact:true})).toBeVisible();
 const other=await context.newPage();await other.goto(`${origin}/space`);await expect(other.getByRole('heading',{name:'Our car and acceleration discussion'})).toBeVisible();
 await page.goto('/settings');await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page).toHaveURL(/\/login$/);await expect(other.getByRole('heading',{name:'Our car and acceleration discussion'})).toHaveCount(0);await expect(other.getByText('A little room for your ideas.',{exact:true})).toBeVisible();
 expect((await get(page,`/api/classrooms/${id}`)).status()).toBe(404);await other.close();
 await signup(page,email());expect((await (await get(page,'/api/account/conversations')).json()).data).toHaveLength(0);
});

test('optional import can be declined and failed passwords reveal no account details',async({page})=>{
 const id=await seedGuestRoom(page),address=email();await signup(page,address,false);expect((await (await get(page,'/api/account/conversations')).json()).data).toEqual([]);expect((await get(page,`/api/classrooms/${id}`)).status()).toBe(404);
 await page.goto('/settings');await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page).toHaveURL(/\/login$/);
 await expect(page.getByRole('button',{name:'Sign in',exact:true}).last()).toBeEnabled();await page.getByRole('textbox',{name:'Email',exact:true}).fill(address);await page.getByLabel('Password',{exact:true}).fill('incorrect password');await page.getByRole('button',{name:'Sign in',exact:true}).last().click();await expect(page.getByRole('main').getByRole('alert')).toContainText('That email and password don’t match.');
 expect((await (await get(page,'/api/account')).json()).data.identity.kind).toBe('guest');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).last().click();await expect(page).toHaveURL(/\/space$/);
});

test('auth mutations reject foreign origins, weak passwords, and caller-supplied import identities',async({page})=>{
 const address=email(),headers={Origin:origin};
 expect((await page.request.post('/api/account/signup',{headers:{Origin:'https://foreign.example'},data:{name:'Test',email:address,password}})).status()).toBe(403);
 expect((await page.request.post('/api/auth/callback/credentials',{headers:{Origin:'https://foreign.example'},form:{email:address,password}})).status()).toBe(403);
 expect((await page.request.post('/api/account/signup',{headers,data:{name:'Test',email:address,password:'short'}})).status()).toBe(400);
 await signup(page,address);
 expect((await page.request.post('/api/account/complete',{headers,data:{importGuest:true,guestId:crypto.randomUUID()}})).status()).toBe(400);
 expect((await get(page,'/api/owner/problems')).status()).toBe(403);
});

test('login is readable and keyboard accessible on phone, with honest Google availability',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/login');
 await expect(page.getByRole('button',{name:'Sign in',exact:true}).last()).toBeEnabled();await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Name',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.keyboard.press('Tab');expect(errors).toEqual([]);
 const available=(await (await get(page,'/api/account')).json()).data.googleAvailable;if(!available){await expect(page.getByRole('button',{name:'Continue with Google',exact:true})).toBeDisabled();await expect(page.getByText('Google sign-in is being set up.',{exact:true})).toBeVisible();}
 await page.screenshot({path:'/Users/phyothihaoo/.cache/chalklight-physics-runtime/login-phone.png',fullPage:true});
 await page.setViewportSize({width:1280,height:900});await page.screenshot({path:'/Users/phyothihaoo/.cache/chalklight-physics-runtime/login-desktop.png',fullPage:true});
});

test('radio keeps playing while signing in and switching to personal space',async({page})=>{
 const count=22050*60,wav=Buffer.alloc(44+count*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
 let loads=0;await page.route('https://coderadio-admin-v2.freecodecamp.org/listen/coderadio/radio.mp3',route=>{loads++;return route.fulfill({contentType:'audio/wav',body:wav});});
 await page.goto('/login');await expect(page.getByRole('button',{name:'Create account',exact:true})).toBeEnabled();await page.locator('.onboarding-music').getByRole('button',{name:'Play radio',exact:true}).click();
 const transport=page.locator('audio[data-study-radio]');await transport.evaluate(el=>el.setAttribute('data-account-audio','same-player'));await expect.poll(()=>transport.evaluate((el:HTMLAudioElement)=>el.currentTime)).toBeGreaterThan(0);
 const start=await transport.evaluate((el:HTMLAudioElement)=>el.currentTime);await page.getByRole('button',{name:'Create account',exact:true}).click();await page.getByRole('textbox',{name:'Name',exact:true}).fill('Alex');await page.getByRole('textbox',{name:'Email',exact:true}).fill(email());await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Create my account',exact:true}).click();await expect(page).toHaveURL(/\/space$/);
 await expect(transport).toHaveAttribute('data-account-audio','same-player');await expect.poll(()=>transport.evaluate((el:HTMLAudioElement)=>el.currentTime)).toBeGreaterThan(start);expect(loads).toBe(1);await expect(page.locator('.sidebar').getByRole('button',{name:'Pause radio',exact:true})).toBeVisible();await page.locator('.sidebar').getByRole('button',{name:'Pause radio',exact:true}).click();
});
