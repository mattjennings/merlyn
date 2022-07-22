import type { ViteDevServer } from 'vite'
import type { MerlynConfig } from './types.js'
import { writeMerlynData } from './data/index.js'
import { loadConfig } from './config.js'
import path from 'path'

const cwd = process.cwd()

export async function dev(vite: ViteDevServer) {
  let merlynConfig: MerlynConfig

  async function updateConfig() {
    merlynConfig = await loadConfig({ dev: true })
  }

  await updateConfig()
  writeMerlynData(merlynConfig)

  vite.watcher.add(`.merlyn.config.js`)

  for (const event of ['add', 'unlink', 'unlinkDir']) {
    vite.watcher.on(event, (file) => {
      if (
        file.includes(merlynConfig.scenes.path) ||
        file.includes(merlynConfig.loaders.path) ||
        file.includes(path.join(cwd, `res`))
      ) {
        writeMerlynData(merlynConfig)
      }
    })
  }

  vite.watcher.on('change', async (path) => {
    if (path.includes(`merlyn.config.js`)) {
      await updateConfig()
      writeMerlynData(merlynConfig)
    }
  })
}
