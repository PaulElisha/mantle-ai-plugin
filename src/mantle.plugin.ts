/** @format */

import { Chain, PluginBase } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";

export class MantleAIPlugin extends PluginBase<EVMWalletClient> {
  private config: Record<string, unknown>;

  constructor(config: Record<string, unknown> = {}, services: []) {
    super("mantle", services);
    this.config = config;
  }

  supportsChain = (chain: Chain) => {
    return chain.type === "evm";
  };
}

export function MantlePlugin(
  config: Record<string, unknown> = {},
  services: []
) {
  return new MantleAIPlugin(config, services);
}
