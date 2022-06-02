import { Engine, Scene } from 'excalibur'

export type Module<T> = {
  default: T
}

export type ModuleLoader<T> = () => Promise<Module<T>>

export interface SceneData<Loaded extends boolean = false> {
  get: Loaded extends true ? ModuleLoader<typeof Scene> : never
  name: string
  path: string
}

// when Loaded = false, it is the data used to generate manifest.js
// when Loaded = true, it is the resulting manifest exported from manifest.js
// (it probably would make sense to have them as separate types, but the naming is
// confusing and they export the same named properties anyway)
export type ManifestData<Loaded extends boolean = false> = {
  game: Loaded extends true ? Engine : string
  scenes: {
    files: Record<string, SceneData<Loaded>>
    boot: string
  }
}

export type Manifest = ManifestData<true>
