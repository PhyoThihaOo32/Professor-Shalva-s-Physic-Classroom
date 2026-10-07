import type {NextConfig} from 'next';
import {existsSync,lstatSync} from 'node:fs';
const localCache=existsSync('.chalklight-build-cache')&&lstatSync('.chalklight-build-cache').isSymbolicLink();
const config:NextConfig={distDir:localCache?'.chalklight-build-cache/next':'.next',poweredByHeader:false,devIndicators:false,turbopack:{root:process.cwd()},async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'same-origin'},{key:'X-Frame-Options',value:'DENY'},{key:'Content-Security-Policy',value:`default-src 'self'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV==='development'?" 'unsafe-eval'":''}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; frame-src https://www.lofi.cafe; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`}]}];}};
export default config;
