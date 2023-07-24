function toString(object: any): string {
  return Object.prototype.toString.call(object)
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
