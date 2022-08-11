import deepmerge from 'deepmerge'
import path from 'path'

export interface MerlynConfig {
  title: string
  game: string
  scenes: {
    path: string
    boot: string
    preload?: boolean | string[]
  }
  loaders: {
    path: string
  }
  debug: {
    show: boolean
    devtool: boolean
  }
  pauseWhenBackgrounded: boolean
  build: {
    outDir: string
  }
  hmr?: boolean
}

export type UserMerlynConfig =
  | ((args: {
      /**
       * If we're running as a development server
       */
      dev?: boolean
    }) => DeepPartial<MerlynConfig>)
  | DeepPartial<MerlynConfig>

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export async function loadConfig({
  dev,
}: {
  dev: boolean
}): Promise<MerlynConfig> {
  const defaultConfig: MerlynConfig = {
    title: 'Merlyn',
    game: 'src/game',
    scenes: {
      path: 'src/scenes',
      boot: 'index',
    },
    loaders: {
      path: 'src/loaders',
    },
    build: {
      outDir: 'dist',
    },
    pauseWhenBackgrounded: true,
    debug: {
      show: false,
      devtool: false,
    },
    hmr: true,
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
