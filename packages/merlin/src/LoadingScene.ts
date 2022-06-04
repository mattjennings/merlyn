/* eslint-disable @typescript-eslint/no-empty-function */
import * as ex from 'excalibur'
import { SimpleLoader } from './SimpleLoader'

export interface LoadingSceneArgs {
  resources: ex.Loadable<any>[]
  next: string
}

export class LoadingScene extends ex.Scene {
  next: string
  resources: ex.Loadable<any>[]
  loader: ex.Loader

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
