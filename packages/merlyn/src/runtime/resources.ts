import { TiledMapResource } from '@excaliburjs/plugin-tiled'
import type { Loadable } from 'excalibur'
import { ImageSource, Sound } from 'excalibur'
import { Loader } from '../Loader.js'

export const loader = new Loader([])

const resourceLoaders = {
  image: {
    load: (url, options) =>
      new ImageSource(url, options.bustCache, options.filtering),
    extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
  },
  sound: {
    load: (url) => new Sound(url),
    extensions: ['mp3', 'ogg', 'wav'],
  },
  tiled: {
    load: (url, options) => {
      const resource = new TiledMapResource(url, {
        mapFormatOverride: options.mapFormatOverride,
        startingLayerZIndex: options.startingLayerZIndex,
      })
      return resource
    },
    extensions: ['tmx'],
  },
}

export function getResources() {
  return [...loader.data]
}

export function addResource(url: string, options?: { as?: string }) {
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
  const resourceLoader = options?.as
    ? resourceLoaders[options.as]
    : Object.values(resourceLoaders).find((loader) =>
        loader.extensions.includes(type)
      )

  if (resourceLoader) {
    const resource = resourceLoader.load(url, options ?? {})
    loader.addResources([resource])
    return resource
  }

  throw new Error(`No loader found for .${type} file`)
}

export function addResourceLoaders(
  loaders: Record<string, (url: string) => Loadable<any>>
) {
  Object.assign(resourceLoaders, loaders)
}
