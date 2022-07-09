import deepmerge from 'deepmerge'
import path from 'path'
import { MerlynConfig } from './types'

export async function loadConfig({
  dev,
}: {
  dev: boolean
}): Promise<MerlynConfig> {
  const defaultConfig: MerlynConfig = {
    game: 'src/game',
    scenes: {
      path: 'src/scenes',
      boot: 'index',
    },
    build: {
      outDir: 'dist',
    },
  }

  try {
    const configPath = path.join(process.cwd(), `merlyn.config.js`)
    const mod = await import(configPath + `?ts=${Date.now()}`)

    let config
    if (typeof mod.default === 'function') {
      config = mod.default({ dev })
    } else {
      config = mod.default
    }
    return deepmerge<MerlynConfig>(defaultConfig, config)
  } catch (e) {
    if (e?.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e
    }
  }

  return defaultConfig
}

// export async function getViteConfig({
//   cwd = process.cwd(),
//   config,
//   production,
// }: {
//   cwd?: string
//   config: MerlynConfig
//   buildDir: string
//   production?: boolean
// }): Promise<ViteConfig> {
//   const defaultConfig: ViteConfig = {
//     base: '', // keep paths to assets relative
//     publicDir: 'res',
//     optimizeDeps: {
//       include: [path.resolve(process.cwd(), '.merlyn/runtime')],

//       // merlyn uses $game
//       exclude: ['$game'],
//     },
//     mode: production ? 'production' : 'development',
//     build: {
//       minify: 'terser',
//       sourcemap: true,
//       assetsDir: '',
//       outDir: config.build.outDir,
//       brotliSize: false,

//       // skip warnings about large chunks. games are going to be large.
//       // (but maybe there is a reasonable limit still?)
//       chunkSizeWarningLimit: 99999999,
//     },
//     resolve: {
//       alias: {
//         $lib: '/src/lib',
//         $game: path.join('/.merlyn/runtime.js'),
//       },
//     },

//     plugins: [
//       AutoImport({
//         imports: [
//           {
//             excalibur: [['*', 'ex']],
//           },
//         ],
//         dts: false,
//       }),
//       importExcaliburResource(),
//       // on hold
//       // sceneHmr(config),
//     ],
//   }

//   const userConfig = await loadConfigFromFile({
//     command: production ? 'build' : 'serve',
//     mode: production ? 'production' : 'development',
//   })

//   if (userConfig?.config) {
//     // plugins in config seem to get picked by vite up on their own,
//     // it causes issues when merged here?
//     const { plugins, ...c } = userConfig.config

//     return deepmerge(defaultConfig, c)
//   }
//   return defaultConfig
// }
