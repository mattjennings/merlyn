import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite'
import path from 'path'
import del from 'del'
import createManifestData from '../util/create-manifest-data'
import { createApp } from '../util/create-app'
import chokidar from 'chokidar'
import kleur from 'kleur'
import merge from 'deepmerge'
import { getMerlinConfig, getViteConfig } from '../config'

export default async function dev({ cwd = process.cwd(), port = 3000 } = {}) {
  const dir = path.resolve(cwd, '.merlin')
  await del(dir)
  await del('./dist') // vite will read dist/index.html for some reason

  const config = await getMerlinConfig({ cwd })
  const server = await createViteServer(
    merge<InlineConfig>(
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

  // await server.restart(true)
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
  const paths = [
    config.scenes.path,
    config.resources.path,
    'merlin.config.js',
  ].filter(Boolean)

  update()

  chokidar
    .watch(paths, {
      ignoreInitial: true,
    })
    .on('add', async (f) => {
      await update()
    })
    .on('change', async (filePath) => {
      if (filePath.includes('merlin.config.js')) {
        console.warn(
          kleur.yellow('merlin.config.js was changed - restarting dev server')
        )
        await server.restart()
      } else {
        await update()
      }
    })
}
