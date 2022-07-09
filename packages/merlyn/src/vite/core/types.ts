import type { Engine } from 'excalibur'
import { Transition } from '../../transitions'
import { Scene } from '../../Scene'

export interface MerlynConfig {
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

export type UserMerlynConfig =
  | ((args: {
      /**
       * If we're running as a development server
       */
      dev?: boolean
    }) => DeepPartial<MerlynConfig>)
  | DeepPartial<MerlynConfig>

export interface ManifestData {
  game: string
  scenes: {
    files: Record<string, { path: string; name: string }>
    boot: string
  }
  devtool?: MerlynConfig['devtool']
}

export type Manifest = {
  game: Engine
  transition?: Transition
  bootScene: string
  scenes: Record<string, () => { default: typeof Scene }>
  loadingScenes: Record<string, { default: typeof Scene }>
  devtool?: boolean
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
