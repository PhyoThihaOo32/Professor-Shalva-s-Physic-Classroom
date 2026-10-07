import {defineConfig} from 'vitest/config';
import path from 'node:path';
export default defineConfig({resolve:{alias:{'@':path.resolve('.'),'server-only':path.resolve('tests/empty.ts')}},test:{include:['tests/**/*.test.ts'],environment:'node'}});
