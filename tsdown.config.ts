import { defineConfig } from 'tsdown';

export default defineConfig({
  format: ['esm', 'cjs'],
  dts: true,
  target: 'es2022',
  sourcemap: true,
  clean: true,
  entry: ['src/index.ts'],
});
