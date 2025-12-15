/** @format */
import { AbiFactory, TokenTransferPayload } from "../../utils/token";
import { getContractDecimals, formatTokenAmount } from "../../utils/helper";
import { parseEther } from "viem";
import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import {
  TransferErc20Parameters,
  TransferErc721Parameters,
  TransferErc1155Parameters,
  TransferNativeTokenParameters,
} from "./parameters";

export class TransferServices {
  constructor() {}

  @Tool({
    name: "transfer_erc20",
    description: "Transfer ERC20 token",
  })
  async transferErc20(
    walletClient: EVMWalletClient,
    parameters: TransferErc20Parameters &
      Omit<TokenTransferPayload, "type" | "tokenId">
  ) {
    const { amount, contractAddress } = parameters;
    try {
      const sender = walletClient.getAddress();

      // Get the token decimals
      const decimals = await getContractDecimals(contractAddress, walletClient);

      // Format the amount based on token decimals
      parameters.amount = formatTokenAmount(amount, decimals);

      const tx: any = {
        from: sender,
        to: contractAddress,
        data: new AbiFactory({
          ...(parameters as Partial<TokenTransferPayload>),
          type: "erc20",
        }).createParams(),
      };

      const sentTx = await walletClient.sendTransaction(tx);
      const transactionHash = sentTx.hash || sentTx;
      return {
        transactionHash,
        url: `https://explorer.mantle.xyz/tx/${transactionHash}`,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  @Tool({
    name: "transfer_erc721",
    description: "Transfer ERC721 token",
  })
  async transferErc721(
    walletClient: EVMWalletClient,
    parameters: TransferErc721Parameters &
      Omit<TokenTransferPayload, "type" | "amount">
  ) {
    const { contractAddress } = parameters;
    try {
      const sender = walletClient.getAddress();

      const tx: any = {
        from: sender,
        to: contractAddress,
        data: new AbiFactory({
          ...(parameters as Partial<TokenTransferPayload>),
          type: "erc721",
        }).createParams(),
      };

      const sentTx = await walletClient.sendTransaction(tx);
      return {
        transactionHash: sentTx.hash || sentTx,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  @Tool({
    name: "transfer_erc1155",
    description: "Transfer ERC1155 token",
  })
  async transferErc1155(
    walletClient: EVMWalletClient,
    parameters: TransferErc1155Parameters & Omit<TokenTransferPayload, "type">
  ) {
    const { contractAddress } = parameters;
    try {
      const sender = walletClient.getAddress();

      const tx: any = {
        from: sender,
        to: contractAddress,
        data: new AbiFactory({
          ...(parameters as Partial<TokenTransferPayload>),
          type: "erc1155",
        }).createParams(),
      };

      const sentTx = await walletClient.sendTransaction(tx);

      return {
        transactionHash: sentTx.hash || sentTx,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  @Tool({
    name: "transfer_native_token",
    description: "Transfer native token",
  })
  async transferNativeToken(
    walletClient: EVMWalletClient,
    parameters: TransferNativeTokenParameters &
      Omit<TokenTransferPayload, "type" | "tokenId" | "contractAddress">
  ) {
    const { receiver, amount } = parameters;
    try {
      const sender = walletClient.getAddress();

      const tx: any = {
        from: sender,
        to: receiver,
        value: parseEther(amount),
      };

      const sentTx = await walletClient.sendTransaction(tx);

      return {
        transactionHash: sentTx.hash || sentTx,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
