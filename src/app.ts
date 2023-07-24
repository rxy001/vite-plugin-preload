import type { HtmlTagDescriptor, IndexHtmlTransformContext, Plugin } from "vite"
import { isFunction, isRE, isSet } from "./utils"

const jsRE = /.(js)$/
const cssRE = /.(css)$/
const imageRE = /.(png|jpeg|jpg|svg|gif|bpm)$/

function getFileFormat(href: string) {
  let format = ""

  if (jsRE.test(href)) {
    format = "script"
  } else if (cssRE.test(href)) {
    format = "style"
  } else if (imageRE.test(href)) {
    format = "image"
  }

  return format
}

function pushDescriptor(array: HtmlTagDescriptor[], href: string) {
  if (Array.isArray(array)) {
    const format = getFileFormat(href)
    array.push({
      tag: "link",
      attrs: {
        href: `/${href}`,
        rel: format === "javascript" ? "modulepreload" : "preload",
        as: format,
      },
      injectTo: "head",
    })
  }
}

type Filter = RegExp | ((href: string) => boolean)

interface Options {
  include?: Filter
  exclude?: Filter
  sort?: (assets: string[]) => string[]
}

export default function VitePluginPreload(options?: Options): Plugin {
  const { sort, include: includeOption, exclude: exclueOption } = options ?? {}

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

        const push = pushDescriptor.bind(null, htmlTagDescriptors)

        const { viteMetadata } = ctx.chunk

        if (viteMetadata) {
          const { importedAssets } = viteMetadata

          let include = (ignore: string) => true
          if (isFunction(includeOption)) {
            include = includeOption
          } else if (isRE(includeOption)) {
            include = (href) => includeOption.test(href)
          }

          let exclude = (ignore: string) => false
          if (isFunction(exclueOption)) {
            exclude = exclueOption
          } else if (isRE(exclueOption)) {
            exclude = (href) => exclueOption.test(href)
          }

          // assets
          if (importedAssets && isSet(importedAssets)) {
            let assets = [...importedAssets]
            if (sort && isFunction(sort)) {
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

        return htmlTagDescriptors
      },
    },
  }
}
