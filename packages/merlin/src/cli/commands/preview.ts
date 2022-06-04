import {
  createServer as createViteServer,
  InlineConfig,
  ViteDevServer,
} from 'vite'
import path from 'path'
import del from 'del'
import createManifestData from '../util/create-manifest-data'
import { createApp } from '../util/create-app'
import chokidar from 'chokidar'
import kleur from 'kleur'
import merge from 'deepmerge'
import { getMerlinConfig, getViteConfig } from '../config'
import sirv from 'sirv'
import polka from 'polka'
import fs from 'fs'
export default async function preview({
  cwd = process.cwd(),
  port = 3000,
} = {}) {
  const {
    build: { outDir },
  } = await getMerlinConfig({ cwd })

  if (!fs.existsSync(outDir)) {
    console.error(
      kleur.red(
        `${outDir} folder does not exist - please run "merlin build" first`
      )
    )
    process.exit(1)
  }

  polka()
    .use(sirv(outDir))
    .listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on localhost:${port}!`)
    })
}
