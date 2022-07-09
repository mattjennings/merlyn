import type { ViteDevServer } from 'vite'
import type { MerlynConfig } from '../types.js'
import * as data from '../data/index.js'
import { loadConfig } from '../config.js'

export async function dev(vite: ViteDevServer) {
  let merlynConfig: MerlynConfig

  async function updateConfig() {
    merlynConfig = await loadConfig({ dev: true })
  }

  await updateConfig()
  data.all(merlynConfig)
  vite.watcher.add(`.merlyn.config.js`)

  for (const event of ['add', 'unlink']) {
    vite.watcher.on(event, (file) => {
      if (file.startsWith(merlynConfig.scenes.path)) {
        data.update(merlynConfig)
      }
    })
  }

  vite.watcher.on('change', async (path) => {
    if (path.includes(`merlyn.config.js`)) {
      await updateConfig()
      data.update(merlynConfig)
    }
  })
}
