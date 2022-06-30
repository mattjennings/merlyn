import { Engine, Actor } from 'excalibur'

/**
 * When 'native' the UI will be sized to the actual "css" pixels of the canvas.
 * 1em = 1px in the game.
 *
 * When 'scaled' the UI will be sized to the resolution of the game and scaled
 * up to fit the canvas. 1px = 1px in the game.
 */
type Resolution = 'native' | 'scaled'

export class HTMLUI extends Actor {
  element: HTMLElement
  engine: Engine
  resolution: Resolution

  resizeObserver: ResizeObserver | null = null

  constructor({
    tag = 'div',
    id,
    parent = document.body,
    resolution = 'scaled',
  }: {
    tag?: string
    id?: string
    parent?: HTMLElement
    resolution?: Resolution
  } = {}) {
    super()
    this.resolution = resolution
    this.element = document.createElement(tag)
    this.element.style.position = 'absolute'

    if (id) {
      this.element.id = id
    }

    parent.appendChild(this.element)
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeToCanvas()
    })
    this.resizeObserver.observe(document.body)
  }

  onInitialize(engine: Engine): void {
    this.engine = engine
    this.resizeToCanvas()
  }

  resizeToCanvas = () => {
    if (this.element && this.engine?.canvas) {
      const { width, height, left, top, bottom, right } =
        this.engine.canvas.getBoundingClientRect()

      const scaledWidth = width / this.engine.drawWidth
      const scaledHeight = height / this.engine.drawHeight

      this.element.style.top = `${top}px`
      this.element.style.left = `${left}px`
      this.element.style.bottom = `${bottom}px`
      this.element.style.right = `${right}px`
      this.element.style.overflow = 'hidden'

      if (this.resolution === 'scaled') {
        this.element.style.width = `${this.engine.drawWidth}px`
        this.element.style.height = `${this.engine.drawHeight}px`
        this.element.style.transform = `scale(${scaledWidth}, ${scaledHeight})`
        this.element.style.transformOrigin = '0 0'
      } else {
        this.element.style.width = `${width}px`
        this.element.style.height = `${height}px`
        this.element.style.fontSize = `${
          scaledWidth > scaledHeight ? scaledWidth : scaledHeight
        }px`
        this.element.style.setProperty('--px', `${scaledWidth}px`)
      }
    }
  }

  onPreKill() {
    this.element.remove()
    this.resizeObserver.disconnect()
  }
}
