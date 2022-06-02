import type { Manifest } from '../cli/util/types'
import type { Loader as ExLoader } from 'excalibur'

export async function start({ game, loader, scenes }: Manifest) {
  for (const [, scene] of Object.entries(scenes.files)) {
    let Loader: typeof ExLoader | undefined

    if (scene.getLoader) {
      const mod = await scene.getLoader()
      Loader = mod.default
    }
    const mod = await scene.get()

    game.add(
      scene.name,
      new mod.default({
        loader: Loader ? new Loader(mod.resources ?? []) : undefined,
      })
    )
  }
  game.start(loader).then(() => {
    game.goToScene(scenes.boot)
  })
}
