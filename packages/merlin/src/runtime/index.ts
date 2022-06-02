import type { Manifest, SceneData } from '../cli/util/types'
import type { Loadable, Loader as ExLoader, Loader } from 'excalibur'

export async function start({ game, loader, scenes }: Manifest) {
  const resourcesByScene = new Map<string, Loadable<any>[]>()

  for (const [, scene] of Object.entries(scenes.files)) {
    const { default: Scene, resources = [] } = await scene.scene()
    resourcesByScene.set(scene.name, resources)

    if (scene.scene) {
      game.add(scene.name, new Scene())
    }

    if (scene.loadingScene) {
      const { default: LoadingScene } = await scene.loadingScene()

      game.add(
        `${scene.name}/_loading`,
        new LoadingScene({
          next: scene.name,
          resources,
        })
      )
    }
  }

  // patch goToScene to allow _loading scenes
  const origGoToScene = game.goToScene.bind(game)

  game.goToScene = (key: string) => {
    const resourcesForScene = resourcesByScene.get(key)
    const needsLoading =
      resourcesForScene?.length && resourcesForScene.some((r) => !r.isLoaded())

    if (needsLoading && game.scenes[`${key}/_loading`]) {
      origGoToScene(`${key}/_loading`)
    } else {
      origGoToScene(key)
    }
  }

  game.start(loader).then(() => {
    game.goToScene(scenes.boot)
  })
}
