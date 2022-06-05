import del from 'del'
import path from 'path'
import vite from 'vite'
import { getMerlinConfig, getViteConfig } from '../config'
import { createApp } from '../util/create-app'
import createManifestData from '../util/create-manifest-data'

export default async function build({ cwd = process.cwd() } = {}) {
  const config = await getMerlinConfig({ cwd })

  const dir = path.resolve(cwd, '.merlin')
  const outDir = path.resolve(cwd, config.build.outDir)
  await del([dir, outDir])

  const manifestData = await createManifestData({ cwd, config })
  createApp({
    manifestData,
    dir,
    cwd,
  })

  const viteConfig = await getViteConfig({
    production: true,
    config,
    buildDir: dir,
  })

  await vite.build(viteConfig)
}
