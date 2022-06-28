<script lang="ts">
  import { createEventDispatcher, onMount, setContext } from 'svelte'
  import { type Writable, writable } from 'svelte/store'
  import { engine } from '$game'
  import { Input, Vector } from 'excalibur'
  import { controls } from '$lib/util/input'
  import { createFocusTrap } from 'focus-trap'

  export let active = true

  const dispatch = createEventDispatcher()

  interface Action {
    element: HTMLElement
    id: string
  }

  let self: HTMLElement
  let actions = writable<Action[]>([])
  let focused = writable<Action | null>(null)

  function focus({ id, element }: { id?: string; element?: HTMLElement }) {
    const action = $actions.find((a) => {
      if (element) {
        return a.element === element
      } else {
        return a.id === id
      }
    })

    if (action) {
      $focused?.element?.blur()
      action.element.focus({
        preventScroll: true,
      })
      $focused = action
    }
  }

  function register(node: HTMLElement) {
    let action: Action = { element: node, id: node.id }
    actions.update((actions) => [...actions, action])

    node.addEventListener('focus', () => {
      if ($focused?.element !== node) {
        focus(action)
      }
    })

    node.addEventListener('mouseover', () => {
      focus(action)
    })

    node.addEventListener('click', () => {
      node.dispatchEvent(new Event('select'))
    })
    return {
      destroy() {
        actions.update((actions) => actions.filter((a) => a !== action))
      },
    }
  }

  setContext<{
    actions: Writable<Action[]>
    focused: Writable<Action | null>
    focus: (args: { id?: string; element?: HTMLElement }) => void
    register: (node: HTMLElement) => void
  }>('menu', {
    actions,
    focused,
    focus,
    register,
  })

  $: selectableActions = $actions.filter(
    (a) => !a.element.hasAttribute('disabled')
  )
  $: focusTrap = self
    ? createFocusTrap(self, {
        escapeDeactivates: false,
        clickOutsideDeactivates: false,
      })
    : null

  $: if (active && $actions.length) {
    focus($focused ?? selectableActions[0])
    focusTrap?.activate()
  } else if (!active) {
    $focused = null
    focusTrap?.deactivate()
  }

  onMount(() => {
    /**
     * handle navigating menu items via directional input.
     * TLDR: it looks for the closest item in that direction and shifts focus to it
     */
    function handler(ev: Input.KeyEvent) {
      if (active) {
        // direction in degrees. 0 = right
        let direction!: number

        if (controls.up.includes(ev.key)) {
          direction = 270
        } else if (controls.down.includes(ev.key)) {
          direction = 90
        } else if (controls.left.includes(ev.key)) {
          direction = 180
        } else if (controls.right.includes(ev.key)) {
          direction = 0
        } else {
          return
        }

        if (!$focused) {
          focus($actions[0])
        } else if ($focused) {
          const currentBounds = $focused!.element.getBoundingClientRect()

          // find closest element by bounds for each direction
          const closest = selectableActions.reduce(
            (closest, a) => {
              if (a.element === $focused!.element) {
                return closest
              }

              const nextBounds = a.element.getBoundingClientRect()

              // get angle in degrees
              const degrees = (x: number, y: number) =>
                Math.atan2(x, y) * (180 / Math.PI)

              // get angle of element relative to direction of input
              const relativeAngle = (x: number, y: number) =>
                Math.abs((degrees(x, y) - direction) % 180) // mod 180 because we are only looking on one side

              const angle = relativeAngle(
                nextBounds.top - currentBounds.top,
                nextBounds.left - currentBounds.left
              )

              let distance = Infinity

              // down
              if (
                direction === 90 &&
                nextBounds.bottom > currentBounds.bottom
              ) {
                distance = Vector.distance(
                  new Vector(nextBounds.left, nextBounds.bottom),
                  new Vector(currentBounds.left, currentBounds.bottom)
                )
              }
              // up
              else if (
                direction === 270 &&
                nextBounds.top < currentBounds.top
              ) {
                distance = Vector.distance(
                  new Vector(nextBounds.left, nextBounds.top),
                  new Vector(currentBounds.left, currentBounds.top)
                )
              }
              // right
              else if (
                direction === 0 &&
                nextBounds.right > currentBounds.right
              ) {
                distance = Vector.distance(
                  new Vector(nextBounds.right, nextBounds.top),
                  new Vector(currentBounds.right, currentBounds.top)
                )
              }
              // left
              else if (
                direction === 180 &&
                nextBounds.left < currentBounds.left
              ) {
                distance = Vector.distance(
                  new Vector(nextBounds.left, nextBounds.top),
                  new Vector(currentBounds.left, currentBounds.top)
                )
              }

              // if angle is very shallow, prioritize it
              if (angle < 5) {
                distance *= 0.5
              }
              // if angle is very steep, penalize it
              // (not sure about this)
              // else if (angle >= 45) {
              //   distance *= 2.5
              // }

              if (distance > 0 && distance < closest.distance) {
                return { distance, action: a }
              }

              return closest
            },
            { distance: Infinity, action: null as Action | null }
          )

          if (closest?.action) {
            focus(closest.action)
          } else {
            // user tried to navigate "outside" of the menu
            dispatch('edge', direction)
          }
        }
      }
    }

    engine.input.keyboard.on('press', handler as any)
    return () => {
      engine.input.keyboard.off('press', handler)
    }
  })
</script>

<div bind:this={self}>
  <slot {register} />
</div>
