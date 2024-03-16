import { PublicKey , Signer} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import findAuctionHouseTradeState from "../pdas/findAuctionHouseTradeState";

export default async function getTradeState({
  wallet,
  merkleTree,
  priceInLamports,
  auctionHouse,
  // treasuryMint,
  assetId,
  auctionHouseProgramId,
  tokenSize = 1,
}: {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  priceInLamports: number;
  assetId: PublicKey;
  // tokenMint: PublicKey;
  merkleTree: PublicKey;
  tokenSize?: number;
  // treasuryMint: PublicKey;
  wallet: Signer;
}): Promise<[PublicKey, number, BN]> {
  const priceAdjusted = new BN(priceInLamports);

  const [tradeState, tradeStateBump] = findAuctionHouseTradeState(
    auctionHouse,
    wallet,
    // treasuryMint,
    merkleTree,
    assetId,
    new BN(tokenSize),
    priceAdjusted,
    auctionHouseProgramId
  );

  return [tradeState, tradeStateBump, priceAdjusted];
}