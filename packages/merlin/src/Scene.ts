/* eslint-disable @typescript-eslint/no-empty-function */
import * as ex from 'excalibur'
import { Transition } from './transitions'

export class Scene extends ex.Scene {
  private _merlin = true

  public transition() {}

  public onOutroStart() {}
  public onOutro(progress: number) {}
  public onOutroComplete() {}

  public onIntroStart() {}
  public onIntro(progress: number) {}
  public onIntroComplete() {}
}
