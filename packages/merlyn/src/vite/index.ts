import { default as AutoImport } from 'unplugin-auto-import/vite'
import type { ConfigEnv, Plugin, UserConfig } from 'vite'
import { loadConfig } from './core/config.js'
import { mkdirp, rimraf } from './core/utils/fs.js'
import { importExcaliburResource } from './plugins/import-excalibur-resource.js'
import path from 'path'
import type { MerlynConfig } from './core/types.js'
import { dev } from './core/dev.js'
import { writeMerlynData } from './core/data/index.js'
import fs from 'fs'

export default function merlyn(): Plugin[] {
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
          // include: ['merlyn/runtime'],

          // merlyn uses $game
          exclude: ['$game'],
        },
        build: {
          minify: 'terser',
          sourcemap: true,
          assetsDir: '',
          outDir: merlynConfig.build.outDir,
          brotliSize: false,

          // skip warnings about large chunks. games are going to be large.
          // (but maybe there is a reasonable limit still?)
          chunkSizeWarningLimit: 99999999,
        },
        resolve: {
          alias: {
            $lib: '/src/lib',
            $game: path.join('merlyn/runtime'),
          },
        },
      }
    },

    buildStart() {
      if (isBuild) {
        rimraf('.merlyn')
        mkdirp('.merlyn')
        writeMerlynData(merlynConfig)
      }
    },

    configResolved(config) {
      viteConfig = config as any
    },
    async configureServer(vite) {
      return dev(vite)
    },
  }
}
