import { AsepriteResource } from '@excaliburjs/plugin-aseprite'
import { TiledMapResource } from '@excaliburjs/plugin-tiled'
import type { Loadable } from 'excalibur'
import { ImageSource, Sound } from 'excalibur'
import { router } from './index.js'

const resourceLoaders: Record<
  string,
  { load: (url, options) => ex.Loadable<any>; extensions?: string[] }
> = {
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
  aseprite: {
    load: (url, options) => new AsepriteResource(url, options.bustCache),
  },
}

// resources loaded by $res before router started
export const queuedResources = []

export function addResourceByUrl(url: string, options?: { as?: string }) {
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
    if (router) {
      router.addResource(resource)
    } else {
      if (!queuedResources.includes(resource)) {
        queuedResources.push(resource)
      }
    }
    return resource
  }

  throw new Error(`No loader found for .${type} file`)
}

export function addResourceLoader<Options extends { as?: string }>(
  type: string,
  args: {
    load: (url: string, options?: Options) => Loadable<unknown>
    extensions?: string[]
  }
) {
  Object.assign(resourceLoaders, {
    [type]: args,
  })
}
