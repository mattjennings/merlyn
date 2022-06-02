import vite from 'vite'
import path from 'path'
import del from 'del'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import dts from 'vite-plugin-dts'

const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = require('../../package.json')

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
  'path',
  'fs',
]

const mode = process.env.NODE_ENV ?? 'production'

await del(path.join(__dirname, '../../dist'))

// cli
await vite.build({
  mode,
  build: {
    watch: mode === 'development' ? {} : null,
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, '../../src/cli/index.ts'),
      fileName: () => 'cli.js',
      formats: ['cjs'],
    },
    rollupOptions: {
      external,
    },
  },
})

// runtime
await vite.build({
  mode,
  build: {
    watch: mode === 'development' ? {} : null,
    sourcemap: true,
    emptyOutDir: false,
    target: 'es2015',
    lib: {
      entry: path.resolve(__dirname, '../../src/runtime/index.ts'),
      fileName: () => 'runtime.js',
      formats: ['esm'],
    },
    rollupOptions: {
      external,
    },
  },
})

// main
await vite.build({
  mode,
  build: {
    watch: mode === 'development' ? {} : null,
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, '../../src/index.ts'),
      name: 'merlin',
      fileName: (format) => `index.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external,
    },
  },
  plugins: [dts()],
})
