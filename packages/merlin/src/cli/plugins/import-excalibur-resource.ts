import path from 'path'
import { Plugin } from 'vite'
import qs from 'query-string'
import { MerlinConfig } from '../config'

/**
 * Globally provides "ex" object
 */
export function importExcaliburResource(config: MerlinConfig): Plugin {
  const isResource = (id) => {
    const [, params] = id.split('?')
    const query = qs.parse('?' + params)

    return !('url' in query) && id.includes(config.resources.dir)
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
      const query = qs.parse('?' + params)
      if (isResource(id)) {
        return `
        import { addResource } from '$game'
        import url from "${base}?url"
        
        const resource = addResource(url, ${JSON.stringify(query)})

        export default resource
        `
      }
    },
  }
}
