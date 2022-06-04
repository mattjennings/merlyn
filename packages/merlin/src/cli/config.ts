import { UserConfig as ViteConfig } from 'vite'
import path from 'path'
import deepmerge from 'deepmerge'
import { provideExcalibur } from './plugins/provide-excalibur'
import { importExcaliburResource } from './plugins/import-excalibur-resource'

export interface MerlinConfig {
  game: string
  scenes: {
    path: string
    boot: string
  }
  resources: {
    path: string
  }
}

export type UserMerlinConfig = Partial<MerlinConfig>

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
    resources: {
      path: 'res',
    },
  }

  try {
    const configPath = path.join(cwd, `merlin.config.js`)
    const config = await import(configPath)
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
  buildDir,
  outDir,
  production,
}: {
  cwd?: string
  config: MerlinConfig
  buildDir: string
  outDir?: string
  production?: boolean
}): Promise<ViteConfig> {
  const defaultConfig: ViteConfig = {
    base: '', // keep paths to assets relative
    publicDir: 'public',
    optimizeDeps: {},
    build: {
      minify: true,
      assetsDir: '',
      outDir,
      brotliSize: false,

      // skip warnings about large chunks. games are going to be large.
      // (but maybe there is a reasonable limit still?)
      chunkSizeWarningLimit: 99999999,
    },
    resolve: {
      alias: {
        $lib: '/src/lib',
        $res: path.join('/', config.resources.path),
        $game: path.join('/.merlin/runtime.js'),
      },
    },

    plugins: [provideExcalibur(cwd), importExcaliburResource(config)],
  }

  try {
    const configPath = path.join(cwd, `merlin.config.js`)
    const config = await import(configPath)
    if (config.default.vite) {
      return deepmerge<ViteConfig>(defaultConfig, config.default.vite)
    }
  } catch (e) {
    if (e?.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e
    }
  }

  return defaultConfig
}
