import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Signer } from "@solana/web3.js";
import getTradeState from "./getTradeState";
import { BN } from "@coral-xyz/anchor";



export default async function getSellerFreeTradeState({
  wallet,
  // assetIdOwner,
  merkleTree,
  auctionHouse,
  assetId,
  auctionHouseProgramId,
  tokenSize = 1,
}: {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  merkleTree: PublicKey;
  tokenSize?: number;
  assetId: PublicKey;
  wallet: PublicKey;
}): Promise<[PublicKey, number, BN]> {
  return getTradeState({
    auctionHouse,
    auctionHouseProgramId,
    priceInLamports: 0,
    merkleTree,
    tokenSize,
    assetId,
    wallet,
  });
}