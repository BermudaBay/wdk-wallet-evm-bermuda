# @bermuda/wdk-wallet-evm-bermuda

<a href="https://docs.wdk.tether.io">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://raw.githubusercontent.com/tetherto/wdk-docs/refs/heads/main/public/assets/branding/wdk-badge-color-dark.svg"
    >
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://raw.githubusercontent.com/tetherto/wdk-docs/refs/heads/main/public/assets/branding/wdk-badge-color-light.svg"
    >
    <img
      alt="Built with WDK"
      src="https://raw.githubusercontent.com/tetherto/wdk-docs/refs/heads/main/public/assets/branding/wdk-badge-color-light.svg"
    >
  </picture>
</a>

**Note**: This package is currently in beta. Only supported network is Plasma testnet,

A simple and secure package to manage Bermuda accounts for EVM-compatible blockchains.

This package extends [`@tetherto/wdk-wallet-evm`](https://github.com/tetherto/wdk-wallet-evm) with Bermuda shielded accounts. `WalletManagerBermuda` is a `WalletManagerEvm`, so it creates and manages BIP-44 accounts exactly like `@tetherto/wdk-wallet-evm` does, and adds `getBermudaAccount()` on top: Bermuda accounts derived from those BIP-44 accounts, which deposit to, transfer within, and withdraw from a Bermuda shielded pool.

## 🔍 About WDK

This module is part of the [**WDK (Wallet Development Kit)**](https://wallet.tether.io/) project, which empowers developers to build secure, non-custodial wallets with unified blockchain access, stateless architecture, and complete user control.

For detailed documentation about the complete WDK ecosystem, visit [docs.wallet.tether.io](https://docs.wallet.tether.io).

## 🌟 Features

- **Built on `@tetherto/wdk-wallet-evm`**: `WalletManagerBermuda` extends `WalletManagerEvm`, so `getAccount()`, `getAccountByPath()`, `getFeeRates()` and the provider options work exactly as they do there
- **BIP-39 and BIP-44 account derivation**: Derive standard EVM accounts from a mnemonic seed
- **Deterministic Bermuda accounts**: Derive shielded accounts from an EVM account with `getBermudaAccount()`
- **Shielded deposits**: Deposit funds into the Bermuda shielded pool
- **Shielded transfers**: Transfer shielded balances between Bermuda accounts
- **Shielded withdrawals**: Withdraw shielded balances to a public EVM address
- **Shielded balance lookup**: Scan owned UTXOs and query balances for one or multiple tokens

## ⬇️ Installation

To install the `@bermuda/wdk-wallet-evm-bermuda` package, follow these instructions:

You can install it using npm:

```bash
npm i bermudabay/wdk-wallet-bermuda
```

The package is not on the npm registry yet, so it is installed from its GitHub repository (`bermudabay/wdk-wallet-bermuda`) and imported as `@bermuda/wdk-wallet-evm-bermuda`.

## 🚀 Quick Start

### Importing from `@bermuda/wdk-wallet-evm-bermuda`

### Creating a New Wallet

```javascript
import WalletManagerBermuda, { WalletAccountBermuda } from '@bermuda/wdk-wallet-evm-bermuda'

// Use a BIP-39 seed phrase (replace with your own secure phrase)
const seedPhrase = 'test only example nut use this real life secret phrase must random'

// Create wallet manager with provider config
const wallet = new WalletManagerBermuda(seedPhrase, {
  // Option 1: Using RPC URL
  provider: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key', // or any EVM RPC endpoint
  transactionMaxFee: 100000000000000, // Optional: maximum network fee (in wei) of EVM transactions, Bermuda deposits included
  transferMaxFee: 100000000000000 // Optional: maximum network fee (in wei) of EVM token transfers
})

// OR

// Option 2: Using EIP-1193 provider (e.g., from browser wallet)
const wallet2 = new WalletManagerBermuda(seedPhrase, {
  provider: window.ethereum, // EIP-1193 provider
  transactionMaxFee: 100000000000000 // Optional: maximum network fee (in wei) of EVM transactions, Bermuda deposits included
})

// Get a full access Ethereum account
const ethereumWallet = await wallet.getAccount()

// Get the associated Bermuda account
const bermudaAccount = await wallet.getBermudaAccount()
```

### Managing Multiple Accounts

```javascript
import WalletManagerBermuda from '@bermuda/wdk-wallet-evm-bermuda'

// Assume wallet is already created
// The first parameter is the BIP-44 account index while the second is the Bermuda account index.
const account = await wallet.getBermudaAccount(0, 0)
const address = account.getAddress()
console.log('Account 0 address:', address)

const account1 = await wallet.getBermudaAccount(0, 1)
const address1 = account1.getAddress()
console.log('Account 1 address:', address1)

```

### Checking Balances

For accounts where you have the seed phrase and full access:

```javascript
// Get shielded ERC20 token balance
const token = '0x...'; // ERC20 contract address
const balance = await account.getTokenBalance(token);
console.log('Token balance:', balance);
```

### Deposit into Bermuda

```javascript
const txHash = await account.deposit({ token: '0x...', amount: 1n })

console.log('Transaction hash:', txHash)
```

### Transfer within Bermuda

```javascript
const txHash = await account.transfer({ token: '0x...', amount: 1n, to: '0x...' })

console.log('Transaction hash:', txHash)
```

### Withdraw from Bermuda

```javascript
const txHash = await account.withdraw({ token: '0x...', amount: 1n, to: '0x...' })

console.log('Transaction hash:', txHash)
```

## 💸 Fees

`transactionMaxFee` and `transferMaxFee` (both in wei) are enforced by the underlying `@tetherto/wdk-wallet-evm` accounts, so they only cap the network fees the wallet pays itself:

| Operation | Fees | Capped by |
|-----------|------|-----------|
| EVM `sendTransaction()` | Network fee | `transactionMaxFee` |
| EVM `transfer()` | Network fee | `transferMaxFee` |
| Bermuda `deposit()` | Network fee of the deposit, and of the approval sent first for the wrapped native token | `transactionMaxFee` |
| | Protocol deposit fee, if the pool charges one, in the deposited token | Not capped |
| Bermuda `transfer()` | Relay fee, only if `options.relayFee` is set, in the transferred token | Not capped |
| Bermuda `withdraw()` | Protocol withdrawal fee and, if `options.relayFee` is set, relay fee, in the withdrawn token | Not capped |

Shielded transfers and withdrawals are submitted by a relayer, so **neither cap applies to them**: their fees are paid out of the shielded balance, in the token being moved. No relay fee is charged unless you set `relayFee` (together with `relayer`) in their options, so the relay fee is always the one you chose.

## 🌐 Supported Networks

- **Plasma testnet**

## 🔒 Security Considerations

- **Seed Phrase Security**: Always store your seed phrase securely and never share it
- **Private Key Management**: The package handles private keys internally with memory safety features
- **Provider Security**: Use trusted RPC endpoints and consider running your own node for production
- **Transaction Validation**: Always validate transaction details before signing
- **Memory Cleanup**: Use the `dispose()` method to clear private keys from memory when done
- **Fee Limits**: Set `transactionMaxFee` and `transferMaxFee` to cap the network fees of EVM transactions (Bermuda deposits included) and EVM token transfers. They do not cap the fees of shielded transfers and withdrawals; see [Fees](#-fees)
- **Gas Estimation**: Always estimate gas before sending transactions
- **EIP-1559**: Consider using EIP-1559 fee model for better gas price estimation
- **Contract Interactions**: Verify contract addresses and token decimals before transfers

## 🛠️ Development

### Prerequisites

Development and testing require **Node.js >= 22** — a floor set by Hardhat, whose
`@nomicfoundation/edr` native bindings declare `engines: { node: ">= 22" }`. The recommended
version is pinned in [`.nvmrc`](.nvmrc) and the floor is enforced via `devEngines` in
`package.json`:

```bash
nvm use
```

> This floor applies to the **test toolchain only** — the published library itself supports
> older Node.js versions.

### Building

```bash
# Install dependencies (use `ci` to honour the lockfile exactly)
npm ci

# Build TypeScript definitions
npm run build:types

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing

```bash
# Run every suite
npm test

# Run every suite with coverage
npm run test:coverage

# Run only the integration suites
npm run test:integration

# Run only the integration suites with coverage
npm run test:integration:coverage
```

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

For support, please open an issue on the GitHub repository.

---
