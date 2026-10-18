import {test,expect} from '@playwright/test';

test('privacy is readable before sign-in even when the account service is unavailable',async({page})=>{
 await page.route('**/api/account',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{message:'Temporarily unavailable'}})}));
 await page.goto('/privacy');
 await expect(page.getByRole('heading',{name:'Privacy',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Your choices',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'phyothihaoo.pto@gmail.com',exact:true})).toHaveAttribute('href','mailto:phyothihaoo.pto@gmail.com');
 await expect(page.getByRole('navigation',{name:'Getting started'})).toHaveCount(0);
 await expect(page).toHaveURL(/\/privacy$/);
 await page.getByRole('link',{name:'Back to sign in',exact:true}).click();
 await expect(page.getByRole('link',{name:'Privacy',exact:true})).toHaveAttribute('href','/privacy');
 await page.getByRole('link',{name:'Privacy',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Privacy',exact:true})).toBeVisible();
 await expect(page).toHaveURL(/\/privacy$/);
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'/Users/phyothihaoo/.cache/chalklight-physics-runtime/privacy-phone.png',fullPage:true});
});
