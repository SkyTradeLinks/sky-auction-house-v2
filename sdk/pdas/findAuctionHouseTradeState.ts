import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Signer } from "@solana/web3.js";
import PdaResult from "../types/PdaResult";
import { AUCTION_HOUSE } from "../utils/constants";
import { BN } from "@coral-xyz/anchor";


export default function findAuctionHouseTradeState(
  auctionHouse: PublicKey,
  wallet: PublicKey,
  assetId: PublicKey,
  merkleTree: PublicKey,
  buyPrice: BN,
  auctionHouseProgramId: PublicKey
): PdaResult {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      merkleTree.toBuffer(),
      assetId.toBuffer(),
      buyPrice.toArrayLike(Buffer, "le", 8),
    ],
    auctionHouseProgramId
  );
}