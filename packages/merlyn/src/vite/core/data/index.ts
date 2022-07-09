import path from 'path'
import { MerlynConfig } from '../types'
import { writeEntry } from './entry'
import { writeManifest } from './manifest'
import { copyRuntime } from './runtime'
import { writeTypes } from './types'

export function init(config: MerlynConfig) {
  copyRuntime(path.join(config.build.outDir, 'runtime'))
}

export function update(config: MerlynConfig) {
  const dir = path.relative('.', config.build.outDir)

  writeEntry(dir)
  writeManifest(dir, config)
  writeTypes(dir, config)
}

export function all(config: MerlynConfig) {
  init(config)
  return update(config)
}
