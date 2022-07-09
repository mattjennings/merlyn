import path from 'path'
import fs from 'fs-extra'

export function copyRuntime(dest: string) {
  let prefix = '..'
  do {
    const resolved = path.resolve(__dirname, `${prefix}/dist/runtime.js`)
    const resolvedMap = path.resolve(__dirname, `${prefix}/dist/runtime.js.map`)

    if (fs.existsSync(resolved)) {
      fs.copySync(resolved, dest + '.js')
      fs.copySync(resolvedMap, dest + '.js.map')
      return
    }

    prefix = `../${prefix}`
  } while (true) // eslint-disable-line
}
