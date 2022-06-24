export default class Loading extends ex.Scene {
  el!: HTMLElement

  onActivate() {
    this.el = document.createElement('div')
    this.el.className = 'loader'
    this.el.style.position = 'absolute'
    this.el.style.bottom = '-50px'
    this.el.style.right = '10px'

    this.el.style.opacity = '0'
    this.el.style.transition = 'opacity 0.3s'

    document.querySelector('#ui')?.appendChild(this.el)
    setTimeout(() => {
      this.el.style.opacity = '1'
    }, 500)
  }

  onTransitionStart(out: boolean) {
    if (out) {
      this.el.style.opacity = '0'
    }
  }

  onDeactivate() {
    this.el.remove()
  }
}
