import type { Manifest, SceneData } from '../cli/util/types'
import { Engine, Loadable, Loader as ExLoader, Loader, Sound } from 'excalibur'
import { ImageSource } from 'excalibur'
import * as tiled from '@excaliburjs/plugin-tiled'
import { DevTool } from '@excaliburjs/dev-tools'

export let engine: Engine
export let devtool: DevTool

const resources: Loadable<any>[] = []

const imgLoader = (url, options) =>
  new ImageSource(url, options.bustCache, options.filtering)

const sndLoader = (url, options) => new Sound(url)

const resourceLoaders = {
  tmx: (url, options) => {
    const resource = new tiled.TiledMapResource(url, {
      mapFormatOverride: options.mapFormatOverride,
      startingLayerZIndex: options.startingLayerZIndex,
    })
    return resource
  },
  png: imgLoader,
  jpeg: imgLoader,
  jpg: imgLoader,
  gif: imgLoader,
  mp3: sndLoader,
  ogg: sndLoader,
  wav: sndLoader,
}

export function addResource(url: string, options?: any) {
  let type
  if (url.startsWith('data:')) {
    const [, _type] = url.match(/^data:([^;]+);(base64)?,(.*)$/) || []
    if (_type) {
      type = _type.split('/')[1]
    } else {
      throw new Error(`Invalid data url: ${url}`)
    }
  } else {
    type = url.split('?')[0].split('.').pop()
  }
  const loader = resourceLoaders[type]

  if (loader) {
    const resource = loader(url, options ?? {})
    resources.push(resource)
    return resource
  }

  throw new Error(`No loader found for ${type}`)
}

export function addResourceLoaders(
  loaders: Record<string, (url: string) => Loadable<any>>
) {
  Object.assign(resourceLoaders, loaders)
}

export async function _start({ game, scenes, loader, devtool }: Manifest) {
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

  if (process.env.NODE_ENV === 'development' && devtool?.enabled) {
    new DevTool(engine as any)
  }

  game.start(loader).then(() => {
    game.goToScene(scenes.boot)
  })
}
