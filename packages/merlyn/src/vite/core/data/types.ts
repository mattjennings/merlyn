/* eslint-disable no-empty */
import dedent from 'dedent'
import path from 'path'
import type { MerlynConfig } from '../config.js'
import { getRouteName, writeIfChanged } from '../utils/index.js'
import { posixify, walk } from '../utils/fs.js'
import { format } from 'prettier'
import { createRequire } from 'module'
import { existsSync } from 'fs'

const require = createRequire(import.meta.url)

export function writeTypes(cwd: string, outDir: string, config: MerlynConfig) {
  writeIfChanged(
    path.join(cwd, `${outDir}/types.d.ts`),
    format(types(cwd, config), { parser: 'typescript' })
  )
}

// hacky way to get actual node_module locations of dependencies so they can be resolved
// from .merlyn
function getPackagePaths() {
  const getEntry = (name: string) => {
    const p = require.resolve(name)
    return p.substring(0, p.lastIndexOf(name + '/') + name.length)
  }

  return {
    pluginAseprite: getEntry('@excaliburjs/plugin-aseprite'),
    pluginTiled: getEntry('@excaliburjs/plugin-tiled'),
    excaliburRouter: getEntry('excalibur-router'),
  }
}

function types(cwd: string, config: MerlynConfig) {
  const packagePaths = getPackagePaths()

  const paths = {
    loaders: posixify(path.join(cwd, config.loaders.path)),
    scenes: posixify(path.join(cwd, config.scenes.path)),
    res: posixify(path.join(cwd, 'res')),
  }

  const files = {
    scenes: walk(paths.scenes).map((path) =>
      path.split(paths.scenes + '/').pop()
    ),
    loaders: existsSync(paths.loaders)
      ? walk(paths.loaders).map((path) => path.split(paths.loaders + '/').pop())
      : [],
    res: existsSync(paths.res)
      ? walk(paths.res).map((path) => path.split(paths.res + '/').pop())
      : [],
  }

  function getResourceType(file) {
    const images = ['png', 'jpg', 'jpeg', 'gif']
    const audio = ['mp3', 'ogg', 'wav']
    const tilesets = ['tmx']

    if (images.some((ext) => file.endsWith(ext))) {
      return 'image'
    }

    if (audio.some((ext) => file.endsWith(ext))) {
      return 'sound'
    }

    if (tilesets.some((ext) => file.endsWith(ext))) {
      return 'tiled'
    }
  }

  return dedent(/* ts */ `
    import type { Scene } from 'excalibur'
    import type { Router } from '${packagePaths.excaliburRouter}'

    interface ResourceType {
      image: ex.ImageSource
      sound: ex.Sound
      tiled: import("${packagePaths.pluginTiled}").TiledMapResource
      aseprite: import("${packagePaths.pluginAseprite}").AsepriteResource
      unknown: ex.Resource<unknown>
    }

    interface ResourceOptions {
      image: {
        bustCache?: boolean
        filtering?: ex.ImageFiltering
      }
      tiled: import("${packagePaths.pluginTiled}").TiledMapOptions    
      aseprite: { bustCache?: boolean }
    }

    interface Resource {
      ${files.res
        .map((file) => {
          const type = getResourceType(file)
          return `${JSON.stringify(file)}: ${JSON.stringify(type ?? 'unknown')}`
        })
        .join('\n')}
    }
    
    declare global {
      export function $res<
        T extends keyof Resource,
        As extends keyof ResourceType = Resource[T]
      >(path: T, options?: {
          as?: As
        } & (As extends keyof ResourceOptions ? ResourceOptions[As] : {})): ResourceType[As]
    }

    declare module '$game' {
      export interface Routes {
        ${files.scenes
          .map((filePath) => {
            const name = getRouteName(filePath, config.scenes.path)
            const parsed = path.parse(filePath)
            return `${JSON.stringify(name)}: import(${JSON.stringify(
              path.join(config.scenes.path, parsed.dir, parsed.name)
            )}).default`
          })
          .join('\n')}
      }
      
      export interface Loaders {
        ${files.loaders
          .map((filePath) => {
            const name = getRouteName(filePath, config.loaders.path)
            const parsed = path.parse(filePath)
            return `${JSON.stringify(name)}: import(${JSON.stringify(
              path.join(config.loaders.path, parsed.dir, parsed.name)
            )}).default`
          })
          .join('\n')}
      }

      export let router: Router<Record<keyof Routes, typeof Scene>, Record<keyof Loaders, typeof Scene>>
    }
  `)
}
