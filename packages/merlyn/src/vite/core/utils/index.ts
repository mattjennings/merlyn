import path from 'path'
import { writeFileSync } from 'fs'
import { mkdirp, posixify } from './fs'

const previousContents = new Map<string, string>()

export function writeIfChanged(file: string, code: string) {
  if (code !== previousContents.get(file)) {
    write(file, code)
  }
}

export function write(file: string, code: string) {
  previousContents.set(file, code)
  mkdirp(path.dirname(file))
  writeFileSync(file, code)
}

export function trim(str: string) {
  const indentation = /\n?(\s*)/.exec(str)[1]
  const pattern = new RegExp(`^${indentation}`, 'gm')
  return str.replace(pattern, '').trim()
}

export function getRouteName(path: string, dir: string) {
  let route = posixify(
    path
      .split(posixify(`${dir}/`))
      .pop()
      .replace(/.(j|t)s/, '')
  )

  if (route.endsWith('/index')) {
    route = route.split(/\/index$/)[0]
  }

  return route
}
