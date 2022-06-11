import { posixify } from './helpers'

export function getSceneName(path: string, scenesDir: string) {
  let route = posixify(
    path
      .split(posixify(`${scenesDir}/`))
      .pop()
      .replace(/.(j|t)s/, '')
  )

  if (route.endsWith('/index')) {
    route = route.split(/\/index$/)[0]
  }

  return route
}
