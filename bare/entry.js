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

// Bare merges import maps: a module imported `with { imports }` resolves
// through its importer's map overlaid with the new one, and passes the result
// on to everything it imports in turn. bare.js applies bare-node-runtime's map
// on the way in here, and this second hop overlays ./imports.json, so the
// whole package graph - the SDK and its prover included - sees
// bare-node-runtime's mappings with ours taking precedence.
//
// The targets in ./imports.json are package specifiers rather than relative
// paths on purpose: Bare resolves a mapped target from the module that
// imports it (deep inside @aztec/bb.js, say), not from the map file.

export * from '../index.js' with { imports: './imports.json' }

export { default } from '../index.js' with { imports: './imports.json' }
