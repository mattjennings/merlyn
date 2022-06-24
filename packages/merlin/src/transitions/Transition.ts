import { Actor, Entity } from 'excalibur'

export interface TransitionArgs {
  duration?: number
  easing?: (t: number) => number
}

export class Transition extends Actor {
  duration: number
  easing: (t: number) => number
  isOutro = false
  private startedAt?: number

  constructor({ duration = 300, easing = (t) => t }: TransitionArgs = {}) {
    super()

    this.duration = duration
    this.easing = easing

    this.on('preupdate', () => {
      if (this.startedAt) {
        const progress = (performance.now() - this.startedAt) / this.duration

        this.emit(this.isOutro ? 'outro' : 'intro', this.easing(progress))

        if (progress >= 1) {
          this.emit(this.isOutro ? 'outrocomplete' : 'introcomplete', undefined)
          this.startedAt = 0
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

  async _execute(isOutro?: boolean) {
    this.isOutro = isOutro
    if (!this.isInitialized) {
      await new Promise((resolve) => {
        this.on('initialize', resolve)
      })
    }

    this.startedAt = performance.now()
    this.emit(isOutro ? 'outrostart' : 'introstart', undefined)

    return new Promise((resolve) => {
      this.on(isOutro ? 'outrocomplete' : 'introcomplete', () => {
        resolve(null)
      })
    })
  }
}
