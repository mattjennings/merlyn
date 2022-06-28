import del from 'del'
import path from 'path'
import vite from 'vite'
import { getMerlynConfig, getViteConfig } from '../config'
import { createApp } from '../util/create-app'

export default async function build({ cwd = process.cwd() } = {}) {
  const config = await getMerlynConfig({ dev: false, cwd })

  const dir = path.resolve(cwd, '.merlyn')
  const outDir = path.resolve(cwd, config.build.outDir)
  await del([dir, outDir])

  createApp({
    dir,
    config,
  })

  const viteConfig = await getViteConfig({
    production: true,
    config,
    buildDir: dir,
  })

  await vite.build(viteConfig)
}
