import { Plugin } from 'vite'
import qs from 'query-string'
import { default as MagicString } from 'magic-string'

/**
 * Parses the import as an excalibur resource and adds
 * the resource to a cache to be automatically loaded
 */
export function importExcaliburResource(): Plugin {
  const isResource = (id) => {
    const [, params] = id.split('?')
    const query = qs.parse('?' + params)

    return !('url' in query) && id.startsWith('$res')
  }
  return {
    name: 'vite-plugin-import-excalibur-resource',
    enforce: 'pre',
    resolveId(id) {
      if (isResource(id)) {
        return id
      }
    },
    load(id) {
      const [base, params] = id.split('?')
      const query = params ? qs.parse('?' + params) : {}
      if (isResource(id)) {
        return `
import { addResource } from '$game'

const resource = addResource(${JSON.stringify(
          id.replace('$res', '')
        )}, ${JSON.stringify(query)})

export default resource
`
      }
    },
    // transform $res('/path/to/resource') to imports
    transform(code, id, options) {
      if (options?.ssr || id.includes('node_modules')) return

      const s = new MagicString(code)
      const imports = []

      // use regex to find any function calls of $res() and its arguments
      const regex = /\$res\((['"])([^'"]+)\1\)/g
      let match = regex.exec(code)

      while (match != null) {
        // get path of resource
        if (match[2]) {
          imports.push(match[2])
        }

        // replace string with variable
        s.replace(
          match[0].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
          `__$res_${imports.length - 1}`
        )

        match = regex.exec(code)
      }

      if (imports.length) {
        // define variable with an import to the resource
        imports.forEach((imp) => {
          const path = `$res/${imp}`
          s.prepend(`import __$res_${imports.indexOf(imp)} from "${path}";\n`)
        })

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true }),
        }
      }
    },
  }
}
