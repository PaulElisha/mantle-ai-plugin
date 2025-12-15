/** @format */

import { validations } from "../../utils/validation";
import { API_CONFIG } from "../../utils/constants";
import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
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
  async getAccountOverview(
    walletClient: EVMWalletClient,
    parameters: BaseAccountsParameters
  ) {
    let { apikey } = parameters;
    const chainid = walletClient.getChain().id as unknown as string;
    const address = walletClient.getAddress();

    validations.checkApiKey(apikey);

    const baseParams = {
      chainid,
      tag: "latest",
      apikey,
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
      fetch(`${API_CONFIG.BASE_URL}?${balanceParams}`, {
        method: "GET",
        headers: { Accept: "*/*" },
      }),
      fetch(`${API_CONFIG.BASE_URL}?${txCountParams}`, {
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
      balance: balanceData.result,
      totalTransactionCount: parseInt(txCountData.result, 16),
    };
  }

  @Tool({
    name: "get_nft_balance_details",
    description:
      "Get the Non-Fungible token or nft or erc721 balances for a given address and network",
  })
  async getNFTBalance(
    walletClient: EVMWalletClient,
    parameters: GetNFTBalanceParameters
  ) {
    let { apikey, offset, page } = parameters;
    const chainid = walletClient.getChain().id as unknown as string;
    const address = walletClient.getAddress();

    validations.checkApiKey(apikey);
    validations.checkAddress(address);

    const params = new URLSearchParams({
      chainid,
      module: "account",
      action: "addresstokennftbalance",
      address,
      page,
      offset,
      apikey,
    });

    const url = `${API_CONFIG.BASE_URL}?${params}`;
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
      collections,
      totalCount: data.paging.total_count,
    };
  }

  @Tool({
    name: "get_erc20_balance",
    description:
      "Get the Fungible token or ft or erc20 balances for a given address and network",
  })
  async getERC20Balance(
    walletClient: EVMWalletClient,
    parameters: GetERC20BalanceParameters
  ) {
    let { apikey, offset, page } = parameters;
    const chainid = walletClient.getChain().id as unknown as string;
    const address = walletClient.getAddress();

    validations.checkApiKey(apikey);
    validations.checkAddress(address);

    const params = new URLSearchParams({
      chainid,
      module: "account",
      action: "addresstokenbalance",
      address,
      page,
      offset,
      apikey,
    });

    const url = `${API_CONFIG.BASE_URL}?${params}`;
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
      tokens,
      totalCount: data?.paging?.total_count,
    };
  }

  @Tool({
    name: "get_current_balance",
    description: "Get the current balance for a given address and network",
  })
  async getCurrentBalance(
    walletClient: EVMWalletClient,
    parameters: BaseAccountsParameters
  ) {
    try {
      let { apikey } = parameters;
      const chainid = walletClient.getChain().id as unknown as string;
      const address = walletClient.getAddress();

      validations.checkApiKey(apikey);
      validations.checkAddress(address);

      const params = new URLSearchParams({
        chainid,
        module: "account",
        action: "balance",
        address,
        tag: "latest",
        apikey,
      });

      const url = `${API_CONFIG.BASE_URL}?${params}`;
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
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch current balance: ${error.message}`);
    }
  }
}
