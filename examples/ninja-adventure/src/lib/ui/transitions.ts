import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'

/**
 * Like svelte/transition, but uses em units for translation
 */
export function fly(
  node: Element,
  {
    delay = 0,
    duration = 400,
    easing = cubicOut,
    x = 0,
    y = 0,
    opacity = 0,
  }: {
    delay?: number
    duration?: number
    easing?: (t: number) => number
    x?: number
    y?: number
    opacity?: number
  } = {}
): TransitionConfig {
  const style = getComputedStyle(node)
  const target_opacity = +style.opacity
  const transform = style.transform === 'none' ? '' : style.transform

  const od = target_opacity * (1 - opacity)

  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}em, ${(1 - t) * y}em);
			opacity: ${target_opacity - od * u}`,
  }
}
