// Copyright 2024 Tether Operations Limited
// Copyright 2026 Hyperpool AG
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import { ProviderRequiredError, ValueError } from '@tetherto/wdk-wallet'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

import { hexlify } from 'ethers'

import WalletAccountBermuda from './wallet-account-bermuda.js'
import { chainIdToName } from './utils.js'
import initBermudaSdk from '@bermuda/sdk'

/** @typedef {import('@tetherto/wdk-wallet').FeeRates} FeeRates */

/** @typedef {import('@tetherto/wdk-wallet-evm').EvmWalletConfig} EvmWalletConfig */

/**  @typedef {import('@bermuda/sdk').ISdk} BermudaSdk */

/**
 * @typedef {Object} BermudaConfig
 * @property {string} [utxoCache] - Filepath for persisting UTXO cache across sessions.
 * @property {string} [commitmentEventsCache] - Filepath for persisting the commitment events cache across sessions (default: derived from the utxo cache's filepath).
 * @property {Object} [fs] - node:fs or equivalent.
 */

/**
 * The configuration of a Bermuda wallet: the configuration of an evm wallet, plus the Bermuda specific options.
 *
 * @typedef {EvmWalletConfig & BermudaConfig} BermudaWalletConfig
 */

export default class WalletManagerBermuda extends WalletManagerEvm {
  /**
   * Creates a new Bermuda wallet manager for EVM blockchains.
   *
   * @param {string | Uint8Array} seed The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase
   * @param {BermudaWalletConfig} [config] - The configuration object.
   * @throws {ValueError} If the seed phrase is invalid.
   */
  constructor (seed, config = {}) {
    // The evm wallet manager rejects an invalid seed phrase with a plain error, so
    // it is checked here first to keep failing with the WDK one.
    if (typeof seed === 'string' && !WalletManagerBermuda.isValidSeedPhrase(seed)) {
      throw new ValueError('Invalid seed phrase.')
    }

    super(seed, config)

    /**
     * The Bermuda wallet configuration.
     *
     * @protected
     * @type {BermudaWalletConfig}
     */
    this._config = config
  }

  /**
   * Returns the Bermuda account, derived with the indicated EVM wallet's private key as seed.
   *
   * The indices allow for a vast array of Bermuda sub accounts all controlled by given EVM seed wallet.
   *
   * @param {number} [bip44AccountIndex] - The index of the Ethereum account to use as master of the returned Bermuda account (default: 0).
   * @param {number} [bermudaAccountIndex] - The index of the Bermuda account to derive (default: 0).
   * @returns {Promise<WalletAccountBermuda>} The Bermuda account.
   * @throws {ValueError} If an index is not a non-negative integer, or if the provider's chain is not supported.
   * @throws {ProviderRequiredError} If the wallet is not connected to a provider.
   */
  async getBermudaAccount (bip44AccountIndex = 0, bermudaAccountIndex = 0) {
    for (const index of [bip44AccountIndex, bermudaAccountIndex]) {
      if (!Number.isInteger(index)) {
        throw new ValueError('Account index must be an integer.')
      }

      if (index < 0) {
        throw new ValueError('Account index must not be negative.')
      }
    }

    if (!this._provider) {
      throw new ProviderRequiredError('The wallet must be connected to a provider to get Bermuda accounts.')
    }

    const chainId = await this._provider.getNetwork().then(network => network.chainId)
    const sdkOverrides = {}
    if (this._config.utxoCache) {
      sdkOverrides.utxoCache = this._config.utxoCache
      sdkOverrides.commitmentEventsCache = this._config.commitmentEventsCache || this._config.utxoCache.replace(/\.json$/, '-commitment-events.json')
      sdkOverrides.fs = this._config.fs
    }
    const bermuda = initBermudaSdk(chainIdToName(chainId), sdkOverrides)
    const ethereumWallet = await this.getAccountByPath(`0'/0/${bip44AccountIndex}`)
    const bermudaAccount = await bermuda.account({ seed: hexlify(ethereumWallet.keyPair.privateKey), id: bermudaAccountIndex })
    return new WalletAccountBermuda(bermuda, ethereumWallet, bermudaAccount)
  }

  /**
   * Returns the current fee rates.
   *
   * @returns {Promise<FeeRates>} The fee rates (in weis).
   * @throws {ProviderRequiredError} If the wallet is not connected to a provider.
   */
  async getFeeRates () {
    if (!this._provider) {
      throw new ProviderRequiredError('The wallet must be connected to a provider to get fee rates.')
    }

    return await super.getFeeRates()
  }
}
