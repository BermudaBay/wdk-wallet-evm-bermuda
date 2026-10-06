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
    constructor(seed: string | Uint8Array, config?: BermudaWalletConfig);
    /**
     * A map between '<bip-44 account index>/<bermuda account index>' keys and the Bermuda accounts derived so far. The
     * {@link dispose} method disposes all of them, along with the evm accounts.
     *
     * @protected
     * @type {Record<string, WalletAccountBermuda>}
     */
    protected _bermudaAccounts: Record<string, WalletAccountBermuda>;
    /**
     * The derivations of Bermuda accounts still in flight, by the same keys, so concurrent requests share one.
     *
     * @private
     * @type {Record<string, Promise<WalletAccountBermuda>>}
     */
    private _pendingBermudaAccounts;
    /**
     * True if the default signer was created here from the seed, and so is the wallet's to dispose.
     *
     * @private
     * @type {boolean}
     */
    private _ownsDefaultSigner;
    /** @private */
    private _bermudaDisposed;
    /**
     * Returns the Bermuda account, derived with the indicated EVM wallet's private key as seed.
     *
     * The indices allow for a vast array of Bermuda sub accounts all controlled by given EVM seed wallet. Repeated calls
     * with the same indices return the same account, until it is disposed.
     *
     * @param {number} [bip44AccountIndex] - The index of the Ethereum account to use as master of the returned Bermuda account (default: 0).
     * @param {number} [bermudaAccountIndex] - The index of the Bermuda account to derive (default: 0).
     * @returns {Promise<WalletAccountBermuda>} The Bermuda account.
     * @throws {ValueError} If an index is not a non-negative integer, or if the provider's chain is not supported.
     * @throws {WdkError} If the wallet has been disposed.
     * @throws {ProviderRequiredError} If the wallet is not connected to a provider.
     */
    getBermudaAccount(bip44AccountIndex?: number, bermudaAccountIndex?: number): Promise<WalletAccountBermuda>;
    /**
     * True if the wallet has been disposed.
     *
     * @type {boolean}
     */
    get disposed(): boolean;
    /**
     * Derives a Bermuda account and caches it under the given key.
     *
     * @private
     * @param {string} key - The account's key in the cache.
     * @param {number} bip44AccountIndex - The index of the Ethereum account to use as master of the Bermuda account.
     * @param {number} bermudaAccountIndex - The index of the Bermuda account to derive.
     * @returns {Promise<WalletAccountBermuda>} The Bermuda account.
     */
    private _deriveBermudaAccount;
}
export type FeeRates = import("@tetherto/wdk-wallet").FeeRates;
export type EvmWalletConfig = import("@tetherto/wdk-wallet-evm").EvmWalletConfig;
export type BermudaSdk = import("@bermuda/sdk").ISdk;
export type BermudaConfig = {
    /**
     * - Filepath for persisting UTXO cache across sessions.
     */
    utxoCache?: string;
    /**
     * - Filepath for persisting the commitment events cache across sessions (default: derived from the utxo cache's filepath).
     */
    commitmentEventsCache?: string;
    /**
     * - node:fs or equivalent.
     */
    fs?: any;
};
/**
 * The configuration of a Bermuda wallet: the configuration of an evm wallet, plus the Bermuda specific options.
 */
export type BermudaWalletConfig = EvmWalletConfig & BermudaConfig;
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import WalletAccountBermuda from './wallet-account-bermuda.js';
