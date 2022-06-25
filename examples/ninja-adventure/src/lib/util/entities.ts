import { engine } from '$game'

export function coroutine(
  callback: () => any,
  event: 'postupdate' | 'preupdate' = 'preupdate'
) {
  const generator = callback()

  const loopFn = () => {
    const result = generator.next()
    if (result.done) {
      engine.off(event, loopFn)
    }
  }
  engine.on(event, loopFn)
}
