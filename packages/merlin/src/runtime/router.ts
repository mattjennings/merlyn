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

  async goToScene(
    name: string,
    options: {
      params?: Record<string, any>
      transition?: (out: boolean) => Transition
    } = {}
  ) {
    const sceneData = this.scenes[name]
    const isFirstScene = !this.hasStarted

    if (!sceneData) {
      throw new Error(`No scene named ${name}`)
    }

    if (!this.hasStarted) {
      await this.engine.start(loader as any)
      this.hasStarted = true
    } else {
      await executeTransition({
        out: true,
        scene: this.engine.currentScene,
        transition: options.transition?.(true),
      })
    }

    let scene = this.engine.scenes[name] as Scene
    let isLoading = false

    // add scene to game if not already added
    if (!scene) {
      this.goToLoadingForScene(name)
      isLoading = true

      if (!isFirstScene) {
        await executeTransition({
          out: false,
          scene: this.engine.currentScene,
          transition: options.transition?.(false),
        })
      }

      const mod = await sceneData.import()
      if (mod.default) {
        scene = new mod.default() as any

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
      }
    }

    const newResources = getResources().filter((r) => !r.isLoaded())

    if (newResources.length > 0 || isLoading) {
      loader.addResources(newResources)

      if (!isLoading) {
        this.goToLoadingForScene(name)
        isLoading = true

        if (!isFirstScene) {
          await executeTransition({
            out: false,
            scene: this.engine.currentScene,
            transition: options.transition?.(false),
          })
        }
      }
      const currentScene = this.engine.currentScene as LoadingScene

      currentScene.onLoadStart()
      loader.on('progress', currentScene.onLoadProgress)

      await loader.load()

      await executeTransition({
        out: true,
        scene: this.engine.currentScene,
        transition: options.transition?.(true),
      })

      currentScene.onLoadComplete()
      loader.off('progress', currentScene.onLoadProgress)
    }

    this.currentScene = scene
    this.engine.goToScene(name)

    await executeTransition({
      out: false,
      scene,
      transition: options.transition?.(false),
    })
  }

  goToLoadingForScene(name: string) {
    this.engine.goToScene(this.scenes[name].loadingSceneKey)
  }

  getSceneByName(key: string) {
    return this.engine.scenes[key]
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
