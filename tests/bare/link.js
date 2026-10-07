import { mkdir, readlink, symlink } from 'node:fs/promises'
import path from 'node:path'

// Bare resolves the targets in bare/imports.json from the modules importing
// them - @aztec/bb.js, deep inside node_modules - by walking up the
// node_modules directories. Installed as a dependency, the package is found
// there; in its own checkout it is not, so link the checkout into its own
// node_modules, the way npm links a workspace.
export async function linkPackageIntoNodeModules (root) {
  const link = path.join(root, 'node_modules', '@bermuda', 'wdk-wallet-evm-bermuda')

  let target

  try {
    target = await readlink(link)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    await mkdir(path.dirname(link), { recursive: true })

    await symlink(path.relative(path.dirname(link), root), link, 'dir')

    return
  }

  if (path.resolve(path.dirname(link), target) !== root) {
    throw new Error(`${link} links to ${target} rather than to the checkout.`)
  }
}
