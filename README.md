# vite-plugin-preload

vite 插件，使用 `<link rel="preload" as="image">` 预加载首屏的图片。

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

`include`: 可选，正则表达式或者函数，参数为 `string[]`，返回值为 `boolean`。
`exclude`: 可选，正则表达式或者函数，参数为 `string[]`，返回值为 `boolean`。
`sort`: 可选，函数，参数为 `string[]`，返回值为 `string[]`
