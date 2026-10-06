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

import { ValueError } from '@tetherto/wdk-wallet'

/**
 * Returns the name the Bermuda SDK knows a chain by.
 *
 * @param {number | bigint} chainId - The chain id.
 * @returns {string} The chain's name.
 * @throws {ValueError} If the chain id is not supported.
 */
export function chainIdToName (chainId) {
  switch (Number(chainId)) {
    case 31337:
      return 'testenv'
    case 100:
      return 'gnosis'
    case 8453:
      return 'base'
    case 84532:
      return 'base-sepolia'
    case 9745:
      return 'plasma-mainnet'
    case 9746:
      return 'plasma-testnet'
    case 59144:
      return 'linea'
    case 59141:
      return 'linea-sepolia'
    default:
      throw new ValueError(`Unknown chain id: ${chainId}`)
  }
}
