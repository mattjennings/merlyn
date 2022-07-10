#!/usr/bin/env node
// shamelessly copied from create-svelte

import fs from 'fs'
import path from 'path'
import { bold, cyan, gray, green, red } from 'kleur/colors'
import prompts from 'prompts'
import { create } from './index.js'

const { version } = JSON.parse(
  fs.readFileSync(new URL('package.json', import.meta.url), 'utf-8')
)

async function main() {
  console.log(gray(`\ncreate-merlyn version ${version}`))
  console.log(`${bold(cyan('Merlyn'))}
${bold(red('This is *super* alpha - expect bugs and breaking changes'))}`)

  let cwd = process.argv[2] || '.'

  if (cwd === '.') {
    const opts = await prompts([
      {
        type: 'text',
        name: 'dir',
        message:
          'Where should we create the project?\n  (leave blank to use current directory)',
      },
    ])

    if (opts.dir) {
      cwd = opts.dir
    }
  }

  if (fs.existsSync(cwd)) {
    if (fs.readdirSync(cwd).length > 0) {
      const response = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'Directory not empty. Continue?',
        initial: false,
      })

      if (!response.value) {
        process.exit(1)
      }
    }
  }

  const options = await prompts(
    [
      {
        type: 'select',
        name: 'template',
        message: 'Typescript or JavaScript?',
        choices: [
          {
            title: 'Typescript (recommended)',
            value: 'typescript',
          },
          {
            title: 'JavaScript',
            value: 'javascript',
          },
        ],
      },
    ],
    {
      onCancel: () => {
        process.exit(1)
      },
    }
  )

  options.name = path.basename(path.resolve(cwd))

  await create(cwd, options)

  console.log(bold(green('\nYour project is ready!')))

  console.log('\nNext steps:')
  let i = 1

  const relative = path.relative(process.cwd(), cwd)
  if (relative !== '') {
    console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`)
  }

  console.log(`  ${i++}: ${bold(cyan('npm install'))}`)
  // prettier-ignore
  console.log(`  ${i++}: ${bold(cyan('git init && git add -A && git commit -m "Initial commit"'))} (optional)`);
  console.log(`  ${i++}: ${bold(cyan('npm run dev -- --open'))}`)

  console.log(`\nTo close the dev server, hit ${bold(cyan('Ctrl-C'))}`)
}

main()
