import { PublicKey , Signer} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import findAuctionHouseTradeState from "../pdas/findAuctionHouseTradeState";

export default async function getTradeState({
  wallet,
  merkleTree,
  priceInLamports,
  auctionHouse,
  assetId,
  // assetIdOwner,
  auctionHouseProgramId,
  tokenSize = 1,
}: {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  priceInLamports: number;
  // assetIdOwner: PublicKey;
  // tokenMint: PublicKey;
  merkleTree: PublicKey;
  tokenSize?: number;
  assetId: PublicKey;
  wallet: PublicKey;
}): Promise<[PublicKey, number, BN]> {
  const priceAdjusted = new BN(priceInLamports);

  const [tradeState, tradeStateBump] = findAuctionHouseTradeState(
    auctionHouse,
    wallet,
    assetId,
    merkleTree,
    // assetIdOwner,
    new BN(tokenSize),
    priceAdjusted,
    auctionHouseProgramId
  );

  return [tradeState, tradeStateBump, priceAdjusted];
}