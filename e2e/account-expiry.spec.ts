import {expect} from '@playwright/test';
import {test} from './fixtures';

test('expired authentication cannot reopen a cached workspace or hide the login form',async({page,context})=>{
 await page.goto('/classroom?student=bart-v1');await expect(page.getByLabel('Message your student')).toBeVisible();
 // Remove the server cookie without notifying the already mounted client.
 await context.clearCookies();
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Problems',exact:true}).click();
 await expect(page).toHaveURL(/\/login\?next=/);await expect(page.getByRole('textbox',{name:'Email',exact:true})).toBeEnabled();await expect(page.getByLabel('Password',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Welcome back',exact:true})).toHaveCount(0);await expect(page.getByLabel('Message your student')).toHaveCount(0);expect((await page.request.get('/api/account/conversations')).status()).toBe(401);
});
