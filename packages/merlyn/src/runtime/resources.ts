import { TiledMapResource } from '@excaliburjs/plugin-tiled'
import type { Loadable } from 'excalibur'
import { ImageSource, Sound } from 'excalibur'
import { Loader } from '../Loader.js'

export const loader = new Loader([])

const imgLoader = (url, options) =>
  new ImageSource(url, options.bustCache, options.filtering)

const sndLoader = (url, options) => new Sound(url)

const resourceLoaders = {
  tmx: (url, options) => {
    const resource = new TiledMapResource(url, {
      mapFormatOverride: options.mapFormatOverride,
      startingLayerZIndex: options.startingLayerZIndex,
    })
    return resource
  },
  png: imgLoader,
  jpeg: imgLoader,
  jpg: imgLoader,
  gif: imgLoader,
  mp3: sndLoader,
  ogg: sndLoader,
  wav: sndLoader,
}

export function getResources() {
  return [...loader.data]
}

export function addResource(url: string, options?: any) {
  let type
  if (url.startsWith('data:')) {
    const [, _type] = url.match(/^data:([^;]+);(base64)?,(.*)$/) || []
    if (_type) {
      type = _type.split('/')[1]
    } else {
      throw new Error(`Invalid data url: ${url}`)
    }
  } else {
    type = url.split('?')[0].split('.').pop()
  }
  const loadResource = resourceLoaders[type]

  if (loader) {
    const resource = loadResource(url, options ?? {})
    loader.addResources([resource])
    return resource
  }

  throw new Error(`No loader found for ${type}`)
}

export function addResourceLoaders(
  loaders: Record<string, (url: string) => Loadable<any>>
) {
  Object.assign(resourceLoaders, loaders)
}
