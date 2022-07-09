import type { MerlynConfig } from '../types.js'
import { writeEntry } from './entry.js'
import { writeManifest } from './manifest.js'
import { writeTypes } from './types.js'

export function writeMerlynData(config: MerlynConfig) {
  const dir = '.merlyn'

  writeEntry(dir)
  writeManifest(dir, config)
  writeTypes(dir, config)
}
