import { Scene } from 'excalibur'
import { Loader } from './Loader.js'
import type { Transition } from './transitions/Transition.js'

export interface RouterArgs<
  Routes extends Record<
    string,
    Scene | (() => Promise<{ default: typeof Scene }>)
  >,
  Loaders extends Record<string, Scene>
> {
  routes: Routes
  loaders?: Loaders
  defaultLoader?: Extract<keyof Loaders, string>
}

export class Router<
  Routes extends Record<
    string,
    Scene | (() => Promise<{ default: typeof Scene }>)
  >,
  Loaders extends Record<string, Scene>
> {
  engine: ex.Engine
  routes: Routes

  isTransitioning = false
  isBooting = true

  private loader = new Loader()
  private loaders: Loaders
  private defaultLoader: Extract<keyof Loaders, string> | undefined

  constructor(engine: ex.Engine, args: RouterArgs<Routes, Loaders>) {
    this.engine = engine
    this.routes = args.routes
    this.loaders = args.loaders || ({} as any)
    this.defaultLoader = args.defaultLoader

    Object.entries(this.routes).forEach(([key, value]) => {
      if (value instanceof Scene) {
        this.engine.add(key, value)
      }
    })

    Object.entries(this.loaders).forEach(([key, value]) => {
      this.engine.add(key, value)
    })
  }

  async goto<Data = any>(
    name: string,
    options: {
      data?: Data
      loading?: string
      transition?: Transition
      onActivate?: (scene: Scene) => void
    } = {}
  ) {
    let transition = options.transition
    let scene = this.engine.scenes[name] as Scene

    // check if scene exists
    if (!this.routes[name]) {
      throw new Error(`No scene named ${name}`)
    }

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
    if (!transition) {
      transition = this.engine.currentScene?.transition
    }

    this.engine.goToScene(name, options.data)

    // play intro transition
    await this.executeTransition({
      type: 'intro',
      transition,
    })

    this.isBooting = false
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
        const sceneData = this.routes[name]

        scene = isDynamicScene(sceneData)
          ? await sceneData().then((r) => {
              const mod = r.default

              if (!mod) {
                throw new Error(
                  `"${name}" does not export default a Scene class`
                )
              }

              return new mod()
            })
          : sceneData

        // @ts-ignore
        scene.name = name
        // scene.params = params
        this.engine.add(name, scene)
      }

      if (!this.loader.isLoaded()) {
        const currentScene = this.engine.currentScene

        const deferPromise = new Promise((resolve) => {
          // @ts-ignore
          if (currentScene.defer) {
            currentScene.once('continue', resolve)
          } else {
            resolve(undefined)
          }
        })

        currentScene.onLoadStart?.()

        const onProgress = ({ progress }) => {
          this.engine.currentScene.onLoad?.(progress)
        }

        this.loader.on('progress', onProgress)

        await this.loader.load()
        currentScene.onLoadComplete?.()
        this.loader.off('progress', onProgress)

        await deferPromise
      }
    }
    return scene
  }

  private async loadScene(
    name: string,
    options: { transition?: Transition; loader?: string } = {}
  ) {
    let transition = options.transition
    const loader = options.loader ?? this.defaultLoader

    if (this.sceneNeedsLoading(name)) {
      // skip outro if this is initial loading screen
      if (!this.isBooting) {
        await this.executeTransition({
          type: 'outro',
          transition,
        })
      }

      // if initial loading screen uses resources, load them
      // if (isBooting && this.manifest.scenes.loading.resources.length) {
      //   loader.addResources(this.manifest.scenes.loading.resources)
      //   await loader.load()
      // }

      // go to loading scene
      if (loader) {
        this.engine.goToScene(loader)
      }

      if (!transition) {
        transition = this.engine.currentScene?.transition
      }

      let delayedIntro: number
      let shouldOutro = Boolean(transition && this.isBooting) // always outro if initial loading screen

      // play intro into loading scene
      if (!this.isBooting && transition) {
        // carry transition instance into loading scene
        if (transition.persistOnLoading !== false) {
          this.engine.add(transition)
        }

        if (typeof transition.persistOnLoading === 'number') {
          delayedIntro = setTimeout(() => {
            this.executeTransition({
              type: 'intro',
              transition,
            })
            shouldOutro = true
          }, transition.persistOnLoading)
        } else if (transition.persistOnLoading === false) {
          await this.executeTransition({
            type: 'intro',
            transition,
          })
          shouldOutro = true
        }
      }

      // load assets for scene
      await this.preloadScene(name)

      if (shouldOutro) {
        // transition won't have been added yet if booting
        if (this.isBooting) {
          this.engine.add(transition)
        }

        await this.executeTransition({
          type: 'outro',
          transition,
        })
      }

      clearTimeout(delayedIntro)
    }

    return this.engine.scenes[name]
  }

  addResources(loadables: ex.Loadable<any>[]) {
    return this.loader.addResources(loadables)
  }

  private sceneNeedsLoading(name: string) {
    if (!this.engine.scenes[name]) {
      return true
    }

    return this.loader.isLoaded()
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
      this.isTransitioning = true
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

      await transition.execute(type === 'outro', progress)

      if (type === 'intro') {
        scene.onIntroComplete?.()

        // transition is complete, remove it
        transition.kill()
      } else {
        scene.onOutroComplete?.()
      }

      scene.isTransitioning = false
      this.isTransitioning = false
    }

    return transition
  }
}

function isDynamicScene(
  scene: Scene | (() => Promise<{ default: typeof Scene }>)
): scene is () => Promise<{ default: typeof Scene }> {
  return !(scene instanceof Scene)
}
