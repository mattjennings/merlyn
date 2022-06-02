import {
  createServer as createViteServer,
  UserConfig,
  ViteDevServer,
} from 'vite'
import path from 'path'
import del from 'del'
import createManifestData from '../util/create-manifest-data'
import { createApp } from '../util/create-app'
import chokidar from 'chokidar'
import { yellow } from 'kleur'
import merge from 'deepmerge'
import { getMerlinConfig, getViteConfig } from '../config'

export default async function dev({ cwd = process.cwd(), port = 3000 } = {}) {
  const dir = path.resolve(cwd, '.merlin')
  await del(dir)
  await del('./dist') // vite will read dist/index.html for some reason

  const config = await getMerlinConfig({ cwd })
  const server = await createViteServer(
    merge<UserConfig>(
      {
        root: cwd,
        server: {
          port,
        },
      },
      await getViteConfig({ config, buildDir: dir })
    )
  )

  watcher({ cwd, dir, server })

  await server.listen()
  server.printUrls()
}

async function watcher({
  cwd,
  dir,
  server,
}: {
  cwd: string
  dir: string
  server: ViteDevServer
}) {
  let config = await getMerlinConfig()

  async function update() {
    config = await getMerlinConfig()
    const manifestData = await createManifestData({ cwd, config })
    createApp({
      manifestData,
      dir,
      cwd,
    })
  }
  const dirs = [
    config.scenes.dir,
    config.assets.dir,
    'merlin.config.js',
  ].filter(Boolean)

  update()

  chokidar
    .watch(dirs)
    .on('add', async () => {
      await update()
    })
    .on('change', async (filePath) => {
      if (filePath.includes('merlin.config.js')) {
        console.warn(
          yellow('merlin.config.js was changed - restarting dev server')
        )
        await server.restart()
      } else {
        await update()
      }
    })
}
