import type { Plugin } from 'vite'
import qs from 'query-string'
import { format } from 'prettier'
import recast from 'recast'
import tsParser from 'recast/parsers/typescript.js'

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
      const [res, params] = id.split('?')
      const query = params ? qs.parse('?' + params) : {}

      if (isResource(id)) {
        const options = query.options
          ? JSON.parse(decodeURIComponent(query.options as string))
          : {}

        return format(
          /* js */ `
          import { addResourceByUrl } from '$game'

          const resource = addResourceByUrl(${JSON.stringify(
            res.replace('$res', '')
          )}, ${JSON.stringify(options)})

          export default resource
          `,
          { parser: 'babel' }
        )
      }
    },
    // transform $res('/path/to/resource') to imports
    transform(code, id, options) {
      if (options?.ssr || id.includes('node_modules') || !id.includes('.ts')) {
        return
      }

      const tsAst = recast.parse(code, {
        parser: {
          parse: tsParser.parse,
        },
        sourceFileName: id,
      })

      let count = 0
      recast.visit(tsAst, {
        visitCallExpression(path) {
          const name = (path.node.callee as any).name

          if (name === '$res') {
            const [importArg, optionsArg] = path.node.arguments

            // validate first argument is a string
            if (!recast.types.namedTypes.StringLiteral.check(importArg)) {
              throw new InvalidResError('path must be a string')
            }

            let options = {}
            // validate second argument is an object
            if (optionsArg) {
              if (!recast.types.namedTypes.ObjectExpression.check(optionsArg)) {
                throw new InvalidResError('options must be an object')
              }

              options = parseObjectExpression(optionsArg)
            }

            const b = recast.types.builders

            // sort keys so that import path has a consistent param order for caching reasons
            options = sortObjectKeys(options)

            const varName = `__res_${++count}`
            let source = Object.keys(options).length
              ? `$res/${importArg.value}?options=${encodeURIComponent(
                  JSON.stringify(options)
                )}`
              : `$res/${importArg.value}`

            if (source.includes('.json?')) {
              source = source.replace('.json?', '.json?raw&')
            }

            // replace $res with variable
            path.replace(b.identifier(varName))

            // add import statement
            tsAst.program.body.unshift(
              b.importDeclaration(
                [b.importDefaultSpecifier(b.identifier(varName))],
                b.literal(source)
              )
            )
          }
          this.traverse(path)
        },
      })

      if (count > 0) {
        return recast.print(tsAst, {
          sourceMapName: `${id}.map`,
        })
      }
    },
  }
}

function parseObjectExpression(node: any) {
  const obj = {}
  for (const prop of node.properties) {
    const name = (prop as any).key.name
    recast.visit(prop, {
      visitObjectExpression(path) {
        obj[name] = parseObjectExpression(path.node)
        return false
      },
      visitLiteral(path) {
        obj[name] = path.value.value
        return false
      },
    })
  }
  return obj
}

class InvalidResError extends Error {
  constructor(message: string) {
    message = `Invalid $res: ${message}`
    super(message)
    this.name = 'InvalidResError'
  }
}

function sortObjectKeys(obj: any) {
  const keys = Object.keys(obj)
  keys.sort()
  return keys.reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
  }, {})
}
