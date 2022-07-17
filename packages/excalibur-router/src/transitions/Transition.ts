import type { ActorArgs } from 'excalibur'
import { Actor } from 'excalibur'

export interface TransitionArgs extends ActorArgs {
  duration?: number | { outro: number; intro: number }
  easing?: (t: number) => number

  /**
   * Carries the outro state of the transition to the loading scene. Be wary
   * of the z-indexes you use, as the transition might overlay (or get overlayed by) the loading scene
   * entities.
   *
   * If a number is provided, it will only persist for that length of time in ms before introing
   * to the loading scene. It will outro when loading scene completes and intro again
   * on the following scene.
   */
  persistOnLoading?: boolean | number
}

export class Transition extends Actor {
  duration: { outro: number; intro: number }
  easing: (t: number) => number
  persistOnLoading: boolean | number

  isOutro = false
  progress = 0
  started = false

  constructor({
    duration = 300,
    easing = (t) => t,
    ...args
  }: TransitionArgs = {}) {
    super(args)

    this.duration =
      typeof duration === 'number'
        ? { outro: duration, intro: duration }
        : duration
    this.easing = easing
    this.persistOnLoading = args.persistOnLoading

    this.on('preupdate', (ev) => {
      if (this.started) {
        this.progress += Math.min(ev.delta / this.getDuration(), 1)
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

  private getDuration() {
    return this.isOutro ? this.duration.outro : this.duration.intro
  }

  onIntroStart() {}

  onIntro(progress: number) {}

  onIntroComplete() {}

  onOutroStart() {}

  onOutro(progress: number) {}

  onOutroComplete() {}

  async execute(isOutro?: boolean, progress = 0) {
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
