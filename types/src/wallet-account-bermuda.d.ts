/** @typedef {import('ethers').HDNodeWallet} HDNodeWallet */
/** @typedef {import('ethers').AuthorizationRequest} AuthorizationRequest */
/** @typedef {import('ethers').Authorization} Authorization */
/** @typedef {import('ethers').AuthorizationLike} AuthorizationLike */
/** @typedef {import('@tetherto/wdk-wallet').IWalletAccount} IWalletAccount */
/** @typedef {import('@tetherto/wdk-wallet').KeyPair} KeyPair */
/** @typedef {import('@tetherto/wdk-wallet').TransactionResult} TransactionResult */
/** @typedef {import('@tetherto/wdk-wallet').TransferResult} TransferResult */
/** @typedef {import('@tetherto/wdk-wallet-evm').WalletAccountEvm} WalletAccountEvm */
/** @typedef {import('@tetherto/wdk-wallet-evm').TypedData} TypedData */
/** @typedef {import('@tetherto/wdk-wallet-evm').EvmTransaction} EvmTransaction */
/** @typedef {import('@tetherto/wdk-wallet-evm').EvmTransferOptions} EvmTransferOptions */
/** @typedef {import('@tetherto/wdk-wallet-evm').EvmWalletConfig} EvmWalletConfig */
/**  @typedef {import('@bermuda/sdk').ISdk} BermudaSdk */
/** @typedef {import('@bermuda/sdk').KeyPair} BermudaKeyPair */
/** @typedef {import('@bermuda/sdk').IDepositOptions} BermudaDepositOptions */
/** @typedef {import('@bermuda/sdk').ITransferOptions} BermudaTransferOptions */
/** @typedef {import('@bermuda/sdk').IWithdrawOptions} BermudaWithdrawOptions */
/** @typedef {import('@bermuda/sdk').IPayload} Payload */
/**
 * @typedef {Object} BermudaDepositParams
 * @property {string} token - The address of the token to deposit.
 * @property {string} [to] - The Bermuda address of the recipient, defaults to self.
 * @property {number | bigint} amount - The amount of tokens to deposit.
 * @property {string} [note] - Optional transaction note.
 * @property {Array<{ to: string, amount: number | bigint, note?: string }>} [recipients] - Optional multiple recipients.
 */
/**
 * @typedef {Object} BermudaTransferParams
 * @property {string} token - The address of the token to transfer.
 * @property {string} to - The Bermuda address of the recipient.
 * @property {number | bigint} amount - The amount of tokens to transfer.
 * @property {string} [note] - Optional transaction note.
 * @property {Array<{ to: string, amount: number | bigint, note?: string }>} [recipients] - Optionally multiple recipients.
 */
/**
 * @typedef {Object} BermudaWithdrawParams
 * @property {string} token - The address of the token to withdraw.
 * @property {string} [to] - The Ethereum address of the recipient.
 * @property {number | bigint} amount - The amount of tokens to withdraw.
 */
export default class WalletAccountBermuda {
    /**
     * Creates a new Bermuda EVM wallet account.
     *
     *
     * @param {BermudaSdk} bermudaSdk - The Bermuda SDK.
     * @param {WalletAccountEvm} ethereumWallet - The master Ethereum wallet account.
     * @param {BermudaKeyPair} bermudaKeyPair - The Bermuda key pair.
     */
    constructor(bermudaSdk: BermudaSdk, ethereumWallet: WalletAccountEvm, bermudaKeyPair: BermudaKeyPair);
    /**
     * The Bermuda SDK instance.
     *
     * Only available on Plasma testnet for now.
     *
     * @protected
     * @type {BermudaSdk}
     */
    protected _bermuda: BermudaSdk;
    /**
     * The master Ethereum account.
     *
     * @protected
     * @type {WalletAccountEvm}
     */
    protected _ethereumWallet: WalletAccountEvm;
    /**
     * The Bermuda key pair.
     *
     * @protected
     * @type {BermudaKeyPair}
     */
    protected _bermudaKeyPair: BermudaKeyPair;
    /** @private */
    private _disposed;
    /**
     * Get the Bermuda address.
     *
     * @returns {string} The Bermuda address.
     */
    getAddress(): string;
    /**
     * The account's address.
     *
     * @type {string}
     */
    get address(): string;
    /**
     * Returns the account balance for a specific token.
     *
     * @param {string} tokenAddress - The smart contract address of the token.
     * @returns {Promise<bigint>} The token balance (in base unit).
     */
    getTokenBalance(tokenAddress: string): Promise<bigint>;
    /**
     * Returns the account balances for multiple tokens.
     *
     * @param {string[]} tokenAddresses - The smart contract addresses of the tokens.
     * @returns {Promise<Record<string, bigint>>} A mapping of token addresses to their balances (in base units).
     */
    getTokenBalances(tokenAddresses: string[]): Promise<Record<string, bigint>>;
    /**
     * Adapts the Ethereum account's signer to the ethers signer shape the
     * Bermuda SDK expects.
     *
     * `@tetherto/wdk-wallet-evm` keeps its key material behind an `ISignerEvm`,
     * whose `signTypedData` takes a single `{ domain, types, message }` object,
     * while the SDK calls the positional ethers signature. The provider is
     * attached so the SDK can resolve the chain id and read contracts through
     * the signer.
     *
     * @protected
     * @returns {Object} An ethers-compatible signer.
     */
    protected _getEthersSigner(): any;
    /**
     * Shield funds.
     *
     * The deposit recipient defaults to this Bermuda account.
     *
     * The deposit is sent by the master Ethereum account, so the wallet's `transactionMaxFee` caps its network fee, and
     * that of the approval sent first for the wrapped native token. A protocol deposit fee, if the pool charges one, is
     * paid in the deposited token and is not capped.
     *
     * @param {BermudaDepositParams} params - The deposit's parameters.
     * @param {BermudaDepositOptions} [options] - The deposit's options.
     * @returns {Promise<string>} The transaction hash.
     */
    deposit(params: BermudaDepositParams, options?: BermudaDepositOptions): Promise<string>;
    /**
     * Transfer shielded funds.
     *
     * The transfer is submitted by a relayer, so neither the wallet's `transferMaxFee` nor its `transactionMaxFee`
     * applies. A relay fee is only charged if `options.relayFee` is set (together with `options.relayer`), and is paid
     * out of the shielded balance, in the transferred token.
     *
     * @param {BermudaTransferParams} params - The transfer's parameters.
     * @param {BermudaTransferOptions} [options] - The transfer's options.
     * @returns {Promise<string>} The transaction hash.
     */
    transfer(params: BermudaTransferParams, options?: BermudaTransferOptions): Promise<string>;
    /**
     * Unshield funds.
     *
     * The withdrawal recipient defaults to the address of the master Ethereum
     * account.
     *
     * The withdrawal is submitted by a relayer, so neither the wallet's `transferMaxFee` nor its `transactionMaxFee`
     * applies. Its fees are paid out of the shielded balance, in the withdrawn token: the pool's protocol withdrawal fee,
     * plus a relay fee if `options.relayFee` is set (together with `options.relayer`).
     *
     * @param {BermudaWithdrawParams} params - The withdrawal's parameters.
     * @param {BermudaWithdrawOptions} [options] - The withdrawal's options.
     * @returns {Promise<string>} The transaction hash.
     */
    withdraw(params: BermudaWithdrawParams, options?: BermudaWithdrawOptions): Promise<string>;
    /**
     * True if the account has been disposed.
     *
     * @type {boolean}
     */
    get disposed(): boolean;
    /**
     * Disposes the wallet account, erasing the Bermuda private keys from the memory.
     *
     * The master Ethereum account is left untouched: it belongs to the wallet manager (or to whoever passed it to the
     * constructor), and other Bermuda accounts derived from it may still be using it.
     */
    dispose(): void;
}
export type HDNodeWallet = import("ethers").HDNodeWallet;
export type AuthorizationRequest = import("ethers").AuthorizationRequest;
export type Authorization = import("ethers").Authorization;
export type AuthorizationLike = import("ethers").AuthorizationLike;
export type IWalletAccount = import("@tetherto/wdk-wallet").IWalletAccount;
export type KeyPair = import("@tetherto/wdk-wallet").KeyPair;
export type TransactionResult = import("@tetherto/wdk-wallet").TransactionResult;
export type TransferResult = import("@tetherto/wdk-wallet").TransferResult;
export type WalletAccountEvm = import("@tetherto/wdk-wallet-evm").WalletAccountEvm;
export type TypedData = import("@tetherto/wdk-wallet-evm").TypedData;
export type EvmTransaction = import("@tetherto/wdk-wallet-evm").EvmTransaction;
export type EvmTransferOptions = import("@tetherto/wdk-wallet-evm").EvmTransferOptions;
export type EvmWalletConfig = import("@tetherto/wdk-wallet-evm").EvmWalletConfig;
export type BermudaSdk = import("@bermuda/sdk").ISdk;
export type BermudaKeyPair = import("@bermuda/sdk").KeyPair;
export type BermudaDepositOptions = import("@bermuda/sdk").IDepositOptions;
export type BermudaTransferOptions = import("@bermuda/sdk").ITransferOptions;
export type BermudaWithdrawOptions = import("@bermuda/sdk").IWithdrawOptions;
export type Payload = import("@bermuda/sdk").IPayload;
export type BermudaDepositParams = {
    /**
     * - The address of the token to deposit.
     */
    token: string;
    /**
     * - The Bermuda address of the recipient, defaults to self.
     */
    to?: string;
    /**
     * - The amount of tokens to deposit.
     */
    amount: number | bigint;
    /**
     * - Optional transaction note.
     */
    note?: string;
    /**
     * - Optional multiple recipients.
     */
    recipients?: Array<{
        to: string;
        amount: number | bigint;
        note?: string;
    }>;
};
export type BermudaTransferParams = {
    /**
     * - The address of the token to transfer.
     */
    token: string;
    /**
     * - The Bermuda address of the recipient.
     */
    to: string;
    /**
     * - The amount of tokens to transfer.
     */
    amount: number | bigint;
    /**
     * - Optional transaction note.
     */
    note?: string;
    /**
     * - Optionally multiple recipients.
     */
    recipients?: Array<{
        to: string;
        amount: number | bigint;
        note?: string;
    }>;
};
export type BermudaWithdrawParams = {
    /**
     * - The address of the token to withdraw.
     */
    token: string;
    /**
     * - The Ethereum address of the recipient.
     */
    to?: string;
    /**
     * - The amount of tokens to withdraw.
     */
    amount: number | bigint;
};
