import type { Manifest } from '../cli/util/types'

// const scenes = import.meta.globEager('./scenes/**/*.ts')

export async function start({ game, scenes }: Manifest) {
  game.start()
  for (const [, scene] of Object.entries(scenes.files)) {
    const mod = await scene.get()

    game.add(scene.name, new mod.default())
  }
  game.goToScene(scenes.boot)
}
