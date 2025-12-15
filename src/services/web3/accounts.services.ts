/** @format */

import { validations } from "../../utils/validation";
import { API_CONFIG } from "../../utils/constants";
import { Tool } from "@goat-sdk/core";
import {
  BaseAccountsParameters,
  GetNFTBalanceParameters,
  GetERC20BalanceParameters,
} from "./parameters";

export class AccountServices {
  constructor() {}

  @Tool({
    name: "get_account_overview",
    description:
      "Get the Account Overview for a given address and network (kaia or kairos)",
  })
  async getAccountOverview(parameters: BaseAccountsParameters, config: any) {
    let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
    let { address, network } = parameters;
    network = network ? network.toLowerCase() : "testnet";

    validations.checkApiKey(ETHERSCAN_API_KEY);
    validations.checkAddress(address);
    validations.checkNetwork(network);

    const baseParams = {
      chainid: API_CONFIG.CHAIN_ID[network],
      tag: "latest",
      apikey: ETHERSCAN_API_KEY,
    };

    const balanceParams = new URLSearchParams({
      ...baseParams,
      module: "account",
      action: "balance",
      address,
    });

    const txCountParams = new URLSearchParams({
      ...baseParams,
      module: "proxy",
      action: "eth_getTransactionCount",
      address,
    });

    const [balanceRes, txCountRes] = await Promise.all([
      fetch(`${API_CONFIG.BASE_URL[network]}?${balanceParams}`, {
        method: "GET",
        headers: { Accept: "*/*" },
      }),
      fetch(`${API_CONFIG.BASE_URL[network]}?${txCountParams}`, {
        method: "GET",
        headers: { Accept: "*/*" },
      }),
    ]);
    const balanceData = await balanceRes.json();
    const txCountData = await txCountRes.json();

    if (balanceData.status === "0") {
      throw new Error(balanceData.message || "Failed to fetch balance");
    }

    if (txCountData.status === "0") {
      throw new Error(
        txCountData.message || "Failed to fetch transaction count"
      );
    }

    return {
      address,
      network,
      balance: balanceData.result,
      totalTransactionCount: parseInt(txCountData.result, 16),
    };
  }

  @Tool({
    name: "get_nft_balance_details",
    description:
      "Get the Non-Fungible token or nft or erc721 balances for a given address and network",
  })
  async getNFTBalance(parameters: GetNFTBalanceParameters, config: any) {
    let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
    let { address, network, page, offset } = parameters;
    network = network ? network.toLowerCase() : "testnet";

    validations.checkApiKey(ETHERSCAN_API_KEY);
    validations.checkAddress(address);
    validations.checkNetwork(network);

    const params = new URLSearchParams({
      chainid: API_CONFIG.CHAIN_ID[network],
      module: "account",
      action: "addresstokennftbalance",
      address: address,
      page,
      offset,
      apikey: ETHERSCAN_API_KEY,
    });

    const url = `${API_CONFIG.BASE_URL[network]}?${params}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || response.statusText);
    }

    const data = await response.json();

    const collections = data.results.map((item: any) => ({
      contractAddress: item.contract.contract_address,
      tokenName: item.TokenName,
      tokenSymbol: item.TokenSymbol,
      tokenCount: item.TokenQuantity,
    }));

    return {
      address,
      network,
      collections,
      totalCount: data.paging.total_count,
    };
  }

  @Tool({
    name: "get_erc20_balance",
    description:
      "Get the Fungible token or ft or erc20 balances for a given address and network",
  })
  async getERC20Balance(parameters: GetERC20BalanceParameters, config: any) {
    let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
    let { address, network, page, offset } = parameters;
    network = network ? network.toLowerCase() : "testnet";

    validations.checkApiKey(ETHERSCAN_API_KEY);
    validations.checkAddress(address);
    validations.checkNetwork(network);

    const params = new URLSearchParams({
      chainid: API_CONFIG.CHAIN_ID[network],
      module: "account",
      action: "addresstokenbalance",
      address,
      page,
      offset,
      apikey: ETHERSCAN_API_KEY,
    });

    const url = `${API_CONFIG.BASE_URL[network]}?${params}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || response.statusText);
    }

    const data = await response.json();

    if (data.status === "0") {
      throw new Error(data.result || data.message);
    }

    const tokens = data?.results?.map((item: any) => ({
      contractAddress: item.contract.contract_address,
      symbol: item.contract.symbol,
      name: item.contract.name,
      totalSupply: item.contract.total_supply,
      balance: item.balance,
    }));

    return {
      address,
      network,
      tokens,
      totalCount: data?.paging?.total_count,
    };
  }

  @Tool({
    name: "get_current_balance",
    description: "Get the current balance for a given address and network",
  })
  async getCurrentBalance(parameters: BaseAccountsParameters, config: any) {
    try {
      let ETHERSCAN_API_KEY = config.ETHERSCAN_API_KEY;
      let { address, network } = parameters;
      network = network ? network.toLowerCase() : "testnet";

      validations.checkApiKey(ETHERSCAN_API_KEY);
      validations.checkAddress(address);
      validations.checkNetwork(network);

      const params = new URLSearchParams({
        chainid: API_CONFIG.CHAIN_ID[network],
        module: "account",
        action: "balance",
        address: address,
        tag: "latest",
        apikey: ETHERSCAN_API_KEY,
      });

      const url = `${API_CONFIG.BASE_URL[network]}?${params}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.message || response.statusText);
      }

      const data = await response.json();

      return {
        address,
        balance: data.balance,
        network,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch current balance: ${error.message}`);
    }
  }
}
