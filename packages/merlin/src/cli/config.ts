import { UserConfig as ViteConfig, loadConfigFromFile } from 'vite'
import path from 'path'
import deepmerge from 'deepmerge'
import { importExcaliburResource } from './plugins/import-excalibur-resource'
import AutoImport from 'unplugin-auto-import/vite'
import { sceneHmr } from './plugins/scene-hmr'

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export interface MerlinConfig {
  game: string
  scenes: {
    path: string
    boot: string
  }
  devtool?: {
    enabled: boolean
  }
  build: {
    outDir: string
  }
}

export type UserMerlinConfig = DeepPartial<MerlinConfig>

export async function getMerlinConfig({
  cwd = process.cwd(),
}: {
  cwd?: string
} = {}): Promise<MerlinConfig> {
  const defaultConfig: MerlinConfig = {
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
    const configPath = path.join(cwd, `merlin.config.js`)
    const config = await import(configPath + `?ts=${Date.now()}`)
    return deepmerge<MerlinConfig>(defaultConfig, config.default)
  } catch (e) {
    if (e?.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e
    }
  }

  return defaultConfig
}

export async function getViteConfig({
  cwd = process.cwd(),
  config,
  production,
}: {
  cwd?: string
  config: MerlinConfig
  buildDir: string
  production?: boolean
}): Promise<ViteConfig> {
  const defaultConfig: ViteConfig = {
    base: '', // keep paths to assets relative
    publicDir: 'res',
    optimizeDeps: {
      include: [path.resolve(process.cwd(), '.merlin/runtime')],
    },
    mode: production ? 'production' : 'development',
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
        $game: path.join('/.merlin/runtime.js'),
      },
    },

    plugins: [
      AutoImport({
        imports: [
          {
            excalibur: [['*', 'ex']],
          },
        ],
        dts: false,
      }),
      importExcaliburResource(),
      // on hold
      // sceneHmr(config),
    ],
  }

  const userConfig = await loadConfigFromFile({
    command: production ? 'build' : 'serve',
    mode: production ? 'production' : 'development',
  })

  if (userConfig?.config) {
    return deepmerge(defaultConfig, userConfig.config)
  }
  return defaultConfig
}
