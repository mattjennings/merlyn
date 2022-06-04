import fs from 'fs-extra'
import path from 'path'
import mkdirp from 'mkdirp'
import { ManifestData } from './types'
import prettier from 'prettier'

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
  manifestData,
  dir,
  cwd,
}: {
  manifestData: ManifestData
  dir: string
  cwd?: string
}) {
  writeIfChanged(
    `${dir}/manifest.js`,
    generateClientManifest(manifestData, dir)
  )

  writeIfChanged(`${dir}/index.js`, generateApp(manifestData, dir))

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

function generateClientManifest(manifestData: ManifestData, dir: string) {
  const scenes = `{
    boot: '${manifestData.scenes.boot}',
    files: { 
      ${Object.entries(manifestData.scenes.files)
        .map(([name, scene]) => {
          return `${JSON.stringify(scene.scene)}: {
          name: ${JSON.stringify(name)},
          scene: () => import(${JSON.stringify(
            path.relative(dir, scene.scene)
          )}),
          loadingScene: ${
            scene.loadingScene
              ? `() => import(${JSON.stringify(
                  path.relative(dir, scene.loadingScene)
                )})`
              : 'undefined'
          },
        }`
        })
        .join(',')}
    }
  }`

  return format(`
		import * as _game from ${JSON.stringify(path.relative(dir, manifestData.game))};

		export const scenes = ${scenes};
    export const game = _game.default;
    export const loader = _game.loader;
	`)
}

function generateApp(manifestData: ManifestData, base: string) {
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
