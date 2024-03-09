import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import PdaResult from "../types/PdaResult";
import { AUCTION_HOUSE } from "../utils/constants";
import { BN } from "@coral-xyz/anchor";


export default function findAuctionHouseTradeState(
  auctionHouse: PublicKey,
  wallet: PublicKey,
  tokenAccount: PublicKey,
  treasuryMint: PublicKey,
  tokenMint: PublicKey,
  tokenSize: BN,
  buyPrice: BN,
  auctionHouseProgramId: PublicKey
): PdaResult {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      tokenAccount.toBuffer(),
      treasuryMint.toBuffer(),
      tokenMint.toBuffer(),
      buyPrice.toArrayLike(Buffer, "le", 8),
      tokenSize.toArrayLike(Buffer, "le", 8),
    ],
    auctionHouseProgramId
  );
}