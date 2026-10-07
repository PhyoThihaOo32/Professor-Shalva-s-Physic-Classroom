import {defineConfig,globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals,...nextTs,globalIgnores(['.chalklight-evicted-dependencies/**','.next/**', '.next-cloud-cache/**','.next */**','.chalklight-build-cache/**','lib/generated/**','next-env.d.ts','playwright-report/**','test-results/**'])]);
