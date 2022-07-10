import { mkdirp, copy } from './utils.js'
import { fileURLToPath } from 'url'
import path from 'path'

const base = path.parse(fileURLToPath(import.meta.url)).dir

export async function create(cwd, options) {
  mkdirp(cwd)
  const dir = path.join(base, `templates/${options.template}`)

  copy(dir, cwd, {
    rename: (file) => file.replace(/^dot-/, '.'),
    filter: (file) => !file.match(/node_modules|.merlyn/),
  })
}
