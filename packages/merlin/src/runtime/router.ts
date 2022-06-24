import { Engine } from 'excalibur'
import { Transition } from '..'
import { Manifest, SceneData } from '../cli/util/types'
import { LoadingScene } from '../LoadingScene'
import { Scene } from '../Scene'
import { loader, getResources } from './resources'

export let isTransitioning = false

export class Router {
  currentScene?: Scene
  scenes: Record<
    string,
    {
      import: () => Promise<{ default: typeof Scene }>
      loadingSceneKey: string
    }
  >
  engine: ex.Engine

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

    this.engine.start(loader as any).then(() => {
      this.goToScene(manifest.bootScene)
    })
  }

  async goToScene(
    name: string,
    options: {
      params?: Record<string, any>
      transition?: Transition
    } = {}
  ) {
    const sceneData = this.scenes[name]
    const isFirstScene = !this.currentScene
    let scene = this.engine.scenes[name] as Scene
    let isOnLoadingScreen = false

    // check if scene exists
    if (!sceneData) {
      throw new Error(`No scene named ${name}`)
    }

    // play outro transition on current scene
    if (options.transition) {
      await executeTransition({
        isOutro: true,
        scene: this.engine.currentScene,
        transition: options.transition,
      })
    }

    // add scene to game if necessary
    if (!scene) {
      isOnLoadingScreen = true
      this.goToLoadingForScene(name)
      if (options.transition) {
        this.engine.add(options.transition)
      }
      scene = await this.loadSceneFile(name)
    }

    // process resource loading
    const newResources = getResources().filter((r) => !r.isLoaded())
    if (newResources.length > 0 || isOnLoadingScreen) {
      loader.addResources(newResources)

      const currentScene = this.engine.currentScene as LoadingScene

      currentScene.onLoadStart()
      loader.on('progress', currentScene.onLoadProgress)

      await loader.load()

      currentScene.onLoadComplete()
      loader.off('progress', currentScene.onLoadProgress)
    }

    this.currentScene = scene
    this.engine.goToScene(name)

    // play intro transition for new scene
    if (options.transition) {
      await executeTransition({
        isOutro: false,
        scene,
        transition: options.transition,
      })
    }
  }

  /**
   * Navigates to the loading scene for the given scene.
   */
  async goToLoadingForScene(name: string) {
    this.engine.goToScene(this.scenes[name].loadingSceneKey)
  }

  getSceneByName(key: string) {
    return this.engine.scenes[key]
  }

  /**
   * Imports the scene file, instantiates the scene and adds it to the engine
   */
  private async loadSceneFile(name: string) {
    const sceneData = this.scenes[name]

    const mod = await sceneData.import()
    if (mod.default) {
      const scene = new mod.default() as Scene

      // @ts-ignore - enforce scenes extend our Scene
      if (!scene._merlin) {
        throw new Error(
          `"${name}" is not a Merlin Scene. Please import and extend Scene from "@mattjennings/merlin"\n\nimport { Scene } from "@mattjennings/merlin"\n`
        )
      }

      // @ts-ignore
      scene.name = name
      // scene.params = params
      this.engine.add(name, scene)
      return scene
    } else {
      throw new Error(`"${name}" does not export default a Scene class`)
    }
  }
}

async function executeTransition({
  scene,
  transition,
  isOutro,
}: {
  scene: ex.Scene
  isOutro: boolean
  transition: Transition
}) {
  isTransitioning = true

  scene.engine.add(transition)

  // @ts-ignore
  await transition._execute(isOutro)

  if (!isOutro) {
    transition.kill()
  }

  isTransitioning = false
}
