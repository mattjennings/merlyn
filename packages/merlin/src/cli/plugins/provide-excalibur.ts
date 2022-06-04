import path from 'path'
import { Plugin } from 'vite'

/**
 * Globally provides "ex" object
 */
export function provideExcalibur(cwd: string): Plugin {
  return {
    name: 'vite-plugin-excalibur',
    enforce: 'pre',
    // todo?: convert ex.XYZ into `import { XYZ } from 'excalibur'`
    transform(src, id) {
      if (id.includes(path.join(cwd)) && id.match(/\.(t|j)s$/)) {
        const code = `import * as ex from 'excalibur';\n${src}`
        return {
          code,
          map: null,
        }
      }
    },
  }
}
