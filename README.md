# vite-plugin-preload

vite 插件，使用 `<link rel="preload">` 预加载首屏的 Assets 以及通过 `<link rel="prefetch">` 下载首屏内动态加载的 `chunk` 以及其所依赖的 Css 和 Assets。

## Install

```bash

npm i @x1ngyu/vite-plugin-preload -D

```

## Usage

```js
import preload from "vite-plugin-preload"

defineConfig({
  plugins: [preload()],
})
```

## Options

`preloadAssets`:

- `include`、`exclude`: 可选，正则表达式或者函数，函数参数为 `string[]`，返回值为 `boolean`。
- `sort`: 可选，函数，参数为 `string[]`，返回值为 `string[]`。

`prefetchDynamicChunks`: 可选， `boolean` ｜ `object`, 默认为 `false`

- `boolean`: 是否 prefetch 动态加载的 `chunk` 以及其依赖的 CSS 和 Assets。
- `object`: `include`、`exclude`: 可选，正则表达式或者函数，函数参数为 `string[]`，返回值为 `boolean`。
