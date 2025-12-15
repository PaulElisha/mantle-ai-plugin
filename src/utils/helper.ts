/** @format */
import { keccak256 } from "viem";
import { ERC20_ABI } from "../utils/abi";

export async function getContractDecimals(
  contractAddress: string,
  walletClient: any
) {
  try {
    if (walletClient.call) {
      // Step 1: Get the Keccak-256 hash of the function signature
      const functionSignature = new TextEncoder().encode("decimals()");
      const functionHash = keccak256(functionSignature);

      // Step 2: First 4 bytes (8 hex chars) → function selector
      const selector = functionHash.slice(0, 10); // '0x' + 8 char
      const result = await walletClient.call({
        to: contractAddress,
        data: selector,
      });

      const decimals = parseInt(result, 16);

      return decimals;
    } else if (walletClient.read) {
      const result = await walletClient.read({
        address: contractAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
        args: [],
      });

      return result?.value || 18;
    } else {
      throw new Error("Problem calculating the decimals");
    }
  } catch (err) {
    console.error("Error fetching decimals:", err);
    throw err;
  }
}

// Function to format amount based on token decimals
export function formatTokenAmount(
  amount: string | number | bigint,
  decimals: number
): bigint {
  // Convert amount to string to handle all input types consistently
  const amountStr = amount.toString();

  // Check if amount already includes decimal point
  if (amountStr.includes(".")) {
    // Split by decimal point
    const [integerPart, fractionalPart] = amountStr.split(".");

    // Pad the fractional part with zeros if needed
    const paddedFractionalPart = fractionalPart
      .padEnd(decimals, "0")
      .slice(0, decimals);

    // Combine and convert to bigint
    return BigInt(integerPart + paddedFractionalPart);
  } else {
    // No decimal point, just multiply by 10^decimals
    return BigInt(amountStr) * BigInt(10) ** BigInt(decimals);
  }
}
