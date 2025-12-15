/** @format */

import { Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";

export class MantleAIPlugin extends PluginBase<EVMWalletClient> {
  constructor(services: Array<any>) {
    super("mantle", services);
  }

  supportsChain = (chain: Chain) => {
    return chain.type === "evm";
  };
}

export function MantlePlugin(services: Array<any>) {
  return new MantleAIPlugin(services);
}
