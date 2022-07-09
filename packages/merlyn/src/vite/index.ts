import AutoImport from 'unplugin-auto-import/vite'
import { ConfigEnv, Plugin, UserConfig } from 'vite'
import { loadConfig } from './core/config'
import { mkdirp, rimraf } from './core/utils/fs'
import { importExcaliburResource } from './plugins/import-excalibur-resource'
import path from 'path'
import fs from 'fs'
import { MerlynConfig } from './core/types'
import { dev } from './core/cmd/dev'

const cwd = process.cwd()

export function merlyn() {
  return [
    AutoImport({
      imports: [
        {
          excalibur: [['*', 'ex']],
        },
      ],
      dts: false,
    }),
    importExcaliburResource(),
    merlynPlugin(),
  ]
}

function merlynPlugin(): Plugin {
  let merlynConfig: MerlynConfig
  let viteConfig: UserConfig
  let env: ConfigEnv
  let isBuild = false

  return {
    name: 'vite-plugin-merlyn',

    async config(config, _env) {
      env = _env
      merlynConfig = await loadConfig({ dev: env.mode === 'development' })
      isBuild = env.command === 'build'

      return {
        base: '', // keep paths to assets relative
        publicDir: 'res',
        optimizeDeps: {
          include: [path.resolve(process.cwd(), '.merlyn/runtime')],

          // merlyn uses $game
          exclude: ['$game'],
        },
        build: {
          minify: 'terser',
          sourcemap: true,
          assetsDir: '',
          outDir: config.build.outDir,
          brotliSize: false,

          // skip warnings about large chunks. games are going to be large.
          // (but maybe there is a reasonable limit still?)
          chunkSizeWarningLimit: 99999999,
        },
        resolve: {
          alias: {
            $lib: '/src/lib',
            $game: path.join('/.merlyn/runtime.js'),
          },
        },
      }
    },

    buildStart() {
      if (isBuild) {
        rimraf(merlynConfig.build.outDir)
        mkdirp(merlynConfig.build.outDir)
      }
    },

    async writeBundle(_options, bundle) {},

    configResolved(config) {
      viteConfig = config as any
    },
    async configureServer(vite) {
      return dev(vite, viteConfig, merlynConfig)
    },

    // configurePreviewServer(vite) {
    //   return preview(
    //     vite,
    //     merlynConfig,
    //     vite_config.preview.https ? 'https' : 'http'
    //   )
    // },
  }
}
