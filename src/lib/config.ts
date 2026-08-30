// 0G Network Configuration: Mainnet & Galileo Testnet Definitions (Client & Server Safe)

export type ZGNetworkKey = "mainnet" | "testnet";

export interface ZGNetworkConfig {
  key: ZGNetworkKey;
  name: string;
  isMainnet: boolean;
  chainId: number;
  rpcUrl: string;
  indexerRpc: string;
  computeRouter: string;
  flowContract: string;
  explorerUrl: string;
}

export const ZG_NETWORKS: Record<ZGNetworkKey, ZGNetworkConfig> = {
  mainnet: {
    key: "mainnet",
    name: "0G Mainnet (Production)",
    isMainnet: true,
    chainId: Number(process.env.NEXT_PUBLIC_0G_MAINNET_CHAIN_ID || 16600),
    rpcUrl: process.env.NEXT_PUBLIC_0G_MAINNET_RPC_URL || "https://evmrpc.0g.ai",
    indexerRpc: process.env.NEXT_PUBLIC_0G_MAINNET_INDEXER_RPC || "https://indexer-storage-turbo.0g.ai",
    computeRouter: process.env.NEXT_PUBLIC_0G_MAINNET_COMPUTE_ROUTER || "https://router-api.0g.ai/v1",
    flowContract: process.env.NEXT_PUBLIC_0G_MAINNET_FLOW_CONTRACT || "0x04602b1C536639057715082E478144061413fa25",
    explorerUrl: process.env.NEXT_PUBLIC_0G_MAINNET_EXPLORER_URL || "https://chainscan.0g.ai",
  },
  testnet: {
    key: "testnet",
    name: "0G Galileo (Testnet Sandbox)",
    isMainnet: false,
    chainId: Number(process.env.NEXT_PUBLIC_0G_TESTNET_CHAIN_ID || 16602),
    rpcUrl: process.env.NEXT_PUBLIC_0G_TESTNET_RPC_URL || "https://evmrpc-testnet.0g.ai",
    indexerRpc: process.env.NEXT_PUBLIC_0G_TESTNET_INDEXER_RPC || "https://indexer-storage-testnet-turbo.0g.ai",
    computeRouter: process.env.NEXT_PUBLIC_0G_TESTNET_COMPUTE_ROUTER || "https://router-api.0g.ai/v1",
    flowContract: process.env.NEXT_PUBLIC_0G_TESTNET_FLOW_CONTRACT || "0x22C1f6050E56d2876005503c89E69c4176774a3f",
    explorerUrl: process.env.NEXT_PUBLIC_0G_TESTNET_EXPLORER_URL || "https://chainscan-galileo.0g.ai",
  },
};

// Default Active Network
const defaultNetworkKey: ZGNetworkKey =
  (process.env.NEXT_PUBLIC_0G_DEFAULT_NETWORK as ZGNetworkKey) || "mainnet";

export const ZG_CONFIG = ZG_NETWORKS[defaultNetworkKey] || ZG_NETWORKS.mainnet;

export function getNetworkConfig(key?: string): ZGNetworkConfig {
  if (key === "testnet" || key === "mainnet") {
    return ZG_NETWORKS[key];
  }
  return ZG_CONFIG;
}
