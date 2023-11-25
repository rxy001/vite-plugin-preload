import type {
  HtmlTagDescriptor,
  IndexHtmlTransformContext,
  Plugin,
  ChunkMetadata,
} from "vite"
import { isFunction, isRE, isSet, pushDescriptor, isObject } from "./utils"

type Filter = RegExp | ((href: string) => boolean)

interface PreloadAssetsOption {
  include?: Filter
  exclude?: Filter
  sort?: (assets: string[]) => string[]
}

interface PrefetchDynamicChunksOption {
  include?: Filter
  exclude?: Filter
}

interface Options {
  preloadAssets: PreloadAssetsOption
  prefetchDynamicChunks: PrefetchDynamicChunksOption | boolean
}

let viteMetadata: ChunkMetadata | undefined

let dynamicImports: string[]

let push: (href: string) => void

let bundle: IndexHtmlTransformContext["bundle"]

export default function VitePluginPreload(options?: Options): Plugin {
  return {
    name: "vite-plugin-preload",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler: (html: string, ctx: IndexHtmlTransformContext) => {
        if (!ctx.chunk) {
          return html
        }

        const htmlTagDescriptors: HtmlTagDescriptor[] = []

        viteMetadata = ctx.chunk.viteMetadata
        dynamicImports = ctx.chunk.dynamicImports
        bundle = ctx.bundle

        push = pushDescriptor.bind(null, htmlTagDescriptors, "preload")
        preloadAssets(options?.preloadAssets)

        if (options?.prefetchDynamicChunks) {
          push = pushDescriptor.bind(null, htmlTagDescriptors, "prefetch")
          prefetchDynamicChunks(
            isObject(options.prefetchDynamicChunks)
              ? options.prefetchDynamicChunks
              : undefined,
          )
        }

        return htmlTagDescriptors
      },
    },
  }
}

function prefetchDynamicChunks(option?: PrefetchDynamicChunksOption) {
  const { include: includeOption, exclude: exclueOption } = option ?? {}

  if (Array.isArray(dynamicImports) && dynamicImports.length) {
    const include = wrapper(true, includeOption)
    const exclude = wrapper(false, exclueOption)

    dynamicImports.forEach((chunk) => {
      if (include(chunk) && !exclude(chunk)) {
        // dynamicChunk
        push(chunk)
        if (bundle) {
          const chunkInfo = bundle[chunk] as any
          if (chunkInfo && chunkInfo.isDynamicEntry && chunkInfo.viteMetadata) {
            viteMetadata = chunkInfo.viteMetadata
            prefetchCss()
            preloadAssets()
          }
        }
      }
    })
  }
}

function prefetchCss() {
  if (viteMetadata) {
    const { importedCss } = viteMetadata
    // prefetch DynamicChunkCss
    if (isSet(importedCss) && importedCss.size) {
      importedCss.forEach((css: string) => {
        push(css)
      })
    }
  }
}

function preloadAssets(option?: PreloadAssetsOption) {
  if (viteMetadata) {
    const { sort, include: includeOption, exclude: exclueOption } = option ?? {}

    const { importedAssets } = viteMetadata

    // assets
    if (isSet(importedAssets) && importedAssets.size) {
      const include = wrapper(true, includeOption)
      const exclude = wrapper(false, exclueOption)

      let assets = [...importedAssets]
      if (isFunction(sort)) {
        assets = sort([...assets])
        if (importedAssets.size !== assets.length) {
          // eslint-disable-next-line no-console
          console.log(
            "The sort function returns a different length than its argument. The sort function has been ignored",
          )
          assets = [...importedAssets]
        }
      }
      assets.forEach((asset: string) => {
        if (include(asset) && !exclude(asset)) {
          push(asset)
        }
      })
    }
  }
}

function wrapper(initialValue: boolean, option?: Filter) {
  let fn = (ignore: string) => initialValue
  if (isFunction(option)) {
    fn = option
  } else if (isRE(option)) {
    fn = (href) => option.test(href)
  }

  return fn
}
