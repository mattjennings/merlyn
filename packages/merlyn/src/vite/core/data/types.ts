import dedent from 'dedent'
import glob from 'glob'
import path from 'path'
import type { MerlynConfig } from '../types.js'
import { writeIfChanged } from '../utils/index.js'
import { posixify } from '../utils/fs.js'

export function writeTypes(dir: string, config: MerlynConfig) {
  writeIfChanged(`${dir}/types.d.ts`, types(dir, config))
}

function types(dir: string, config: MerlynConfig) {
  // read all files recursively in ../res
  // const files = fs.readdirSync(path.resolve(__dirname, '../res'))
  const base = posixify(path.resolve(dir, '../res'))
  const files = glob
    .sync(posixify(path.join(base, '**/*.*')))
    .map((path) => path.split(base + '/').pop())

  function getResourceType(file) {
    const images = ['png', 'jpg', 'jpeg', 'gif']
    const audio = ['mp3', 'ogg', 'wav']
    const tilesets = ['.tmx']

    if (images.some((ext) => file.endsWith(ext))) {
      return 'ex.ImageSource'
    }

    if (audio.some((ext) => file.endsWith(ext))) {
      return 'ex.Sound'
    }

    if (tilesets.some((ext) => file.endsWith(ext))) {
      return 'TiledMapResource'
    }

    return 'any'
  }

  return dedent(/* ts */ `
    import type { TiledMapResource } from '@excaliburjs/plugin-tiled'

    interface Resource {
      ${files.map((file) => `'${file}': ${getResourceType(file)}`).join('\n')}
    }
    
    declare global {
      export function $res<T extends keyof Resource>(path: T): Resource[T]
    }
  `)
}
