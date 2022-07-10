import deepmerge from 'deepmerge'
import path from 'path'
import type { MerlynConfig } from './types.js'

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
