/* eslint-disable no-empty */
import dedent from 'dedent'
import path from 'path'
import type { MerlynConfig } from '../types.js'
import { writeIfChanged } from '../utils/index.js'
import { posixify, walk } from '../utils/fs.js'
import { format } from 'prettier'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export function writeTypes(cwd: string, outDir: string, config: MerlynConfig) {
  writeIfChanged(
    path.join(cwd, `${outDir}/types.d.ts`),
    format(types(cwd), { parser: 'typescript' })
  )
}

function types(cwd: string) {
  const base = posixify(path.join(cwd, 'res'))
  const files = walk(base).map((path) => path.split(base + '/').pop())

  const plugins: Record<'tiled' | 'aseprite', boolean> = {
    tiled: false,
    aseprite: false,
  }

  try {
    require.resolve('@excaliburjs/plugin-aseprite')
    plugins.aseprite = true
  } catch (e) {}
  try {
    require.resolve('@excaliburjs/plugin-tiled')
    plugins.tiled = true
  } catch (e) {}

  function getResourceType(file) {
    const images = ['png', 'jpg', 'jpeg', 'gif']
    const audio = ['mp3', 'ogg', 'wav']
    const tilesets = ['.tmx']

    if (images.some((ext) => file.endsWith(ext))) {
      return 'image'
    }

    if (audio.some((ext) => file.endsWith(ext))) {
      return 'sound'
    }

    if (plugins.tiled && tilesets.some((ext) => file.endsWith(ext))) {
      return 'tiled'
    }
  }

  return dedent(/* ts */ `
    import type { Router } from 'excalibur-router'

    interface ResourceType {
      image: ex.ImageSource
      sound: ex.Sound
      ${
        plugins.tiled
          ? 'tiled: import("@excaliburjs/plugin-tiled").TiledMapResource'
          : ''
      }
      ${
        plugins.aseprite
          ? 'aseprite: import("@excaliburjs/plugin-aseprite").AsepriteResource'
          : ''
      }
      unknown: ex.Resource<unknown>
    }

    interface ResourceOptions {
      image: {
        bustCache?: boolean
        filtering?: ex.ImageFiltering
      }
      ${
        plugins.tiled
          ? 'tiled: import("@excaliburjs/plugin-tiled").TiledMapOptions'
          : ''
      }
      ${plugins.aseprite ? 'aseprite: { bustCache?: boolean }' : ''}
    }

    interface Resource {
      ${files
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
      export let router: Router<any, any>
    }
  `)
}
