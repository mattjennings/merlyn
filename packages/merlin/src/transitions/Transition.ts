import { Actor, Entity } from 'excalibur'

export interface TransitionArgs {
  duration?: number
  easing?: (t: number) => number
}

export class Transition extends Actor {
  duration: number
  easing: (t: number) => number
  private startedAt?: number
  private isOutro = false

  constructor({ duration = 300, easing = (t) => t }: TransitionArgs = {}) {
    super()

    this.duration = duration
    this.easing = easing

    this.on('preupdate', () => {
      if (this.startedAt) {
        const progress = (performance.now() - this.startedAt) / this.duration

        this.emit(
          this.isOutro ? 'outroupdate' : 'introupdate',
          this.easing(progress)
        )

        if (progress >= 1) {
          this.emit(this.isOutro ? 'outrocomplete' : 'introcomplete', undefined)
          this.startedAt = 0
        }
      }
    })

    this.on('introstart', this.onIntroStart.bind(this))
    this.on('introupdate', this.onIntroUpdate.bind(this))
    this.on('introcomplete', this.onIntroComplete.bind(this))
    this.on('outrostart', this.onOutroStart.bind(this))
    this.on('outroupdate', this.onOutroUpdate.bind(this))
    this.on('outrocomplete', this.onOutroComplete.bind(this))
  }

  onIntroStart() {}

  onIntroUpdate(progress: number) {}

  onIntroComplete() {}

  onOutroStart() {}

  onOutroUpdate(progress: number) {}

  onOutroComplete() {}

  private async _execute(isOutro?: boolean) {
    if (!this.isInitialized) {
      await new Promise((resolve) => {
        this.on('initialize', resolve)
      })
    }

    this.isOutro = isOutro
    this.startedAt = performance.now()
    this.emit(isOutro ? 'outrostart' : 'introstart', undefined)

    return new Promise((resolve) => {
      this.on(isOutro ? 'outrocomplete' : 'introcomplete', () => {
        resolve(null)
      })
    })
  }
}
