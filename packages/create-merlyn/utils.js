import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/** @param {string} dir */
export function mkdirp(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (e) {
    if (e.code === 'EEXIST') return
    throw e
  }
}

/** @param {string} path */
export function rimraf(path) {
  // prettier-ignore
  (fs.rmSync || fs.rmdirSync)(path, { recursive: true, force: true })
}

/**
 * @template T
 * @param {T} x
 */
function identity(x) {
  return x
}

export function copy(from, to, opts) {
  const { filter = identity, rename = identity } = opts || {}
  if (!fs.existsSync(from)) return

  const stats = fs.statSync(from)

  if (stats.isDirectory()) {
    fs.readdirSync(from).forEach((file) => {
      if (filter(file)) {
        copy(path.join(from, file), path.join(to, rename(file)))
      }
    })
  } else {
    mkdirp(path.dirname(to))
    fs.copyFileSync(from, to)
  }
}

/** @param {string} path */
export function dist(path) {
  return fileURLToPath(new URL(`./dist/${path}`, import.meta.url).href)
}
