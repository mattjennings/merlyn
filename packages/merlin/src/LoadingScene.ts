import * as ex from 'excalibur'
import { Scene } from './Scene'

export class LoadingScene extends Scene {
  public onInitialize(engine: ex.Engine) {
    super.onInitialize(engine)
  }

  public onLoadStart() {}

  public onLoadComplete() {}

  public onLoadProgress(progress: number) {}
}
