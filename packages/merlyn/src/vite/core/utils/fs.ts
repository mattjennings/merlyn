import fs from 'fs'
import path from 'path'

export function mkdirp(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (e) {
    if (e.code === 'EEXIST') return
    throw e
  }
}

export function rimraf(path: string) {
  fs.rmSync(path, { force: true, recursive: true })
}

export function copy(
  source: string,
  target: string,
  opts: {
    filter?: (basename: string) => boolean
    replace?: Record<string, string>
  } = {}
) {
  if (!fs.existsSync(source)) return []

  const files: string[] = []

  const prefix = posixify(target) + '/'

  const regex = opts.replace
    ? new RegExp(`\\b(${Object.keys(opts.replace).join('|')})\\b`, 'g')
    : null

  function go(from: string, to: string) {
    if (opts.filter && !opts.filter(path.basename(from))) return

    const stats = fs.statSync(from)

    if (stats.isDirectory()) {
      fs.readdirSync(from).forEach((file) => {
        go(path.join(from, file), path.join(to, file))
      })
    } else {
      mkdirp(path.dirname(to))

      if (opts.replace) {
        const data = fs.readFileSync(from, 'utf-8')
        fs.writeFileSync(
          to,
          data.replace(
            /** @type {RegExp} */ regex,
            (match, key) =>
              /** @type {Record<string, string>} */ opts.replace[key]
          )
        )
      } else {
        fs.copyFileSync(from, to)
      }

      files.push(
        to === target
          ? posixify(path.basename(to))
          : posixify(to).replace(prefix, '')
      )
    }
  }

  go(source, target)

  return files
}

export function walk(
  cwd: string,
  { dirs, dot }: { dirs?: boolean; dot?: boolean } = {}
) {
  const all_files: string[] = []

  function walk_dir(dir: string) {
    const files = fs.readdirSync(path.join(cwd, dir))

    for (const file of files) {
      if (!dot && file[0] === '.') continue

      const joined = path.join(dir, file)
      const stats = fs.statSync(path.join(cwd, joined))
      if (stats.isDirectory()) {
        if (dirs) all_files.push(joined)
        walk_dir(joined)
      } else {
        all_files.push(joined)
      }
    }
  }

  return walk_dir(''), all_files
}

export function posixify(str: string) {
  return str.replace(/\\/g, '/')
}
