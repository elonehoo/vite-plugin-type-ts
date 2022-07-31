# vite-plugin-type-ts

Generate declaration files (`*.ts(x)` or `.vue` source files when using vite in [library mode](https://vitejs.dev/guide/build.html#library-mode) `d.ts`).

## install

```shell
# npm
npm install @elonehoo/vite-plugin-type-ts
# yarn
yarn add @elonehoo/vite-plugin-type-ts
# pnpm
pnpm install @elonehoo/vite-plugin-type-ts
```

## usage

```ts
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import distCss from '@elonehoo/vite-plugin-dist-css'
import types from '@elonehoo/vite-plugin-type-ts'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    vue({
      reactivityTransform: true,
    }),
    types(),
  ],
})

```
