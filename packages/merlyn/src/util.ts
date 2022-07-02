import { engine } from '$game'

export function coroutine<T>(
  callback: (this: T) => any,
  _this: T,
  event: 'postupdate' | 'preupdate' = 'preupdate'
) {
  return new Promise<void>((resolve) => {
    const generator = callback.call(_this)

    const loopFn = () => {
      const result = generator.next()
      if (result.done) {
        engine.off(event, loopFn)
        resolve(void 0)
      }
    }
    engine.on(event, loopFn)
  })
}
