/** @format */

import { isAddress } from "viem";

let validations: any = {};

validations.checkApiKey = (apiKey: any) => {
  if (!apiKey) {
    throw new Error("Missing API key");
  }
};

validations.checkAddress = (address: any) => {
  return isAddress(address);
};

export { validations };
