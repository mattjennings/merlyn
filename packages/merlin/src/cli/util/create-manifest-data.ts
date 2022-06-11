import fs from 'fs'
import path from 'path'
import { MerlinConfig } from '../config'
import { getSceneName } from './get-scene-name'
import { posixify } from './helpers'
import { ManifestData, SceneData } from './types'

export default async function createManifestData({
  cwd,
  config,
}: {
  config: MerlinConfig
  cwd: string
}): Promise<ManifestData> {
  const sceneDir = path.resolve(cwd, config.scenes.path)
  const files = getFiles(sceneDir)

  const loadingScenes: Record<string, SceneData> = files.reduce(
    (acc, filePath) => {
      const baseName = path.parse(filePath).base

      const name = getSceneName(filePath, config.scenes.path)
      if (!baseName.startsWith('_')) {
        return {
          ...acc,
          [name]: {
            name: name,
            loadingScene: getSceneName(
              findLoadingScene(filePath),
              config.scenes.path
            ),
            scene: posixify(path.relative(cwd, filePath)),
          },
        }
      }

      return acc
    },
    {}
  )
  const scenes: Record<string, SceneData> = files.reduce((acc, filePath) => {
    const baseName = path.parse(filePath).base

    const name = getSceneName(filePath, config.scenes.path)
    if (!baseName.startsWith('_')) {
      return {
        ...acc,
        [name]: {
          name: name,
          // loadingScene: getSceneName(
          //   findLoadingScene(filePath),
          //   config.scenes.path
          // ),
          scene: posixify(path.relative(cwd, filePath)),
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
    devtool: config.devtool,
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

function findLoadingScene(filePath: string) {
  const split = filePath.split('/')

  for (let i = split.length - 1; i >= 0; i--) {
    const base = split.slice(0, i).join('/') + '/_loading'

    if (fs.existsSync(base + '.js') || fs.existsSync(base + '.ts')) {
      return base
    }
  }

  return undefined
}
