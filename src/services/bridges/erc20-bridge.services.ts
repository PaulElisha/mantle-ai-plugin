/** @format */

import { ethers } from "ethers";
import { Tool } from "@goat-sdk/core";
import mantleSDK, { CrossChainMessenger, MessageStatus } from "@mantleio/sdk";
import { ERC20_ABI } from "../../utils/abi";
import { DepositParameters } from "./parameters";

export type ERC20BridgeConfig = {
  l1Signer: ethers.Signer;
  l2Signer: ethers.Signer;
  l1ChainId: number;
  l2ChainId: number;
  l1Erc20TokenAddress: string;
  l2Erc20TokenAddress: string;
};

export class ERC20BridgeService {
  private l1Signer!: ethers.Signer;
  private l2Signer!: ethers.Signer;
  private crossChainMessenger!: CrossChainMessenger;
  private l1Erc20Token!: ethers.Contract;
  private l2Erc20Token!: ethers.Contract;
  private ourAddr!: string;

  constructor(private config: ERC20BridgeConfig) {
    this.l1Signer = this.config.l1Signer;
    this.l2Signer = this.config.l2Signer;
  }

  async init() {
    this.ourAddr = await this.l1Signer.getAddress();

    this.crossChainMessenger = new mantleSDK.CrossChainMessenger({
      l1ChainId: this.config.l1ChainId,
      l2ChainId: this.config.l2ChainId,
      l1SignerOrProvider: this.l1Signer,
      l2SignerOrProvider: this.l2Signer,
      bedrock: true,
    });

    this.l1Erc20Token = new ethers.Contract(
      this.config.l1Erc20TokenAddress,
      ERC20_ABI,
      this.l1Signer
    );
    this.l2Erc20Token = new ethers.Contract(
      this.config.l2Erc20TokenAddress,
      ERC20_ABI,
      this.l2Signer
    );
  }

  private async reportBalances() {
    const l1Balance = await this.l1Erc20Token.balanceOf(this.ourAddr);
    const l2Balance = await this.l2Erc20Token.balanceOf(this.ourAddr);
    return { l1Balance, l2Balance, address: this.ourAddr };
  }

  @Tool({
    name: "deposit_erc20",
    description: "Deposit ERC20 tokens from L1 to L2 on Mantle",
  })
  async depositERC20(parameters: DepositParameters) {
    const amount = parameters.amount;
    await this.reportBalances();

    const approveTx = await this.crossChainMessenger.approveERC20(
      this.l1Erc20Token.address,
      this.l2Erc20Token.address,
      amount
    );
    await approveTx.wait();

    const depositTx = await this.crossChainMessenger.depositERC20(
      this.l1Erc20Token.address,
      this.l2Erc20Token.address,
      amount
    );
    await depositTx.wait();

    await this.crossChainMessenger.waitForMessageStatus(
      depositTx.hash,
      MessageStatus.RELAYED
    );

    await this.reportBalances();
  }

  @Tool({
    name: "withdraw_erc20",
    description: "Withdraw ERC20 tokens from L2 to L1 on Mantle",
  })
  async withdrawERC20(parameters: DepositParameters) {
    const amount = parameters.amount;
    await this.reportBalances();

    const withdrawTx = await this.crossChainMessenger.withdrawERC20(
      this.l1Erc20Token.address,
      this.l2Erc20Token.address,
      amount
    );
    await withdrawTx.wait();

    await this.crossChainMessenger.waitForMessageStatus(
      withdrawTx.hash,
      MessageStatus.READY_TO_PROVE
    );

    await this.crossChainMessenger.proveMessage(withdrawTx.hash);

    await this.crossChainMessenger.waitForMessageStatus(
      withdrawTx.hash,
      MessageStatus.IN_CHALLENGE_PERIOD
    );

    await this.crossChainMessenger.waitForMessageStatus(
      withdrawTx.hash,
      MessageStatus.READY_FOR_RELAY
    );

    await this.crossChainMessenger.finalizeMessage(withdrawTx.hash);

    await this.crossChainMessenger.waitForMessageStatus(
      withdrawTx.hash,
      MessageStatus.RELAYED
    );

    await this.reportBalances();
  }
}
