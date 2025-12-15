/** @format */
import { validations } from "../../utils/validation";
import { API_CONFIG } from "../../utils/constants";
import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import {
  GetBlockInfoParameters,
  GetLatestBlockParameters,
  GetTransactionsByAccountParameters,
  GetTransactionsByBlockNumberParameters,
} from "./parameters";

export class TransactionServices {
  constructor(private apiKey: string) {}

  @Tool({
    name: "get_block_info",
    description: "Get block info by block number",
  })
  async getBlockInfo(
    walletClient: EVMWalletClient,
    parameters: GetBlockInfoParameters
  ) {
    let { blockNumber } = parameters;
    const chainid = walletClient.getChain().id as unknown as string;

    validations.checkApiKey(this.apiKey);

    const blockNumberHex = `0x${blockNumber}`;

    const params = new URLSearchParams({
      chainid,
      module: "proxy",
      action: "eth_getBlockByNumber",
      tag: blockNumberHex,
      boolean: "true",
      apikey: this.apiKey,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}?${params}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    return {
      blockId: data.block_id,
      datetime: data.datetime,
      hash: data.hash,
      totalTransactionCount: data.total_transaction_count,
    };
  }

  @Tool({
    name: "get_latest_block",
    description: "Get the latest block number",
  })
  async getLatestBlock(
    walletClient: EVMWalletClient,
    parameters: GetLatestBlockParameters
  ) {
    const chainid = walletClient.getChain().id as unknown as string;

    validations.checkApiKey(this.apiKey);

    const params = new URLSearchParams({
      chainid,
      module: "proxy",
      action: "eth_blockNumber",
      apikey: this.apiKey,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}?${params}`, {
      method: "GET",
      headers: { Accept: "*/*" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || response.statusText);
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error("Failed to fetch latest block number");
    }

    return {
      chainid,
      blockId: parseInt(data.result, 16),
    };
  }

  @Tool({
    name: "get_transactions_by_account",
    description: "Get the transactions by account",
  })
  async getTransactionsByAccount(
    walletClient: EVMWalletClient,
    parameters: GetTransactionsByAccountParameters
  ) {
    let { startblock, endblock, page, offset } = parameters;
    const chainid = walletClient.getChain().id as unknown as string;
    const address = walletClient.getAddress();

    validations.checkAddress(address);

    const params = new URLSearchParams({
      chainid,
      module: "account",
      action: "txlist",
      address,
      startblock,
      endblock,
      page,
      offset,
      sort: "desc",
      apikey: this.apiKey,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}?${params}`, {
      method: "GET",
      headers: { Accept: "*/*" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || response.statusText);
    }

    const data = await response.json();

    if (data.status === "0" && data.message !== "No transactions found") {
      throw new Error(data.message || "Failed to fetch transactions");
    }

    const transactions =
      data.result && data.result.length > 0
        ? data.result.slice(0, 6).map((tx: any) => ({
            from: tx.from,
            to: tx.to,
            value: tx.value,
            type: tx.functionName || "transfer",
            hash: tx.hash,
          }))
        : [];

    return {
      address,
      chainid,
      transactions,
      totalCount: Array.isArray(data.result) ? data.result.length : 0,
    };
  }

  @Tool({
    name: "get_transactions_by_block_number",
    description: "Get the transactions by block number",
  })
  async getTransactionsByBlockNumber(
    walletClient: EVMWalletClient,
    parameters: GetTransactionsByBlockNumberParameters
  ) {
    let { blockNumber } = parameters;
    const chainid = walletClient.getChain().id as unknown as string;

    validations.checkApiKey(this.apiKey);

    const blockNumberHex = "0x" + Number(blockNumber).toString(16);

    const params = new URLSearchParams({
      chainid,
      module: "proxy",
      action: "eth_getBlockByNumber",
      tag: blockNumberHex,
      boolean: "true",
      apikey: this.apiKey,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}?${params}`, {
      method: "GET",
      headers: { Accept: "*/*" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || response.statusText);
    }

    const data = await response.json();

    if (!data.result) {
      throw new Error("Block not found");
    }

    const transactions =
      data.result.transactions && data.result.transactions.length > 0
        ? data.result.transactions.slice(0, 6).map((tx: any) => ({
            from: tx.from,
            to: tx.to,
            value: tx.value,
            type: tx.type,
            hash: tx.hash,
          }))
        : [];

    return {
      blockNumber,
      chainid,
      transactions,
      totalCount: data.paging?.total_count || 0,
    };
  }
}
