/** @format */

import { z } from "zod";
import { createToolParameters } from "@goat-sdk/core";

export class BaseAccountsParameters extends createToolParameters(
  z.object({
    address: z.string(),
    network: z.string(),
  })
) {}

export class GetNFTBalanceParameters extends createToolParameters(
  z.object({
    address: z.string(),
    network: z.string(),
    page: z.string(),
    offset: z.string(),
  })
) {}

export class GetERC20BalanceParameters extends createToolParameters(
  z.object({
    address: z.string(),
    network: z.string(),
    page: z.string(),
    offset: z.string(),
  })
) {}

export class GetTransactionsByAccountParameters extends createToolParameters(
  z.object({
    address: z.string(),
    network: z.string(),
    startblock: z.string(),
    endblock: z.string(),
    page: z.string(),
    offset: z.string(),
  })
) {}

export class GetTransactionsByBlockNumberParameters extends createToolParameters(
  z.object({
    blockNumber: z.number(),
    network: z.string(),
  })
) {}

export class GetBlockInfoParameters extends createToolParameters(
  z.object({
    blockNumber: z.string(),
    network: z.string(),
  })
) {}

export class GetLatestBlockParameters extends createToolParameters(
  z.object({
    network: z.string(),
  })
) {}
