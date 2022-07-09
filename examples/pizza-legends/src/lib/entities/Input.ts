import { engine } from '$game'

type Direction = 'up' | 'down' | 'left' | 'right'

const controls = {
  up: [ex.Input.Keys.W, ex.Input.Keys.ArrowUp],
  down: [ex.Input.Keys.S, ex.Input.Keys.ArrowDown],
  left: [ex.Input.Keys.A, ex.Input.Keys.ArrowLeft],
  right: [ex.Input.Keys.D, ex.Input.Keys.ArrowRight],
  interact: [ex.Input.Keys.Space, ex.Input.Keys.Enter],
  cancel: [
    ex.Input.Keys.Escape,
    ex.Input.Keys.Backspace,
    ex.Input.Keys.ShiftLeft,
  ],
}

const keyMap = new Map<ex.Input.Keys, keyof typeof controls>()
Object.entries(controls).forEach(([name, inputs]) => {
  inputs.forEach((input) => {
    keyMap.set(input, name as keyof typeof controls)
  })
})

export class Input extends ex.Entity {
  isKeyHeld(key: keyof typeof controls) {
    return controls[key].some((k) => engine.input.keyboard.isHeld(k))
  }

  getHeldDirection(): Direction | null {
    const lastKey = engine.input.keyboard
      .getKeys()
      .filter((key) => {
        return [
          ...controls.up,
          ...controls.down,
          ...controls.left,
          ...controls.right,
        ].includes(key)
      })
      .pop()

    if (lastKey) {
      return keyMap.get(lastKey) as Direction
    }

    return null
  }
}
