#! /usr/bin/env node
import sade from 'sade'
import { writeMerlynData } from '../dist/vite/core/data/index.js'
import { loadConfig } from '../dist/vite/core/config.js'

const prog = sade('merlyn')

prog.command('sync', 'Prepares initial data for Merlyn').action(async () => {
  const config = await loadConfig({ dev: true })
  writeMerlynData(config)
})

prog.parse(process.argv)
