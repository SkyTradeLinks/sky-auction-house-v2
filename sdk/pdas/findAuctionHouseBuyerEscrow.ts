import PdaResult from "../types/PdaResult";
import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "../utils/constants";

export default function findAuctionHouseBuyerEscrow(
  auctionHouse: PublicKey,
  wallet: PublicKey,
  auctionHouseTreasuryMint: PublicKey,
  //   assetId: PublicKey,
  auctionHouseProgramId: PublicKey
): PdaResult {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      wallet.toBuffer(),
      //   assetId.toBuffer(),
      auctionHouseTreasuryMint.toBuffer(),
    ],
    auctionHouseProgramId
  );
}
