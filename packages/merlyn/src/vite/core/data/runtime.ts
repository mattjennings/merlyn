import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log(__dirname)
export function copyRuntime(dest: string) {
  let prefix = '..'
  do {
    const resolved = path.resolve(__dirname, `${prefix}/dist/runtime`)

    if (fs.existsSync(resolved)) {
      fs.copySync(resolved, dest)
      return
    }

    prefix = `../${prefix}`
  } while (true) // eslint-disable-line
}
