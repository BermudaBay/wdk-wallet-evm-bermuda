/**
 * Returns the name the Bermuda SDK knows a chain by.
 *
 * @param {number | bigint} chainId - The chain id.
 * @returns {string} The chain's name.
 * @throws {ValueError} If the chain id is not supported.
 */
export function chainIdToName(chainId: number | bigint): string;
