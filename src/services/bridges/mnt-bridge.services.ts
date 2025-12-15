/** @format */
import { ethers } from "ethers";
import { Tool } from "@goat-sdk/core";
import mantleSDK, {
  assert,
  CrossChainMessenger,
  MessageStatus,
} from "@mantleio/sdk";
import { ERC20_ABI } from "../../utils/abi";
import { DepositParameters, WithdrawParameters } from "./parameters";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";

export type MNTBridgeConfig = {
  l1Signer: ethers.Signer;
  l2Signer: ethers.Signer;
  l1ChainId: number;
  l2ChainId: number;
  l1MntTokenAddress: string;
  l2MntTokenAddress: string;
};

export class MNTBridgeService {
  private l1Signer!: ethers.Signer;
  private l2Signer!: ethers.Signer;
  private crossChainMessenger!: CrossChainMessenger;
  private l1MntToken!: ethers.Contract;

  constructor(private config: MNTBridgeConfig) {}

  private async init() {
    this.l1Signer = this.config.l1Signer;
    this.l2Signer = this.config.l2Signer;

    this.crossChainMessenger = new mantleSDK.CrossChainMessenger({
      l1ChainId: this.config.l1ChainId,
      l2ChainId: this.config.l2ChainId,
      l1SignerOrProvider: this.l1Signer,
      l2SignerOrProvider: this.l2Signer,
      bedrock: true,
    });

    this.l1MntToken = new ethers.Contract(
      this.config.l1MntTokenAddress,
      ERC20_ABI,
      this.l1Signer
    );
  }

  private async getBalances(ourAddr: string) {
    if (!this.crossChainMessenger) await this.init();
    const l1Balance = await this.l1MntToken.balanceOf(ourAddr);
    const l2Balance = await this.crossChainMessenger.l2Signer.getBalance();
    return { l1Balance, l2Balance, address: ourAddr };
  }

  @Tool({
    name: "deposit_mnt",
    description: "Deposit MNT tokens from L1 to L2 on Mantle",
  })
  async depositMNT(
    walletClient: EVMWalletClient,
    parameters: DepositParameters
  ) {
    if (!this.crossChainMessenger) await this.init();
    const ourAddr = walletClient.getAddress();
    assert(
      ourAddr === (await this.l1Signer.getAddress()),
      "Signer address does not match"
    );
    const amount = parameters.amount;

    const allowanceTx = await this.crossChainMessenger.approveERC20(
      this.config.l1MntTokenAddress,
      this.config.l2MntTokenAddress,
      amount
    );
    await allowanceTx.wait();

    const depositTx = await this.crossChainMessenger.depositMNT(amount);
    await depositTx.wait();

    await this.crossChainMessenger.waitForMessageStatus(
      depositTx.hash,
      MessageStatus.RELAYED
    );

    return await this.getBalances(ourAddr);
  }

  @Tool({
    name: "withdraw_mnt",
    description: "Withdraw MNT tokens from L2 to L1 on Mantle",
  })
  async withdrawMNT(
    walletClient: EVMWalletClient,
    parameters: WithdrawParameters
  ) {
    if (!this.crossChainMessenger) await this.init();
    const ourAddr = walletClient.getAddress();
    assert(
      ourAddr === (await this.l1Signer.getAddress()),
      "Signer address does not match"
    );
    const amount = parameters.amount;

    const withdrawTx = await this.crossChainMessenger.withdrawMNT(amount);
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

    return await this.getBalances(ourAddr);
  }
}
