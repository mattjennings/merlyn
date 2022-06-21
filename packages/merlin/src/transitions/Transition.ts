import { Actor, Entity } from 'excalibur'

export interface TransitionArgs {
  out: boolean
  duration?: number
}

export class Transition extends Actor {
  duration: number
  progress = 0
  out: boolean

  private startedAt?: number

  constructor({ duration = 300, out }: TransitionArgs) {
    super()

    this.duration = duration
    this.out = out

    this.on('complete', () => this.onComplete())
    this.on('preupdate', () => {
      if (this.startedAt) {
        this.progress = (performance.now() - this.startedAt) / this.duration
        if (this.progress >= 1) {
          this.emit('complete', undefined)
          this.startedAt = 0
        }
      }
    })
  }

  onStart() {}

  onComplete() {}

  execute() {
    this.progress = 0
    this.startedAt = performance.now()
    this.onStart()
  }
}
