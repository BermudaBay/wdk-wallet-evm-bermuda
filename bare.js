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

// The package entry point under Bare. bare-node-runtime provides the Node.js
// globals and maps the Node.js builtins to their Bare counterparts; ./bare/
// fills the gaps that the Bermuda SDK's prover (@aztec/bb.js) still runs into
// on top of that. See bare/entry.js for how the two import maps combine.

import 'bare-node-runtime/global'

import './bare/globals.js'

export * from './bare/entry.js' with { imports: 'bare-node-runtime/imports' }

export { default } from './bare/entry.js' with { imports: 'bare-node-runtime/imports' }
