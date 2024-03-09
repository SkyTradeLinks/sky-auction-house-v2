import * as anchor from "@coral-xyz/anchor";
import PdaResult from "../types/PdaResult";
import { PublicKey } from "@solana/web3.js";
import { LAST_BID_PRICE } from "../utils/constants";

export default function findLastBidPrice(
  mint: PublicKey,
  auctionHouseProgramId: PublicKey,
  auctionHouseAccount: PublicKey
): PdaResult {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(LAST_BID_PRICE),
      auctionHouseAccount.toBuffer(),
      mint.toBuffer(),
    ],
    auctionHouseProgramId
  );
}