import {defineConfig,devices} from '@playwright/test';
const baseURL=process.env.E2E_BASE_URL??'http://127.0.0.1:3100';
export default defineConfig({testDir:'e2e',fullyParallel:false,workers:1,timeout:45000,expect:{timeout:10000},use:{baseURL,trace:'retain-on-failure'},webServer:{command:process.env.E2E_SERVER_COMMAND??'npm run start -- --port 3100',url:baseURL,reuseExistingServer:!process.env.CI,timeout:60000,env:{APP_ORIGIN:baseURL,ALLOW_LIVE_AI:'false',OPENAI_API_KEY:''}},projects:[{name:'desktop',use:{...devices['Desktop Chrome']}}]});
