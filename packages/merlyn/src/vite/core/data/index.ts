import type { MerlynConfig } from '../types.js'
import { writeEntry } from './entry.js'
import { writeManifest } from './manifest.js'
import { writeTsconfig } from './tsconfig.js'
import { writeTypes } from './types.js'

export function writeMerlynData(config: MerlynConfig, outDir = '.merlyn') {
  const cwd = process.cwd()
  writeEntry(cwd, outDir)
  writeManifest(cwd, outDir, config)
  writeTypes(cwd, outDir, config)
  writeTsconfig(cwd, outDir, config)
}
