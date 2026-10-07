// Shielded operations under Bare: a deposit, a transfer and a withdrawal, with
// real proofs, against the plasma-testnet fork that
// tests/integration/bare.test.js runs - in Node.js, the only runtime Hardhat
// supports. That test funds the account, spawns
//
//   bare tests/bare/e2e.js '<options as JSON>'
//
// and checks every result printed here against the chain.

import WalletManagerBermuda, { WalletAccountBermuda } from '@bermuda/wdk-wallet-evm-bermuda'

// Must match COMPLETION_MARKER in tests/integration/bare.test.js.
const COMPLETION_MARKER = 'e2e: done'

// Resolved at runtime, once the package has loaded: imported directly, the SDK
// would be cached without the package's shims (see checkProver in smoke.js).
const { default: initBermudaSdk } = await import(['@bermuda', 'sdk'].join('/'))

const { rpcUrl, relayerUrl, chainStateUrl, seedPhrase, recipient } = JSON.parse(Bare.argv.at(-1))

const bermuda = initBermudaSdk('plasma-testnet', {
  provider: rpcUrl,
  relayer: relayerUrl,
  chainState: chainStateUrl,
  policyEnforcement: false
})

const provider = bermuda.config.provider

const wxpl = bermuda.config.WXPL

const wallet = new WalletManagerBermuda(seedPhrase, { provider: rpcUrl })

const ethereumAccount = await wallet.getAccountByPath("0'/0/0")

const seed = toHex(ethereumAccount.keyPair.privateKey)

const account = new WalletAccountBermuda(bermuda, ethereumAccount, await bermuda.account({ seed, id: 0 }))

const subAccount = new WalletAccountBermuda(bermuda, ethereumAccount, await bermuda.account({ seed, id: 1 }))

try {
  const deposit = await settle(() => account.deposit({ token: wxpl, amount: 5_000n }))

  report('deposit', { ...deposit, shielded: await account.getTokenBalance(wxpl) })

  const transfer = await settle(() => account.transfer({ token: wxpl, to: subAccount.address, amount: 1_000n }))

  report('transfer', {
    ...transfer,
    sender: await account.getTokenBalance(wxpl),
    recipient: await subAccount.getTokenBalance(wxpl)
  })

  const withdrawal = await settle(() => account.withdraw({ token: wxpl, to: recipient, amount: 250n }))

  report('withdraw', { ...withdrawal, shielded: await account.getTokenBalance(wxpl) })
} finally {
  account.dispose()

  subAccount.dispose()

  wallet.dispose()

  provider.destroy()
}

console.log(COMPLETION_MARKER)

// Runs an operation and waits for its transaction to be mined.
async function settle (operation) {
  const start = Date.now()

  const hash = await operation()

  await provider.waitForTransaction(hash)

  return { hash, milliseconds: Date.now() - start }
}

function report (operation, result) {
  console.log(`result ${JSON.stringify({ operation, ...result }, (_, value) => typeof value === 'bigint' ? value.toString() : value)}`)
}

function toHex (bytes) {
  return '0x' + Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
