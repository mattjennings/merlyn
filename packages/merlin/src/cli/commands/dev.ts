import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite'
import path from 'path'
import del from 'del'
import createManifestData from '../util/create-manifest-data'
import { createApp } from '../util/create-app'
import kleur from 'kleur'
import merge from 'deepmerge'
import { getMerlinConfig, getViteConfig } from '../config'
import FullReload from 'vite-plugin-full-reload'

export default async function dev({ cwd = process.cwd(), port = 3000 } = {}) {
  const config = await getMerlinConfig({ cwd })
  const dir = path.resolve(cwd, '.merlin')
  const outDir = path.resolve(cwd, config.build.outDir)
  await del([dir, outDir])

  const viteConfig = merge<InlineConfig>(
    {
      root: cwd,
      server: {
        port,
      },
    },
    await getViteConfig({ config, buildDir: dir })
  )

  const server = await createViteServer({
    ...viteConfig,
    plugins: [
      ...viteConfig.plugins,

      // reload on resource changes
      FullReload([`${viteConfig.publicDir as string}/**/*`]),
    ],
  })

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
    server.config.publicDir,
    'merlin.config.js',
  ].filter(Boolean)

  update()

  server.watcher.add(paths)
  server.watcher.on('add', async () => {
    await update()
  })

  server.watcher.on('change', async (filePath) => {
    await update()

    if (filePath.includes(server.config.publicDir)) {
      // await server.restart()
      // server.moduleGraph.invalidateAll()
      // server.
    }

    if (filePath.includes('merlin.config.js')) {
      console.warn(
        kleur.yellow('merlin.config.js was changed - restarting dev server')
      )
      await server.restart()
    }
  })
}
