// Bermuda accounts are derived from the private key of an EVM account, so any
// change to either derivation would leave users unable to re-derive the
// accounts holding their shielded funds. These vectors were captured from the
// implementation at 59c37c9 and must never change.
//
// Shared by tests/derivation-vectors.test.js and tests/bare/smoke.js, so that
// Node.js and Bare are held to the very same values.

export const SEED_PHRASE = 'cook voyage document eight skate token alien guide drink uncle term abuse'

// Only answers the chain id: deriving accounts needs nothing else from the
// network, and the real SDK used here must not reach out to plasma-testnet.
export const PLASMA_TESTNET = {
  request: async ({ method }) => {
    if (method === 'eth_chainId') {
      return '0x2612'
    }

    throw new Error(`Unexpected RPC call: ${method}`)
  }
}

export const EVM_ADDRESSES = [
  [0, '0x405005C7c4422390F4B334F64Cf20E0b767131d0'],
  [1, '0xcC81e04BadA16DEf9e1AFB027B859bec42BE49dB']
]

// The key material leading every Bermuda address: the spending public key (x
// and y), the recovery hash and the x25519 public key, 256 hex characters in
// all. The address-binding signature that follows it is randomized on every
// derivation, so it is not part of the vectors.
export const BERMUDA_KEYS = [
  [0, 0, '0x1fdebefece752d93219fdb8aa99609f0050a35f9aad6082997effae03c81401b0182207e440887269d05b6a6038ab756bec2209f888ca1413df97a2b2604e5f30000000000000000000000000000000000000000000000000000000000000000314ac6fe1ba2cd1a72add5f39c3baa8c6e6cc3bf492e385845926214910b2d3a'],
  [0, 1, '0x0b7f96f3049957e1a94888762bd68d3a6f47fad29e986d52f89014bb34e4bb9628b2032962300b56e69c5f8c40360a7bc70210f5d7ba31cda272037278091c94000000000000000000000000000000000000000000000000000000000000000008a14bb49f5d60fce41bdcc12c2a11d813f8311f39eec1d9fe0237460d4dec15'],
  [1, 0, '0x0b31266a5861774bc81b987544d4dcbdc9efd7b4659719efcd3d1bbdc2574c8a17716e313d602c7ad4ea071a3de3672bfa1a7b004937710ed27635c4be5b8bfa0000000000000000000000000000000000000000000000000000000000000000529ae1154fb4faa15209e520adbdda53d1bd2226df69f2acf12d281ed987fa5b']
]
