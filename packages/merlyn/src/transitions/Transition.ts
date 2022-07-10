import type { ActorArgs } from 'excalibur'
import { Actor } from 'excalibur'

export interface TransitionArgs extends ActorArgs {
  duration?: number
  easing?: (t: number) => number
}

export class Transition extends Actor {
  duration: number
  easing: (t: number) => number
  isOutro = false

  private progress = 0
  private started = false

  constructor({
    duration = 300,
    easing = (t) => t,
    ...args
  }: TransitionArgs = {}) {
    super(args)

    this.duration = duration
    this.easing = easing

    this.on('preupdate', (ev) => {
      if (this.started) {
        this.progress += Math.min(ev.delta / this.duration, 1)
        this.emit(this.isOutro ? 'outro' : 'intro', this.easing(this.progress))

        if (this.progress >= 1) {
          this.emit(this.isOutro ? 'outrocomplete' : 'introcomplete', undefined)
          this.started = false
          this.progress = 0
        }
      }
    })

    this.on('introstart', this.onIntroStart.bind(this))
    this.on('intro', this.onIntro.bind(this))
    this.on('introcomplete', this.onIntroComplete.bind(this))
    this.on('outrostart', this.onOutroStart.bind(this))
    this.on('outro', this.onOutro.bind(this))
    this.on('outrocomplete', this.onOutroComplete.bind(this))
  }

  onIntroStart() {}

  onIntro(progress: number) {}

  onIntroComplete() {}

  onOutroStart() {}

  onOutro(progress: number) {}

  onOutroComplete() {}

  async _execute(isOutro?: boolean, progress = 0) {
    this.isOutro = isOutro
    if (!this.isInitialized) {
      await new Promise((resolve) => {
        this.on('initialize', resolve)
      })
    }

    this.started = true
    this.progress = progress

    this.emit(isOutro ? 'outrostart' : 'introstart', undefined)

    return new Promise((resolve) => {
      this.on(isOutro ? 'outrocomplete' : 'introcomplete', () => {
        resolve(null)
      })
    })
  }
}
