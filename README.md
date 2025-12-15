# Mantle AI Plugin

A powerful plugin for the **Goat SDK** that enables AI agents to interact directly with the **Mantle Ecosystem**. This plugin provides a suite of tools for bridging assets, managing tokens, and fetching on-chain data on Mantle Network.

## Features

The plugin offers a comprehensive set of tools categorized into three main areas:

### 🌉 Bridging
Seamlessly move assets between L1 (Ethereum) and L2 (Mantle/Kairos).

*   **ERC20 Bridging**:
    *   `deposit_erc20`: Deposit ERC20 tokens from L1 to L2.
    *   `withdraw_erc20`: Withdraw ERC20 tokens from L2 to L1 (includes proving and finalizing).
*   **MNT Bridging**:
    *   `deposit_mnt`: Deposit MNT tokens.
    *   `withdraw_mnt`: Withdraw MNT tokens.
    *   `get_mnt_balances`: Check MNT balances on both layers.

### 💰 Token Management
Manage and transfer valid assets across the network.

*   **Transfers**:
    *   `transfer_native_token`: Send MNT or ETH.
    *   `transfer_erc20`: Transfer fungible tokens.
    *   `transfer_erc721`: Transfer NFTs.
    *   `transfer_erc1155`: Transfer multi-token assets.

### 📊 Web3 Data & Account Info
Retrieve real-time blockchain data and account insights.

*   **Account Queries**:
    *   `get_account_overview`: View balance and transaction counts.
    *   `get_current_balance`: Quick balance check.
    *   `get_erc20_balance`: List all ERC20 tokens held by an address.
    *   `get_nft_balance_details`: List all NFTs (ERC721) held by an address.
*   **Network Intelligence**:
    *   `get_latest_block`: Get the current block number.
    *   `get_block_info`: detailed information about a specific block.
    *   `get_transactions_by_account`: Fetch recent transaction history for a user.
    *   `get_transactions_by_block_number`: View transactions within a specific block.

## Installation

```bash
npm install @paulelisha/mantle-ai-plugin
```

## Usage

Import the plugin and configure it with your wallet and API keys.

```typescript
import { MantlePlugin } from "@paulelisha/mantle-ai-plugin";

const plugin = MantlePlugin({
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY // Required for Web3 Data tools
});
```

### Configuration
Certain tools require specific configuration:
*   **Web3 Data Tools**: Require a valid explorer API key (e.g., Mantlescan/Etherscan compatible).
*   **Bridging Tools**: Require valid L1 and L2 Signers to be configured in the wallet client.

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
