import fs from 'fs'
import path from 'path'
import { MerlinConfig } from '../config'
import { ManifestData, SceneData } from './types'

export default async function createManifestData({
  cwd,
  config,
}: {
  config: MerlinConfig
  cwd: string
}): Promise<ManifestData> {
  const sceneDir = path.resolve(cwd, config.scenes.dir)
  const files = getFiles(sceneDir)

  const scenes: Record<string, SceneData> = files.reduce((acc, filePath) => {
    const baseName = filePath.split('/').pop()

    let route = posixify(
      filePath.replace(`${sceneDir}/`, '').replace(/.(j|t)s/, '')
    )

    if (route.endsWith('/index')) {
      route = route.split(/\/index$/)[0]
    }

    if (!baseName.startsWith('_') && !baseName.startsWith('$')) {
      return {
        ...acc,
        [route]: {
          name: route,
          path: posixify(path.relative(cwd, filePath)),
        },
      }
    }

    return acc
  }, {})

  return {
    game: config.game,
    scenes: {
      files: scenes,
      boot: config.scenes.boot,
    },
  }
}

function getFiles(dir: string): string[] {
  const dirents = fs.readdirSync(dir, { withFileTypes: true })
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFiles(res) : res
  })

  return files.flat()
}

function posixify(str: string) {
  return str.replace(/\\/g, '/')
}

/**
 * Recursively looks up until it finds a $loading in the templates matching its route
 */
// function findLoadingPath(
//   templates: Record<string, TemplateComponentData>,
//   filePath: string
// ): string {
//   const split = filePath.split('/')

//   for (let i = split.length - 1; i >= 0; i--) {
//     const templatePath =
//       i === 0 ? '$loading' : split.slice(0, i).join('/') + '/$loading'

//     if (templates[templatePath]) {
//       return templates[templatePath].path
//     }
//   }

//   throw Error('$loading not found')
// }
