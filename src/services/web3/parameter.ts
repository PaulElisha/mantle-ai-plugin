/** @format */

import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class TransferFaucetParameters extends createToolParameters(
  z.object({
    receiver: z.string(),
  })
) {}

export class TransferErc20Parameters extends createToolParameters(
  z.object({
    receiver: z.string(),
    amount: z.bigint(),
    contractAddress: z.string(),
    type: z.enum(["erc20", "erc721", "erc1155"]),
    network: z.enum(["testnet", "mainnet"]),
  })
) {}

export class TransferErc721Parameters extends createToolParameters(
  z.object({
    receiver: z.string(),
    tokenId: z.string(),
    amount: z.bigint(),
    type: z.enum(["erc721"]),
    contractAddress: z.string(),
    network: z.enum(["testnet", "mainnet"]),
  })
) {}

export class TransferErc1155Parameters extends createToolParameters(
  z.object({
    receiver: z.string(),
    amount: z.number(),
    tokenId: z.string(),
    contractAddress: z.string(),
    network: z.enum(["testnet", "mainnet"]),
  })
) {}

export class TransferNativeTokenParameters extends createToolParameters(
  z.object({
    receiver: z.string(),
    amount: z.string(),
    tokenId: z.string(),
    type: z.enum(["erc20", "erc721", "erc1155"]),
    contractAddress: z.string(),
    network: z.enum(["testnet", "mainnet"]),
  })
) {}
