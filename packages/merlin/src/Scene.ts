/* eslint-disable @typescript-eslint/no-empty-function */
import * as ex from 'excalibur'
import { Transition } from './transitions'

export class Scene extends ex.Scene {
  private _merlin = true

  transition?: Transition

  constructor() {
    super()

    this.on('deactivate', () => {
      this.transition?.kill()
      this.transition = undefined
    })
  }

  public getTransition(out: boolean): Transition | undefined {
    return
  }

  public onTransitionStart(out: boolean) {}
  public onTransitionComplete(out: boolean) {}
}
