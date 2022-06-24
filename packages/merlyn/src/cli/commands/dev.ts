import merge from 'deepmerge'
import del from 'del'
import path from 'path'
import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite'
import { getMerlynConfig, getViteConfig } from '../config'
import { createApp } from '../util/create-app'

export default async function dev({ cwd = process.cwd(), port = 3000 } = {}) {
  const config = await getMerlynConfig({ cwd })
  const dir = path.resolve(cwd, '.merlyn')
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
      // FullReload([`${viteConfig.publicDir as string}/**/*`]),
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
  let config = await getMerlynConfig()

  async function update() {
    config = await getMerlynConfig()
    createApp({
      config,
      dir,
    })
  }
  const paths = [
    config.scenes.path,
    server.config.publicDir,
    'merlyn.config.js',
  ].filter(Boolean)

  update()

  server.watcher.add(paths)
  server.watcher.on('add', async () => {
    await update()
  })

  server.watcher.on('change', async (filePath) => {
    if (paths.some((p) => filePath.includes(p))) {
      await update()
    }
  })
}
