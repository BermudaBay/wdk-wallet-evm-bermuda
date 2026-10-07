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

// `stream/promises` under Bare: everything bare-stream/promises offers, plus
// the `finished` it lacks. @aztec/bb.js imports `finished` to wait for its CRS
// download, and because that import is static, the package cannot even be
// loaded under Bare without it.

import { finished as finishedCallback } from 'bare-stream'

export * from 'bare-stream/promises'

/**
 * Waits for a stream to close, like Node.js' `stream/promises` `finished`.
 *
 * @param {object} stream - The stream to wait for.
 * @param {{ cleanup?: boolean }} [opts] - Passed on to bare-stream's `finished`.
 * @returns {Promise<void>} Resolves once the stream has closed, rejects with the error it failed with.
 */
export function finished (stream, opts = {}) {
  return new Promise((resolve, reject) => {
    finishedCallback(stream, opts, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
