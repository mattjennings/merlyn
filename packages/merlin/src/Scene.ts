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

  private async _executeTransition(out: boolean, transition?: Transition) {
    if (!transition) {
      transition = this.getTransition(out)
    }

    if (transition) {
      this.transition = transition
      this.engine.add(transition)

      if (!transition.isInitialized) {
        await new Promise((resolve) => {
          transition.on('initialize', resolve)
        })
      }

      this.onTransitionStart(out)
      transition.execute()

      await new Promise((resolve) => {
        transition.on('complete', () => {
          this.onTransitionComplete(out)
          resolve(null)
        })
      })
    }
  }
}
