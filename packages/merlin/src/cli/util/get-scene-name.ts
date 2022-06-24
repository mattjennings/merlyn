import { posixify } from './helpers'

export function getPathName(path: string, dir: string) {
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
