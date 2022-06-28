import { Engine, Actor } from 'excalibur'

export class HTMLUI extends Actor {
  element: HTMLElement
  engine: Engine

  constructor({
    tag = 'div',
    id,
    parent = document.body,
  }: {
    tag?: string
    id?: string
    parent?: HTMLElement
  } = {}) {
    super()
    this.element = document.createElement(tag)

    this.element.style.position = 'absolute'
    this.element.style.top = '0'
    this.element.style.left = '0'
    this.element.style.right = '0'
    this.element.style.bottom = '0'

    if (id) {
      this.element.id = id
    }

    parent.appendChild(this.element)
    window.addEventListener('resize', this.resizeToCanvas)
  }

  onInitialize(engine: Engine): void {
    this.engine = engine
    this.resizeToCanvas()
  }

  resizeToCanvas = () => {
    if (this.element) {
      const { width, height, left, top } =
        this.engine.canvas.getBoundingClientRect()

      const scaledWidth = width / this.engine.drawWidth
      const scaledHeight = height / this.engine.drawHeight

      this.element.style.width = `${this.engine.drawWidth}px`
      this.element.style.height = `${this.engine.drawHeight}px`
      this.element.style.left = `${left}px`
      this.element.style.top = `${top}px`

      this.element.style.transformOrigin = '0 0'
      this.element.style.transform = `scale(${scaledWidth}, ${scaledHeight})`
    }
  }

  onPreKill() {
    this.element.remove()
    window.removeEventListener('resize', this.resizeToCanvas)
  }
}
