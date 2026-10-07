// `npm run test:bare`: evidence that the package loads and works under Bare.
//
// Runs tests/bare/smoke.js four times: under Node.js and under Bare, first in
// the checkout itself and then the way consumers get the package - packed with
// `npm pack` and installed into a scratch project, next to the oldest
// @tetherto/wdk-wallet and @tetherto/wdk-wallet-evm the peer ranges allow.

import { spawn } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { linkPackageIntoNodeModules } from './link.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

const BARE = path.join(ROOT, 'node_modules', '.bin', 'bare')

// The npm running this script rather than whichever npm comes first on the
// PATH, so the nested `npm pack` and `npm install` honour the same npm (12 in
// CI) and configuration.
const NPM = process.env.npm_execpath?.endsWith('npm-cli.js')
  ? [process.execPath, process.env.npm_execpath]
  : [process.platform === 'win32' ? 'npm.cmd' : 'npm']

// Must match COMPLETION_MARKER in tests/bare/smoke.js.
const COMPLETION_MARKER = 'smoke test: done'

// The lower bound of the @tetherto/wdk-wallet and @tetherto/wdk-wallet-evm
// peer ranges in package.json.
const MINIMUM_WDK_VERSION = '1.0.0-beta.17'

// The prover keeps its CRS here rather than in its default, ~/.bb-crs, a cache
// shared with every other bb.js user on the machine.
const CRS_PATH = process.env.CRS_PATH ?? path.join(ROOT, 'node_modules', '.cache', 'bb-crs')

const SMOKE_FILES = ['tests/bare/smoke.js', 'tests/fixtures/derivation-vectors.js']

const BARE_FILES = ['bare.js', 'bare/entry.js', 'bare/globals.js', 'bare/imports.json', 'bare/stream-promises.js', 'bare/worker-threads.js']

await smoke('Node.js, checkout', process.execPath, ROOT)

await linkPackageIntoNodeModules(ROOT)

await smoke('Bare, checkout', BARE, ROOT)

await smokePackedPackage()

console.log('\nThe package loads and works under Node.js and Bare, both from the checkout and packed.')

async function smokePackedPackage () {
  const scratch = await mkdtemp(path.join(tmpdir(), 'wdk-wallet-evm-bermuda-bare-'))

  try {
    console.log('\n# Packing the package')

    const packOutput = JSON.parse(await npm(['pack', '--json', '--ignore-scripts', '--pack-destination', scratch], ROOT))

    // npm 12 keys the result by package name; earlier versions return an array.
    const [tarball] = Array.isArray(packOutput) ? packOutput : Object.values(packOutput)

    const packed = new Set(tarball.files.map(({ path }) => path))

    for (const file of BARE_FILES) {
      if (!packed.has(file)) {
        throw new Error(`The packed package is missing ${file}.`)
      }
    }

    const project = path.join(scratch, 'project')

    await mkdir(project)

    await writeFile(path.join(project, 'package.json'), '{ "private": true, "type": "module" }\n')

    console.log('# Installing the packed package')

    // npm >= 12 refuses URL dependencies anywhere but in the root package.json,
    // and to this project @bermuda/sdk is a transitive one.
    await npm([
      'install', '--ignore-scripts', '--no-audit', '--no-fund', '--no-package-lock', '--allow-remote=all',
      path.join(scratch, tarball.filename),
      `@tetherto/wdk-wallet@${MINIMUM_WDK_VERSION}`,
      `@tetherto/wdk-wallet-evm@${MINIMUM_WDK_VERSION}`
    ], project)

    for (const file of SMOKE_FILES) {
      await mkdir(path.dirname(path.join(project, file)), { recursive: true })

      await copyFile(path.join(ROOT, file), path.join(project, file))
    }

    await smoke('Node.js, packed', process.execPath, project)

    await smoke('Bare, packed', BARE, project)
  } finally {
    await rm(scratch, { recursive: true, force: true })
  }
}

async function smoke (label, runtime, cwd) {
  console.log(`\n# ${label}`)

  const { code, stdout } = await run(runtime, ['tests/bare/smoke.js'], cwd, { CRS_PATH })

  if (code !== 0 || stdout.trim().split('\n').at(-1) !== COMPLETION_MARKER) {
    throw new Error(`${label}: the smoke test did not complete (exit code ${code}).`)
  }
}

async function npm (args, cwd) {
  const [command, ...prefix] = NPM

  const { code, stdout } = await run(command, [...prefix, ...args], cwd, {}, { echo: false })

  if (code !== 0) {
    throw new Error(`npm ${args.join(' ')} failed with exit code ${code}.`)
  }

  return stdout
}

function run (command, args, cwd, env = {}, { echo = true } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'inherit'] })

    let stdout = ''

    child.stdout.setEncoding('utf8')

    child.stdout.on('data', (chunk) => {
      stdout += chunk

      if (echo) {
        process.stdout.write(chunk)
      }
    })

    child.once('error', reject)

    child.once('close', (code, signal) => resolve({ code: code ?? signal, stdout }))
  })
}
