import { Transition } from '../transitions'
import { Manifest } from '../cli/util/types'
import { loader, getResources } from './resources'
import { Scene } from 'excalibur'

export let isTransitioning = false

export class Router {
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
      onComplete?: (scene: Scene) => void
    } = {}
  ) {
    const sceneData = this.scenes[name]
    let scene = this.engine.scenes[name] as Scene

    // check if scene exists
    if (!sceneData) {
      throw new Error(`No scene named ${name}`)
    }

    // play outro transition
    const transition = await this.executeTransition({
      isOutro: true,
      transition: options.transition,
    })

    if (this.sceneNeedsLoading(name)) {
      this.engine.goToScene(this.scenes[name].loadingSceneKey)

      // carry transition instance into loading scene
      if (transition) {
        this.engine.add(transition)
      }
    }

    scene = await this.preloadScene(name)

    this.engine.goToScene(name)
    options.onComplete?.(scene)

    // play intro transition
    await this.executeTransition({
      isOutro: false,
      transition: options.transition,
    })
  }

  get currentScene() {
    return this.engine.currentScene
  }

  getSceneByName(key: string) {
    return this.engine.scenes[key]
  }

  async preloadScene(name: string) {
    let scene = this.engine.scenes[name]
    if (this.sceneNeedsLoading(name)) {
      if (!scene) {
        scene = await this.loadSceneFile(name)
      }

      const newResources = getResources().filter((r) => !r.isLoaded())
      if (newResources.length > 0) {
        loader.addResources(newResources)

        const currentScene = this.engine.currentScene

        currentScene.onLoadStart?.()

        const onProgress = (progress) => {
          this.engine.currentScene.onLoad?.(progress)
        }

        loader.on('progress', onProgress)

        await loader.load()

        currentScene.onLoadComplete?.()
        loader.off('progress', onProgress)
      }
    }
    return scene
  }

  private sceneNeedsLoading(name: string) {
    if (!this.engine.scenes[name]) {
      return true
    }

    return getResources().filter((r) => !r.isLoaded()).length > 0
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

  private async executeTransition({
    isOutro,
    ...options
  }: {
    isOutro: boolean
    transition?: Transition
  }) {
    const scene = this.engine.currentScene
    const transition = options.transition ?? scene.transition?.()

    if (transition) {
      isTransitioning = true
      scene.isTransitioning = true

      scene.engine.add(transition)

      if (isOutro) {
        scene.onOutroStart?.()
      } else {
        scene.onIntroStart?.()
      }

      transition.on('outro', (progress) => {
        scene.onOutro?.(progress as unknown as number)
      })

      transition.on('intro', (progress) => {
        scene.onIntro?.(progress as unknown as number)
      })

      // @ts-ignore
      await transition._execute(isOutro)

      if (!isOutro) {
        scene.onIntroComplete?.()
        transition.kill()
      } else {
        scene.onOutroComplete?.()
      }

      scene.isTransitioning = false
      isTransitioning = false
    }

    return transition
  }
}
