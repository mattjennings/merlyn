import fs from 'fs-extra'
import path from 'path'
import mkdirp from 'mkdirp'
import { fileURLToPath } from 'url'
import { MerlynConfig } from '../config'
import glob from 'glob'
import { posixify } from './helpers'
import dedent from 'dedent'

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
  writeIfChanged(`${dir}/generated.d.ts`, generateTypes(dir, config))

  if (isInitial) {
    copyRuntime(`${dir}/runtime`)

    isInitial = false
  }
}

function generateClientManifest(dir: string, config: MerlynConfig) {
  const devtool = JSON.stringify(config.devtool)
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
  return dedent(
    `    
    import * as manifest from './manifest.js' 
    import * as runtime from './runtime'
    
    runtime._start(manifest)
	`
  )
}

function generateTypes(dir: string, config: MerlynConfig) {
  // read all files recursively in ../res
  // const files = fs.readdirSync(path.resolve(__dirname, '../res'))
  const base = posixify(path.resolve(dir, '../res'))
  const files = glob
    .sync(posixify(path.join(base, '**/*.*')))
    .map((path) => path.split(base + '/').pop())

  // type ResourcePath = ${files.map((file) => `'${file}'`).join(' | ')}

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
