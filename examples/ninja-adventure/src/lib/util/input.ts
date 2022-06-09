import { engine } from '$game'

const controls = {
  up: [ex.Input.Keys.W, ex.Input.Keys.ArrowUp],
  down: [ex.Input.Keys.S, ex.Input.Keys.ArrowDown],
  left: [ex.Input.Keys.A, ex.Input.Keys.ArrowLeft],
  right: [ex.Input.Keys.D, ex.Input.Keys.ArrowRight],
  interact: [ex.Input.Keys.Space],
  attack: [ex.Input.Keys.Space],
}

const inputToName: Record<any, keyof typeof controls | undefined> =
  Object.entries(controls).reduce((acc, [name, inputs]) => {
    inputs.forEach((input) => {
      // @ts-ignore
      acc[input] = name
    })
    return acc
  }, {})

export function isKeyHeld(key: keyof typeof controls) {
  return controls[key].some((k) => engine.input.keyboard.isHeld(k))
}

type Direction = 'up' | 'down' | 'left' | 'right'

/**
 * Returns the 2 most recent direction inputs that are being held
 */
export function getHeldDirections(): [Direction?, Direction?] {
  return engine.input.keyboard
    .getKeys()
    .filter((key) => {
      return (
        controls.up.includes(key) ||
        controls.down.includes(key) ||
        controls.left.includes(key) ||
        controls.right.includes(key)
      )
    })
    .slice(-2)
    .map((k) => inputToName[k]) as any
}
