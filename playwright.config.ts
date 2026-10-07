import {defineConfig,devices} from '@playwright/test';
export default defineConfig({testDir:'e2e',fullyParallel:false,workers:1,timeout:45000,expect:{timeout:10000},use:{baseURL:'http://127.0.0.1:3000',trace:'retain-on-failure'},webServer:{command:'npm run dev',url:'http://127.0.0.1:3000',reuseExistingServer:true,timeout:60000},projects:[{name:'desktop',use:{...devices['Desktop Chrome']}}]});
