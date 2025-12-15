/** @format */
import { createToolParameters } from "@goat-sdk/core";
import { z } from "zod";

export class DepositParameters extends createToolParameters(
  z.object({
    amount: z.string(),
  })
) {}

export class WithdrawParameters extends createToolParameters(
  z.object({
    amount: z.string(),
  })
) {}
