import { Plugin } from 'vite'
import qs from 'query-string'

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
  }
}
