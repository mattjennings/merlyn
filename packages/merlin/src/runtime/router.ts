import { Manifest, SceneData } from '../cli/util/types'
import { LoadingScene } from '../LoadingScene'
import { Scene } from '../Scene'
import { loader, getResources } from './resources'

export class Router {
  currentScene?: string
  scenes: Record<
    string,
    {
      import: () => Promise<{ default: typeof Scene }>
      loadingSceneKey: string
    }
  >
  engine: ex.Engine
  hasStarted = false

  constructor(manifest: Manifest) {
    this.engine = manifest.game

    this.scenes = Object.entries(manifest.scenes).reduce(
      (acc, [key, value]) => {
        return {
          ...acc,
          [key]: {
            import: value,
            loadingSceneKey: Object.entries(manifest.loadingScenes).find(
              ([loadingKey]) => {
                return key.split('/').length === loadingKey.split('/').length
              }
            )[0],
          },
        }
      },
      {}
    )

    Object.entries(manifest.loadingScenes).map(async ([key, mod]) => {
      this.engine.add(key, new mod.default())
    })

    this.goToScene(manifest.bootScene)
  }

  async goToScene(name: string, params?: any) {
    const sceneData = this.scenes[name]

    if (!sceneData) {
      throw new Error(`No scene named ${name}`)
    }

    if (!this.hasStarted) {
      await this.engine.start(loader as any)
      this.hasStarted = true
    }

    let scene = this.engine.scenes[name]
    let isLoading = false

    // add scene to game if not already added
    if (!scene) {
      this.goToLoadingForScene(name)
      isLoading = true

      const mod = await sceneData.import()
      if (mod.default) {
        scene = new mod.default() as any
        // scene.params = params
        this.engine.add(name, scene)
      }
    }

    const newResources = getResources().filter((r) => !r.isLoaded())

    if (newResources.length > 0) {
      loader.addResources(newResources)

      if (!isLoading) {
        this.goToLoadingForScene(name)
        isLoading = true
      }
      const currentScene = this.engine.currentScene as LoadingScene

      currentScene.onLoadStart()
      loader.on('progress', currentScene.onLoadProgress)

      await loader.load()

      currentScene.onLoadComplete()
      loader.off('progress', currentScene.onLoadProgress)
    }

    this.currentScene = name
    this.engine.goToScene(name)
  }

  goToLoadingForScene(name: string) {
    this.engine.goToScene(this.scenes[name].loadingSceneKey)
  }

  getScene(key: string) {
    return this.engine.scenes[key]
  }

  getCurrentScene() {
    return this.getScene(this.currentScene)
  }
}
