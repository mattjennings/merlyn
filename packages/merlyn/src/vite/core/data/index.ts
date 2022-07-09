import path from 'path'
import type { MerlynConfig } from '../types.js'
import { writeEntry } from './entry.js'
import { writeManifest } from './manifest.js'
import { copyRuntime } from './runtime.js'
import { writeTypes } from './types.js'

export function init(config: MerlynConfig) {
  // copyRuntime(path.join('.merlyn', 'runtime'))
}

export function update(config: MerlynConfig) {
  const dir = '.merlyn'

  writeEntry(dir)
  writeManifest(dir, config)
  writeTypes(dir, config)
}

export function all(config: MerlynConfig) {
  init(config)
  return update(config)
}
