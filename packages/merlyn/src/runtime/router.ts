import type { Transition } from '../transitions/Transition.js'
import type { Manifest, SceneData } from '../vite/core/data/manifest.js'
import { loader, getResources } from './resources.js'
import type { Scene } from 'excalibur'

export let isTransitioning = false
export let isBooting = true

export class Router {
  scenes: Record<string, SceneData>
  engine: ex.Engine
  manifest: Manifest

  constructor(manifest: Manifest) {
    this.manifest = manifest
    this.engine = manifest.game
    this.scenes = {}

    Object.entries(manifest.scenes).forEach(([key, value]) => {
      this.scenes[key] = value

      if (value.isPreloaded) {
        this.preloadScene(key)
      }
    })

    this.engine.start(loader as any).then(() => {
      this.goToScene(manifest.bootScene, {
        transition: manifest.transition,
      }).then(() => {
        isBooting = false
      })
    })
  }

  get currentScene() {
    return this.engine.currentScene
  }

  getSceneByName(name: string) {
    return this.engine.scenes[name]
  }

  async goToScene<Data = any>(name: string, options: GoToSceneOptions<Data>) {
    const { transition } = options
    let scene = this.engine.scenes[name] as Scene

    // check if scene exists
    if (!this.scenes[name]) {
      throw new Error(`No scene named ${name}`)
    }

    // // play outro transition
    // if (!isBooting || transition?.persistOnLoading) {
    //   // if initial scene and persistOnLoading, start transition at completed state of outro
    //   await this.executeTransition({
    //     type: 'outro',
    //     transition,
    //     progress: isBooting ? 1 : 0,
    //   })
    // }

    if (this.sceneNeedsLoading(name)) {
      scene = await this.loadScene(name, options)
    } else {
      await this.executeTransition({
        type: 'outro',
        transition,
      })
    }

    scene.once('activate', () => {
      options.onActivate?.(scene)
    })
    this.engine.goToScene(name, options.data)

    // play intro transition
    await this.executeTransition({
      type: 'intro',
      transition: options.transition,
    })

    return scene
  }

  /**
   * Starts loading all files and assets required for the scene
   */
  async preloadScene(name: string) {
    let scene = this.engine.scenes[name]
    if (this.sceneNeedsLoading(name)) {
      // import scene
      if (!scene) {
        const sceneData = this.scenes[name]

        const Scene =
          sceneData.isPreloaded === false
            ? await sceneData.scene().then((r) => r.default)
            : sceneData.scene

        if (Scene) {
          scene = new Scene()

          // @ts-ignore
          scene.name = name
          // scene.params = params
          this.engine.add(name, scene)
        } else {
          throw new Error(`"${name}" does not export default a Scene class`)
        }
      }

      const newResources = getResources().filter((r) => !r.isLoaded())

      if (newResources.length > 0) {
        const currentScene = this.engine.currentScene

        const deferPromise = new Promise((resolve) => {
          // @ts-ignore
          if (currentScene.defer) {
            currentScene.once('continue', resolve)
          } else {
            resolve(undefined)
          }
        })

        loader.addResources(newResources)
        currentScene.onLoadStart?.()

        const onProgress = ({ progress }) => {
          this.engine.currentScene.onLoad?.(progress)
        }

        loader.on('progress', onProgress)

        await loader.load()
        currentScene.onLoadComplete?.()
        loader.off('progress', onProgress)

        await deferPromise
      }
    }
    return scene
  }

  private async loadScene<Data = any>(
    name: string,
    { transition, ...options }: GoToSceneOptions<Data>
  ) {
    if (this.sceneNeedsLoading(name)) {
      if (!isBooting) {
        await this.executeTransition({
          type: 'outro',
          transition,
        })
      }

      // if initial loading screen uses resources, load them
      if (isBooting && this.manifest.loadingSceneResources.length) {
        loader.addResources(this.manifest.loadingSceneResources)
        await loader.load()
      }

      // go to loading scene
      this.engine.goToScene(this.getLoadingScene(name))

      let delayedIntro: NodeJS.Timeout
      let didIntro = false

      // play intro into loading scene
      if (transition) {
        if (!isBooting) {
          if (typeof transition.persistOnLoading === 'boolean') {
            if (!transition.persistOnLoading) {
              // carry transition instance into loading scene
              this.engine.add(transition)
              await this.executeTransition({
                type: 'intro',
                transition,
              })
              didIntro = true
            }
          } else if (transition.persistOnLoading.delay) {
            // carry transition instance into loading scene
            this.engine.add(transition)
            delayedIntro = setTimeout(() => {
              this.executeTransition({
                type: 'intro',
                transition,
              })
              didIntro = true
            }, transition.persistOnLoading.delay)
          }
        }
      }

      // load assets for scene
      await this.preloadScene(name)

      if (isBooting || didIntro) {
        await this.executeTransition({
          type: 'outro',
          transition,
        })
      }

      clearTimeout(delayedIntro)
    }

    return this.engine.scenes[name]
  }

  private getLoadingScene(name: string) {
    const loadingScenes = Object.entries(this.scenes).find(
      ([sceneName, value]) => {
        return (
          value.isLoadingScene &&
          name.split('/').length === sceneName.split('/').length
        )
      }
    )

    return loadingScenes?.[0] ?? '_loading'
  }

  private sceneNeedsLoading(name: string) {
    if (!this.engine.scenes[name]) {
      return true
    }

    return this.resourcesNeedLoading()
  }

  private resourcesNeedLoading() {
    return getResources().filter((r) => !r.isLoaded()).length > 0
  }

  private async executeTransition({
    type,
    transition,
    progress = 0,
  }: {
    type: 'intro' | 'outro'
    transition?: Transition
    progress?: number
  }) {
    const scene = this.engine.currentScene

    if (transition) {
      isTransitioning = true
      scene.isTransitioning = true

      scene.engine.add(transition)

      if (type === 'outro') {
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

      await transition._execute(type === 'outro', progress)

      if (type === 'intro') {
        scene.onIntroComplete?.()

        // transition is complete, remove it
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

interface GoToSceneOptions<Data = any> {
  data?: Data
  transition?: Transition
  onActivate?: (scene: Scene) => void
}
