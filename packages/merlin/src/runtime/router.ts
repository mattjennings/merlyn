import { Engine } from 'excalibur'
import { Transition } from '..'
import { Manifest, SceneData } from '../cli/util/types'
import { LoadingScene } from '../LoadingScene'
import { Scene } from '../Scene'
import { loader, getResources } from './resources'

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
      transition?: (out: boolean) => Transition
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
    if (!isFirstScene) {
      await executeTransition({
        out: true,
        scene: this.engine.currentScene,
        transition: options.transition?.(true),
      })
    }

    // add scene to game if necessary
    if (!scene) {
      isOnLoadingScreen = true
      await this.goToLoadingForScene(name, {
        skipIntroTransition: !isFirstScene,
      })
      scene = await this.loadSceneFile(name)
    }

    // process resource loading
    const newResources = getResources().filter((r) => !r.isLoaded())
    if (newResources.length > 0 || isOnLoadingScreen) {
      loader.addResources(newResources)

      // if we're not already on a loading screen, go to it
      if (!isOnLoadingScreen) {
        await this.goToLoadingForScene(name, {
          skipIntroTransition: !isFirstScene,
        })
      }

      const currentScene = this.engine.currentScene as LoadingScene

      currentScene.onLoadStart()
      loader.on('progress', currentScene.onLoadProgress)

      await loader.load()

      // play outro for loading scene
      await executeTransition({
        out: true,
        scene: this.engine.currentScene,
      })

      currentScene.onLoadComplete()
      loader.off('progress', currentScene.onLoadProgress)
    }

    this.currentScene = scene
    this.engine.goToScene(name)

    // play intro transition for new scene
    await executeTransition({
      out: false,
      scene,
      transition: options.transition?.(false),
    })
  }

  /**
   * Navigates to the loading scene for the given scene.
   */
  async goToLoadingForScene(
    name: string,
    options: {
      /**
       * Skips the intro transition from playing for the loading scene
       */
      skipIntroTransition?: boolean
    } = {}
  ) {
    this.engine.goToScene(this.scenes[name].loadingSceneKey)

    if (!options.skipIntroTransition) {
      await executeTransition({
        out: false,
        scene: this.engine.currentScene,
      })
    }
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
  out,
}: {
  scene: ex.Scene
  out: boolean
  transition?: Transition
}) {
  // @ts-ignore
  return scene?._executeTransition(out, transition)
}
