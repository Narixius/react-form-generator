import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['./src/index.ts', './src/resolver.ts', './src/types.ts'],
    platform: 'neutral',
    dts: true,
  },
])
