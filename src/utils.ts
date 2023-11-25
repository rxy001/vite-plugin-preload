import type { HtmlTagDescriptor } from "vite"

function toString(object: any): string {
  return Object.prototype.toString.call(object)
}

export function isObject(object: any): object is object {
  return toString(object) === "[object Object]"
}

export function isSet(object: any) {
  return toString(object) === "[object Set]"
}

export function isRE(object: any): object is RegExp {
  return toString(object) === "[object RegExp]"
}

export function isFunction(object: any): object is (...args: any[]) => any {
  return toString(object) === "[object Function]"
}

const jsRE = /\.js$/i
const cssRE = /\.css$/i
const imageRE = /\.(png|jpe?g|gif|webp|svg)$/i
const fontRE = /\.(ttf|otf|woff|woff2|eot)$/i

function getFileFormat(href: string) {
  let format = ""

  if (jsRE.test(href)) {
    format = "script"
  } else if (cssRE.test(href)) {
    format = "style"
  } else if (imageRE.test(href)) {
    format = "image"
  } else if (fontRE.test(href)) {
    format = "font"
  }

  return format
}

export function pushDescriptor(
  array: HtmlTagDescriptor[],
  rel: string,
  href: string,
) {
  if (Array.isArray(array)) {
    const format = getFileFormat(href)
    array.push({
      tag: "link",
      attrs: {
        rel,
        href: `/${href}`,
        as: format,
      },
      injectTo: "head",
    })
  }
}
