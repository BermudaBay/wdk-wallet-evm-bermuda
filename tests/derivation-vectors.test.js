import { afterAll, describe, expect, test } from '@jest/globals'

import WalletManagerBermuda from '../index.js'

import { BERMUDA_KEYS, EVM_ADDRESSES, PLASMA_TESTNET, SEED_PHRASE } from './fixtures/derivation-vectors.js'

describe('derivation vectors', () => {
  const wallet = new WalletManagerBermuda(SEED_PHRASE, { provider: PLASMA_TESTNET })

  afterAll(() => {
    wallet.dispose()
  })

  test.each(EVM_ADDRESSES)('derives the EVM account %i', async (index, address) => {
    const account = await wallet.getAccount(index)

    await expect(account.getAddress()).resolves.toBe(address)
  })

  test.each(BERMUDA_KEYS)('derives the Bermuda account %i/%i', async (bip44AccountIndex, bermudaAccountIndex, keys) => {
    const account = await wallet.getBermudaAccount(bip44AccountIndex, bermudaAccountIndex)

    expect(account.getAddress().slice(0, keys.length)).toBe(keys)
  })
})
