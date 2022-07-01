import { engine } from '$game'

export function coroutine<T>(
  callback: (this: T) => any,
  _this: T,
  event: 'postupdate' | 'preupdate' = 'preupdate'
) {
  const generator = callback.call(_this)

  const loopFn = () => {
    const result = generator.next()
    if (result.done) {
      engine.off(event, loopFn)
    }
  }
  engine.on(event, loopFn)
}

export function gridToPx(value: number) {
  return Math.floor(value * 16)
}

export function snapToGrid(vec: ex.Vector) {
  return ex.vec(Math.round(vec.x / 16) * 16, Math.round(vec.y / 16) * 16)
}
