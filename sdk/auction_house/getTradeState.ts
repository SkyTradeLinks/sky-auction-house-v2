import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import findAuctionHouseTradeState from "../pdas/findAuctionHouseTradeState";

export default async function getTradeState({
  wallet,
  tokenAccount,
  tokenMint,
  priceInLamports,
  auctionHouse,
  treasuryMint,
  auctionHouseProgramId,
  tokenSize = 1,
}: {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  priceInLamports: number;
  tokenAccount: PublicKey;
  tokenMint: PublicKey;
  tokenSize?: number;
  treasuryMint: PublicKey;
  wallet: PublicKey;
}): Promise<[PublicKey, number, BN]> {
  const priceAdjusted = new BN(priceInLamports);

  const [tradeState, tradeStateBump] = findAuctionHouseTradeState(
    auctionHouse,
    wallet,
    tokenAccount,
    treasuryMint,
    tokenMint,
    new BN(tokenSize),
    priceAdjusted,
    auctionHouseProgramId
  );

  return [tradeState, tradeStateBump, priceAdjusted];
}