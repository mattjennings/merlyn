import { Plugin } from 'vite'
import MagicString from 'magic-string'
import { MerlynConfig } from '../config'
import { getSceneName } from '../util/get-scene-name'

// todo: build custom scene router before revisiting this
// also would be nice to proper hmr resources
// ideas: use handleHotUpdate to invalidate url resource
// otherwise, find some way to use true asset imports again

export function sceneHmr(config: MerlynConfig): Plugin {
  const isScene = (id) => {
    return id.includes(config.scenes.path) && id.match(/\.(t|j)s$/)
  }
  return {
    name: 'vite-plugin-scene-hmr',
    apply: 'serve',
    transform(code, id, options) {
      if (options?.ssr || id.includes('node_modules')) return

      if (isScene(id)) {
        const name = getSceneName(id, config.scenes.path)
        const s = new MagicString(code)
        // this plugin gets compiled by vite, so we need to
        // bypass its auto-replacement of "import.meta.hot"
        const meta = ['import', 'meta', 'hot'].join('.')

        s.append(`      
import { resources, engine, goToScene } from '$game'
import { SimpleLoader } from 'merlyn'

if (${meta}) {
  ${meta}.accept((mod) => {
    const name = engine.currentScene.__merlyn?.name
    console.log(name)

    engine.addScene('${name}', new mod.default())
    if (name === '${name}') {
      engine.start(new SimpleLoader(resources)).then(() => {
        goToScene('${name}')
      })
    }
  })
}`)
        return {
          code: s.toString(),
          map: s.generateMap(),
        }
      }
    },
  }
}
