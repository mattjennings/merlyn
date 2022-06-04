import type { Manifest, SceneData } from '../cli/util/types'
import type { Engine, Loadable, Loader as ExLoader, Loader } from 'excalibur'
import { ImageSource } from 'excalibur'
import * as tiled from '@excaliburjs/plugin-tiled'

export let engine: Engine

const resources: Loadable<any>[] = []

const imgLoader = (url, options) =>
  new ImageSource(url, options.bustCache, options.filtering)

const resourceLoaders = {
  tmx: (url, options) =>
    new tiled.TiledMapResource(url, {
      mapFormatOverride: options.mapFormatOverride,
      startingLayerZIndex: options.startingLayerZIndex,
    }),
  png: imgLoader,
  jpeg: imgLoader,
  jpg: imgLoader,
}

export function addResource(url: string, options?: any) {
  const ext = url.split('?')[0].split('.').pop()
  const loader = resourceLoaders[ext]

  if (loader) {
    const resource = loader(url, options ?? {})
    resources.push(resource)
    return resource
  }

  throw new Error(`No loader found for .${ext} files`)
}

export function addResourceLoaders(
  loaders: Record<string, (url: string) => Loadable<any>>
) {
  Object.assign(resourceLoaders, loaders)
}

export async function _start({ game, scenes, loader }: Manifest) {
  const resourcesByScene = new Map<string, Loadable<any>[]>()

  engine = game

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

  loader?.addResources(resources)

  game.start(loader).then(() => {
    game.goToScene(scenes.boot)
  })
}
