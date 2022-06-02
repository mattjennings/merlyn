/* eslint-disable @typescript-eslint/no-empty-function */
import { Loadable, Loader, Scene as ExScene } from 'excalibur'
import { SimpleLoader } from './SimpleLoader'

export interface LoadingSceneArgs {
  resources: Loadable<any>[]
  next: string
}

export class LoadingScene extends ExScene {
  next: string
  resources: Loadable<any>[]
  loader: Loader

  constructor({ resources, next }: LoadingSceneArgs) {
    super()
    this.resources = resources
    this.loader = new SimpleLoader(resources)
    this.next = next
  }

  public onInitialize(engine: ex.Engine) {
    super.onInitialize(engine)
    if (this.loader && !this.loader.isLoaded()) {
      this.onLoadStart()
      engine.start(this.loader).then(() => {
        this.onLoadComplete()
      })
    } else {
      this.onLoadComplete()
    }
  }

  public onLoadStart() {}

  public onLoadComplete() {
    // @ts-ignore
    this.engine.goToScene(this.next, true)
  }
}
