/** @format */
import { validations } from "../../utils/validation";
import { API_CONFIG } from "../../utils/constants";
import { Tool } from "@goat-sdk/core";
import {
  GetBlockInfoParameters,
  GetLatestBlockParameters,
  GetTransactionsByAccountParameters,
  GetTransactionsByBlockNumberParameters,
} from "./parameters";

export class TransactionServices {
  constructor() {}

  @Tool({
    name: "get_block_info",
    description: "Get block info by block number",
  })
  async getBlockInfo(parameters: GetBlockInfoParameters, config: any) {
    let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
    let { blockNumber, network } = parameters;
    network = network ? network.toLowerCase() : "kairos";

    validations.checkApiKey(ETHERSCAN_API_KEY);
    validations.checkNetwork(network);

    const blockNumberHex = `0x${blockNumber}`;

    const params = new URLSearchParams({
      chainid: API_CONFIG.CHAIN_ID[network],
      module: "proxy",
      action: "eth_getBlockByNumber",
      tag: blockNumberHex,
      boolean: "true",
      apikey: ETHERSCAN_API_KEY,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL[network]}?${params}`, {
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
      network: network,
    };
  }

  @Tool({
    name: "get_latest_block",
    description: "Get the latest block number",
  })
  async getLatestBlock(parameters: GetLatestBlockParameters, config: any) {
    let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
    let { network } = parameters;
    network = network ? network.toLowerCase() : "kairos";

    validations.checkApiKey(ETHERSCAN_API_KEY);
    validations.checkNetwork(network);

    const params = new URLSearchParams({
      chainid: API_CONFIG.CHAIN_ID[network],
      module: "proxy",
      action: "eth_blockNumber",
      apikey: ETHERSCAN_API_KEY,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL[network]}?${params}`, {
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
      blockId: parseInt(data.result, 16),
      network: network,
    };
  }

  @Tool({
    name: "get_transactions_by_account",
    description: "Get the transactions by account",
  })
  async getTransactionsByAccount(
    parameters: GetTransactionsByAccountParameters,
    config: any
  ) {
    let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
    let { address, network, startblock, endblock, page, offset } = parameters;
    network = network ? network.toLowerCase() : "kairos";

    validations.checkApiKey(ETHERSCAN_API_KEY);
    validations.checkAddress(address);
    validations.checkNetwork(network);

    const params = new URLSearchParams({
      chainid: API_CONFIG.CHAIN_ID[network],
      module: "account",
      action: "txlist",
      address,
      startblock,
      endblock,
      page,
      offset,
      sort: "desc",
      apikey: ETHERSCAN_API_KEY,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL[network]}?${params}`, {
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
      network,
      transactions,
      totalCount: Array.isArray(data.result) ? data.result.length : 0,
    };
  }

  @Tool({
    name: "get_transactions_by_block_number",
    description: "Get the transactions by block number",
  })
  async getTransactionsByBlockNumber(
    parameters: GetTransactionsByBlockNumberParameters,
    config: any
  ) {
    let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
    let { blockNumber, network } = parameters;
    network = network ? network.toLowerCase() : "kairos";

    validations.checkApiKey(ETHERSCAN_API_KEY);
    validations.checkNetwork(network);

    const blockNumberHex = "0x" + Number(blockNumber).toString(16);

    const params = new URLSearchParams({
      chainid: API_CONFIG.CHAIN_ID[network],
      module: "proxy",
      action: "eth_getBlockByNumber",
      tag: blockNumberHex,
      boolean: "true",
      apikey: ETHERSCAN_API_KEY,
    });

    const response = await fetch(`${API_CONFIG.BASE_URL[network]}?${params}`, {
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
      network,
      transactions,
      totalCount: data.paging?.total_count || 0,
    };
  }
}
