import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Signer } from "@solana/web3.js";
import getTradeState from "./getTradeState";
import { BN } from "@coral-xyz/anchor";



export default async function getSellerFreeTradeState({
  wallet,
  assetId,
  merkleTree,
  auctionHouse,
  // treasuryMint,
  auctionHouseProgramId,
  tokenSize = 1,
}: {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  assetId: PublicKey;
  merkleTree: PublicKey;
  tokenSize?: number;
  // treasuryMint: PublicKey;
  wallet: Signer;
}): Promise<[PublicKey, number, BN]> {
  return getTradeState({
    auctionHouse,
    auctionHouseProgramId,
    priceInLamports: 0,
    assetId,
    merkleTree,
    tokenSize,
    // treasuryMint,
    wallet,
  });
}