import type { Engine } from 'excalibur'
import { Transition } from '../../transitions'
import { Scene } from '../../Scene'
import { MerlinConfig } from '../config'

export interface ManifestData {
  game: string
  scenes: {
    files: Record<string, { path: string; name: string }>
    boot: string
  }
  devtool?: MerlinConfig['devtool']
}

export type Manifest = {
  game: Engine
  transition?: Transition
  bootScene: string
  scenes: Record<string, () => { default: typeof Scene }>
  loadingScenes: Record<string, { default: typeof Scene }>
  devtool?: boolean
}
