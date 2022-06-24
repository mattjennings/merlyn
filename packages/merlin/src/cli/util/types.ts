import type { Engine } from 'excalibur'
import { Scene } from '../../Scene'
import { MerlinConfig } from '../config'

export interface ManifestData {
  game: string
  scenes: {
    files: Record<string, string>
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
