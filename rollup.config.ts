import path from "node:path"
import typescript from "@rollup/plugin-typescript"
import { fileURLToPath } from "node:url"
import { defineConfig } from "rollup"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import terser from "@rollup/plugin-terser"
import dts from "rollup-plugin-dts"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

export default () =>
  defineConfig([
    {
      input: "src/app.ts",
      output: {
        format: "es",
        file: "build/index.js",
      },
      plugins: [
        typescript({
          tsconfig: path.resolve(__dirname, "tsconfig.json"),
        }),
        nodeResolve(),
        commonjs(),
        terser(),
      ],
    },
    {
      input: "./build/types/src/app.d.ts",
      output: [{ file: "build/index.d.ts", format: "es" }],
      plugins: [dts()],
    },
  ])
