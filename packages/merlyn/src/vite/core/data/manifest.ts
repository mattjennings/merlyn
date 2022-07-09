import dedent from 'dedent'
import { Engine, Scene } from 'excalibur'
import path from 'path'
import { Transition } from '../../../transitions'
import { MerlynConfig } from '../types'
import { writeIfChanged } from '../utils'

export interface Manifest {
  game: Engine
  transition?: Transition
  bootScene: string
  scenes: Record<string, () => { default: typeof Scene }>
  loadingScenes: Record<string, { default: typeof Scene }>
  devtool?: boolean
}

export function writeManifest(dir: string, config: MerlynConfig) {
  writeIfChanged(`${dir}/manifest.js`, manifest(dir, config))
}

function manifest(dir: string, config: MerlynConfig) {
  return dedent(/* js */ `
		import * as _game from ${JSON.stringify(path.relative(dir, config.game))};

    export const bootScene = ${JSON.stringify(config.scenes.boot)};

    export const loadingScenes = reduceGlob(
      import.meta.globEager(${JSON.stringify(
        path.relative(dir, config.scenes.path) + '/**/_loading.*'
      )}), 
      (acc, path, value) => {
        return {
          ...acc,
          [getSceneName(path)]: value
        }
      })
    
		export const scenes = reduceGlob(
      import.meta.glob(${JSON.stringify(
        path.relative(dir, config.scenes.path) + '/**/*'
      )}),
      (acc, path, value) => {
        if (path.includes('_loading')) {
          return acc
        }

        return {
          ...acc,
          [getSceneName(path)]: value
        }
      });
    
    export const devtool = ${JSON.stringify(config.devtool)};
    export const game = _game.default;
    export const transition = _game.transition;

    function getSceneName(path) {
      let name = path
        .replace(${JSON.stringify(
          path.relative(dir, config.scenes.path)
        )} + '/', '')
        .replace(/\\.(t|j)s$/, '')

        if (name.endsWith('/index')) {
          name = name.split(/\\/index$/)[0]
        }

      return name
    }

    function reduceGlob(glob, fn) {
      return Object.entries(glob).reduce((acc, [key, value]) => {
        return fn(acc, key, value)
      }, {})
    }
	`)
}
