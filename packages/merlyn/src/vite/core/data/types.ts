import dedent from 'dedent'
import path from 'path'
import type { MerlynConfig } from '../types.js'
import { writeIfChanged } from '../utils/index.js'
import { posixify, walk } from '../utils/fs.js'
import { format } from 'prettier'

export function writeTypes(cwd: string, outDir: string, config: MerlynConfig) {
  writeIfChanged(
    path.join(cwd, `${outDir}/types.d.ts`),
    format(types(cwd), { parser: 'typescript' })
  )
}

function types(cwd: string) {
  const base = posixify(path.join(cwd, 'res'))
  const files = walk(base).map((path) => path.split(base + '/').pop())

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
