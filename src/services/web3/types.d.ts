/** @format */

declare module "viem" {
  export function keccak256(bytes: Uint8Array): string;
  export function parseEther(value: string): bigint;
  export function isAddress(address: string): boolean;
  export function encodeFunctionData(
    params: EncodeFunctionDataParameters
  ): string;
  export interface EncodeFunctionDataParameters {
    abi: any[];
    functionName: string;
    args: any[];
  }
}
