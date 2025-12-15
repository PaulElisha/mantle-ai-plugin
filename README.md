<!-- @format -->

# Mantle AI Plugin

A powerful plugin for the **Goat SDK** that enables AI agents to interact directly with the **Mantle Ecosystem**. This plugin provides a suite of tools for bridging assets, managing tokens, and fetching on-chain data on Mantle Network.

## Features

The plugin offers a comprehensive set of tools categorized into three main areas:

### 🌉 Bridging

Seamlessly move assets between L1 (Ethereum) and L2 (Mantle/Kairos).

- **ERC20 Bridging**:
  - `deposit_erc20`: Deposit ERC20 tokens from L1 to L2.
  - `withdraw_erc20`: Withdraw ERC20 tokens from L2 to L1 (includes proving and finalizing).
- **MNT Bridging**:
  - `deposit_mnt`: Deposit MNT tokens.
  - `withdraw_mnt`: Withdraw MNT tokens.
  - `get_mnt_balances`: Check MNT balances on both layers.

### 💰 Token Management

Manage and transfer valid assets across the network.

- **Transfers**:
  - `transfer_native_token`: Send MNT or ETH.
  - `transfer_erc20`: Transfer fungible tokens.
  - `transfer_erc721`: Transfer NFTs.
  - `transfer_erc1155`: Transfer multi-token assets.

### 📊 Web3 Data & Account Info

Retrieve real-time blockchain data and account insights.

- **Account Queries**:
  - `get_account_overview`: View balance and transaction counts.
  - `get_current_balance`: Quick balance check.
  - `get_erc20_balance`: List all ERC20 tokens held by an address.
  - `get_nft_balance_details`: List all NFTs (ERC721) held by an address.
- **Network Intelligence**:
  - `get_latest_block`: Get the current block number.
  - `get_block_info`: detailed information about a specific block.
  - `get_transactions_by_account`: Fetch recent transaction history for a user.
  - `get_transactions_by_block_number`: View transactions within a specific block.

## Installation

```bash
npm install @paulelisha/mantle-ai-plugin
```

### Usage

Import the plugin and the desired services. Note that some services, like bridging, require configuration and initialization.

```typescript
import { MantlePlugin } from "@paulelisha/mantle-ai-plugin";
import {
  AccountServices,
  TransactionServices,
  TransferServices,
  MNTBridgeService,
  ERC20BridgeService,
} from "@paulelisha/mantle-ai-plugin";
import { ethers } from "ethers";

// Example setup
async function main() {
  // 1. Initialize simple services
  // Web3 Data tools require an explorer API key (e.g. Etherscan/Mantlescan)
  const explorerApiKey = process.env.ETHERSCAN_API_KEY as string;

  const accountService = new AccountServices(explorerApiKey);
  const transactionService = new TransactionServices(explorerApiKey);
  const transferService = new TransferServices();

  // 2. Initialize complex services (e.g. Bridges) if needed
  // Note: Bridging requires valid Signers and Chain IDs
  /*
    const bridgeService = new MNTBridgeService({
        l1Signer: l1Wallet,
        l2Signer: l2Wallet,
        l1ChainId: 1, // Mainnet or Sepolia ID
        l2ChainId: 5000, // Mantle Mainnet ID
        l1MntTokenAddress: "0x...",
        l2MntTokenAddress: "0x..."
    });
    // Service automatically initializes on first use
    */

  // 3. Create the plugin with the services you want to enable
  const plugin = MantlePlugin([
    accountService,
    transactionService,
    transferService,
    // bridgeService
  ]);

  // Now you can use the plugin with the Goat SDK
}
```

### Supported Services

| Service               | Description                               | Config Required?                          |
| :-------------------- | :---------------------------------------- | :---------------------------------------- |
| `AccountServices`     | Get account balance, NFT/ERC20 holdings   | **Yes** (Explorer API Key)                |
| `TransactionServices` | Get transaction history and block info    | **Yes** (Explorer API Key)                |
| `TransferServices`    | Transfer ETH, MNT, ERC20, ERC721, ERC1155 | No                                        |
| `MNTBridgeService`    | Deposit/Withdraw MNT between L1 and L2    | **Yes** (Signers, Chain IDs, Token Addrs) |
| `ERC20BridgeService`  | Deposit/Withdraw ERC20 between L1 and L2  | **Yes** (Signers, Chain IDs, Token Addrs) |

> **Note**: Web3 Data tools (Account/Transaction services) rely on Explorer APIs. Ensure you provide a valid API key when initializing the service.

## Building & Testing

To build the plugin locally:

```bash
npm run build
```

To run tests:

```bash
npm run test
```

## License

This project is licensed under the MIT License.
