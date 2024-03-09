import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import getTradeState from "./getTradeState";
import { BN } from "@coral-xyz/anchor";



export default async function getSellerFreeTradeState({
  wallet,
  tokenAccount,
  tokenMint,
  auctionHouse,
  treasuryMint,
  auctionHouseProgramId,
  tokenSize = 1,
}: {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  tokenAccount: PublicKey;
  tokenMint: PublicKey;
  tokenSize?: number;
  treasuryMint: PublicKey;
  wallet: PublicKey;
}): Promise<[PublicKey, number, BN]> {
  return getTradeState({
    auctionHouse,
    auctionHouseProgramId,
    priceInLamports: 0,
    tokenAccount,
    tokenMint,
    tokenSize,
    treasuryMint,
    wallet,
  });
}