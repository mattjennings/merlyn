import type { Engine, Loader } from 'excalibur'
import { Scene } from '../../Scene'
import { MerlinConfig } from '../config'

export type Module<T> = {
  default: T
}

export type ModuleLoader<T, E = Record<string, never>> = () => Promise<
  Module<T> & E
>

export interface SceneData<Loaded extends boolean = false> {
  scene: Loaded extends true ? ModuleLoader<typeof Scene> : string
  loadingScene: Loaded extends true ? ModuleLoader<typeof Scene> : string
  name: string
}

// when Loaded = false, it is the data used to generate manifest.js
// when Loaded = true, it is the resulting manifest exported from manifest.js
// (it probably would make sense to have them as separate types, but the naming is
// confusing and they export the same named properties anyway)
export type ManifestData<Loaded extends boolean = false> = {
  game: Loaded extends true ? Engine : string
  loader?: Loaded extends true ? Loader : never
  scenes: {
    files: Record<string, SceneData<Loaded>>
    boot: string
  }
  devtool?: MerlinConfig['devtool']
}

export type Manifest = {
  game: Engine
  bootScene: string
  scenes: Record<string, () => { default: typeof Scene }>
  loadingScenes: Record<string, { default: typeof Scene }>
  devtool?: boolean
}
