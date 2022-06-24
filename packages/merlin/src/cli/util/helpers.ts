export function posixify(str: string) {
  return str.replace(/\\/g, '/')
}
