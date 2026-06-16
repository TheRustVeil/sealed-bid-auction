export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 11155111); // Sepolia

export const CONTRACT_ADDRESSES = {
  confidentialDisperse: import.meta.env.VITE_DISPERSE_ADDRESS || '0x5F48197D829D7FD967799C7F2a9C94fbC30fc634',
  confidentialAirdrop:  import.meta.env.VITE_AIRDROP_ADDRESS  || '',
  confidentialToken:    import.meta.env.VITE_TOKEN_ADDRESS    || '0x7CF438647deD14b3503ba133176b2EB7524af989',
};

export const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

/**
 * Zama Sepolia network config — matches the addresses used in:
 *   ZamaFHEVMConfig.getSepoliaConfig()  (in ConfidentialDisperse constructor)
 *   ZamaGatewayConfig.getSepoliaConfig()
 *
 * Verify against node_modules/fhevm/config/ZamaFHEVMConfig.sol if these need updating.
 */
export const ZAMA_CONFIG = {
  kmsContractAddress: '0x9D6891A6240D6130c54ae243d8005063D05fE14b',
  aclContractAddress: '0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5',
  gatewayUrl:         'https://relayer.testnet.zama.org/v2',
};
