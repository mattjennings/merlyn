import fs from 'fs-extra'
import path from 'path'
import mkdirp from 'mkdirp'
import { ManifestData } from './types'
import prettier from 'prettier'
import { fileURLToPath } from 'url'
import { MerlynConfig } from '../config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const previousContents = new Map<string, string>()
let isInitial = true

export function writeIfChanged(file: string, code: string) {
  if (code !== previousContents.get(file)) {
    previousContents.set(file, code)
    mkdirp.sync(path.dirname(file))
    fs.writeFileSync(file, code)
  }
}

export function createApp({
  dir,
  config,
}: {
  dir: string
  config: MerlynConfig
}) {
  writeIfChanged(`${dir}/manifest.js`, generateClientManifest(dir, config))
  writeIfChanged(`${dir}/index.js`, generateApp())

  if (isInitial) {
    copyRuntime(`${dir}/runtime`)

    isInitial = false
  }
}

function format(str: string) {
  return prettier.format(str, {
    semi: false,
    parser: 'babel',
  })
}

function generateClientManifest(dir: string, config: MerlynConfig) {
  const devtool = JSON.stringify(config.devtool)
  return format(/* js */ `
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
    
    export const devtool = ${devtool};
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

function generateApp() {
  return format(
    `    
    import * as manifest from './manifest.js' 
    import * as runtime from './runtime'
    
    runtime._start(manifest)
	`
  )
}

function copyRuntime(dest: string) {
  let prefix = '..'
  do {
    // we jump through these hoops so that this function
    // works whether or not it's been bundled
    const resolved = path.resolve(__dirname, `${prefix}/dist/runtime.js`)
    const resolvedMap = path.resolve(__dirname, `${prefix}/dist/runtime.js.map`)

    if (fs.existsSync(resolved)) {
      fs.copySync(resolved, dest + '.js')
      fs.copySync(resolvedMap, dest + '.js.map')
      return
    }

    prefix = `../${prefix}`
  } while (true) // eslint-disable-line
}
