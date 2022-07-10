import type { Engine, Scene } from 'excalibur'
import path from 'path'
import type { Transition } from '../../../transitions/Transition.js'
import type { MerlynConfig } from '../types.js'
import { writeIfChanged, getRouteName } from '../utils/index.js'
import { walk } from '../utils/fs.js'
import { format } from 'prettier'

export interface Manifest {
  game: Engine
  transition?: Transition
  bootScene: string
  scenes: Record<string, () => { default: typeof Scene }>
  loadingScenes: Record<string, { default: typeof Scene }>
  devtool?: boolean
}

export function writeManifest(
  cwd: string,
  outDir: string,
  config: MerlynConfig
) {
  writeIfChanged(
    path.join(cwd, `${outDir}/manifest.js`),
    format(manifest(cwd, outDir, config), { parser: 'babel' })
  )
}

function manifest(cwd: string, outDir: string, config: MerlynConfig) {
  const imports = []

  const scenes: Record<
    string,
    { isLoadingScene?: boolean; isPreloaded?: boolean; path?: string }
  > = walk(config.scenes.path).reduce((acc, name) => {
    const key = getRouteName(name, config.scenes.path)
    const isPreloaded = isScenePreloaded(key, config)
    const isLoadingScene = isSceneLoadingScene(key)
    const scenePath = path.relative(outDir, path.join(config.scenes.path, name))

    if (isPreloaded) {
      imports.push(`import _scene_${toValidName(key)} from '${scenePath}'`)
    }

    acc[key] = {
      isLoadingScene,
      isPreloaded,
      path: scenePath,
    }

    return acc
  }, {})

  if (!scenes['_loading']) {
    scenes['_loading'] = {
      isLoadingScene: true,
      isPreloaded: true,
    }
    imports.push(
      `import _scene__loading from 'merlyn/runtime/DefaultLoading.js'`
    )
  }

  return /* js */ `
    ${imports.join('\n')}
		import * as _game from ${JSON.stringify(
      path.relative(outDir, path.join(cwd, config.game))
    )};

    export const bootScene = ${JSON.stringify(config.scenes.boot)};
    export const devtool = ${JSON.stringify(config.devtool)};
    export const game = _game.default;
    export const transition = _game.transition;

		export const scenes = {
      ${Object.entries(scenes)
        .map(([key, value]) => {
          return `${JSON.stringify(key)}: {
            isLoadingScene: ${value.isLoadingScene ? 'true' : 'false'},
            isPreloaded: ${value.isPreloaded ? 'true' : 'false'},
            scene: ${
              value.isPreloaded
                ? `_scene_${toValidName(key)}`
                : `() => import("${value.path}")`
            }
        }`
        })
        .join(',')}
    }
  `
}

function isScenePreloaded(name: string, config: MerlynConfig) {
  if (isSceneLoadingScene(name)) {
    return true
  }

  if (typeof config.scenes.preload === 'boolean' || !config.scenes.preload) {
    return !!config.scenes.preload
  }

  return config.scenes.preload.includes(name)
}

function isSceneLoadingScene(name: string) {
  return name.match(/(^|\/)_loading$/)
}

function toValidName(name: string) {
  return name.replace(/[^a-zA-Z0-9]/g, '_')
}
