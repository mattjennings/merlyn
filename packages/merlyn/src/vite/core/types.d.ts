import type { Engine, Scene } from 'excalibur'
import type { Transition } from '../../transitions/Transition.js'

export interface MerlynConfig {
  game: string
  scenes: {
    path: string
    boot: string
    preload?: boolean | string[]
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
    files: Record<
      string,
      {
        isLoadingScene?: boolean
        isPreloaded?: boolean
        path: string
        name: string
      }
    >
    boot: string
  }
  devtool?: MerlynConfig['devtool']
}

export interface Manifest {
  game: Engine
  transition?: Transition
  bootScene: string
  scenes: Record<string, SceneData>
  devtool?: boolean
}

export type SceneData = {
  isLoadingScene?: boolean
  path: string
} & (
  | {
      isPreloaded: true
      scene: typeof Scene
    }
  | {
      isPreloaded: false | undefined
      scene: () => Promise<{ default: typeof Scene }>
    }
)

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
