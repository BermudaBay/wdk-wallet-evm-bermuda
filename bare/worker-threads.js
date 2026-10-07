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

// `worker_threads` under Bare: bare-worker plus the `threadId` it lacks.
// @aztec/bb.js imports `threadId` to name the IPC files of its native
// backends, and because that import is static, the package cannot even be
// loaded under Bare without it.

import Thread from 'bare-thread'

export * from 'bare-worker'

export { default } from 'bare-worker'

/**
 * The id of the current thread: 0 on the main thread, as in Node.js.
 *
 * @type {number}
 */
export const threadId = Thread.isMainThread ? 0 : Thread.id
