import type { Scene } from 'excalibur'
import { DefaultLoader } from './DefaultLoader.js'
import { ResourceLoader } from './ResourceLoader.js'
import type { Transition } from './transitions/Transition.js'

export interface RouterArgs<
  Routes extends Record<string, Route>,
  Loaders extends Record<string, typeof Scene>
> {
  routes: Routes
  loaders?: Loaders
}

type Route =
  | typeof Scene
  | (() => Promise<{ default: typeof Scene }>)
  | (() => Promise<typeof Scene>)

export class Router<
  Routes extends Record<string, Route>,
  Loaders extends Record<string, typeof Scene>
> {
  engine: ex.Engine
  routes: Routes

  isTransitioning = false
  isBooting = true

  private resourceLoader = new ResourceLoader()
  private loaders: Loaders
  private defaultLoader: Extract<keyof Loaders, string> | undefined

  constructor(args: RouterArgs<Routes, Loaders>) {
    this.routes = args.routes
    this.loaders = {
      default: DefaultLoader,
      ...args.loaders,
    }
  }

  start(engine: ex.Engine) {
    this.engine = engine
    this.isBooting = true

    Object.entries(this.routes).forEach(([key, value]) => {
      if (isScene(value)) {
        this.engine.add(key, new value())
      }
    })

    Object.entries(this.loaders).forEach(([key, value]) => {
      this.engine.add(key, new value())
    })

    return engine.start(null)
  }

  async goto<Data = any>(
    name: Extract<keyof Routes, string>,
    options: {
      data?: Data
      loader?: Extract<keyof Loaders, string>
      transition?: Transition
      onActivate?: (scene: Scene) => void
    } = {}
  ) {
    const transition = options.transition
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

        const Scene = isScene(sceneData)
          ? sceneData
          : await sceneData().then((r) => {
              if (r.default) {
                return r.default
              }
              return r
            })

        if (Scene) {
          scene = new Scene()
          // @ts-ignore
          scene.name = name
          // scene.params = params
          this.engine.add(name, scene)
        } else {
          throw new Error(`"${name}" did not return a Scene`)
        }
      }

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

      this.resourceLoader.on('progress', onProgress)

      await this.resourceLoader.load()
      currentScene.onLoadComplete?.()
      this.resourceLoader.off('progress', onProgress)
      await deferPromise
    }
    return scene
  }

  private async loadScene(
    name: string,
    options: {
      transition?: Transition
      loader?: Extract<keyof Loaders, string>
    } = {}
  ) {
    const transition = options.transition
    const loader = options.loader ?? 'default'

    if (this.sceneNeedsLoading(name)) {
      // skip outro if this is initial loading screen
      if (!this.isBooting) {
        await this.executeTransition({
          type: 'outro',
          transition,
        })
      }

      // go to loading scene
      this.engine.goToScene(loader)

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

  addResource(loadable: ex.Loadable<any> | ex.Loadable<any>[]) {
    return this.resourceLoader.addResources(
      Array.isArray(loadable) ? loadable : [loadable]
    )
  }

  private sceneNeedsLoading(name: string) {
    if (!this.engine.scenes[name]) {
      return true
    }

    return !this.resourceLoader.isLoaded()
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

function isScene(route: Route): route is typeof Scene {
  return isClass(route)
}

function isClass(obj) {
  if (typeof obj !== 'function') return false

  const descriptor = Object.getOwnPropertyDescriptor(obj, 'prototype')

  if (!descriptor) return false

  return !descriptor.writable
}
