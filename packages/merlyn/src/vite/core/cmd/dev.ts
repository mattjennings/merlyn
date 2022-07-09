import { ViteDevServer, UserConfig } from 'vite'
import { MerlynConfig } from '../types'
import * as data from '../data'

export async function dev(
  vite: ViteDevServer,
  viteConfig: UserConfig,
  merlynConfig: MerlynConfig
) {
  data.update(merlynConfig)
  for (const event of ['add', 'unlink']) {
    vite.watcher.on(event, (file) => {
      if (file.startsWith(merlynConfig.scenes.path)) {
        data.update(merlynConfig)
      }
    })
  }

  await vite.listen()
  vite.printUrls()
}
