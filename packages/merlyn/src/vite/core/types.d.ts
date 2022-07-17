import type { Engine, Scene, Loadable } from 'excalibur'
import type { Transition } from '../../transitions/Transition.js'

export interface MerlynConfig {
  title: string
  game: string
  scenes: {
    path: string
    boot: string
    preload?: boolean | string[]
    loading?:
      | string
      | {
          default?: string
          boot?: string
        }
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

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
