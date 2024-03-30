import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { AuctionHouse } from "../../target/types/auction_house";

import { PublicKey } from "@solana/web3.js";
import SaleType from "../types/enum/SaleType";
import { Umi, publicKey } from "@metaplex-foundation/umi";
import {
  getAssetWithProof,
  getMetadataArgsSerializer,
} from "@metaplex-foundation/mpl-bubblegum";

import { auctionHouseAuthority } from "../utils/constants";
import findTradeState from "../pdas/findTradeState";

const createSellIx = async (
  program: Program<AuctionHouse>,
  umi: Umi,
  price: number,
  seller: PublicKey,
  assetId: PublicKey,
  merkleTree: PublicKey,
  auctionHouse: PublicKey,
  mintAccount: PublicKey,
  feeAccount: PublicKey,
  saleType: SaleType,
  auctionHouseProgramId: PublicKey
) => {
  let normalizedPrice = new anchor.BN(price * Math.pow(10, 6));

  const [tradeState, tradeStateBump] = findTradeState(
    auctionHouse,
    seller,
    assetId,
    mintAccount,
    merkleTree,
    auctionHouseProgramId
  );

  const assetWithProof = await getAssetWithProof(umi, publicKey(assetId));

  const leafData = {
    leafIndex: assetWithProof.index,
    leafNonce: new anchor.BN(assetWithProof.nonce),
    owner: seller,
    delegate:
      assetWithProof.leafDelegate != null
        ? new anchor.web3.PublicKey(assetWithProof.leafDelegate)
        : seller,
    root: new anchor.web3.PublicKey(assetWithProof.root),
    leafHash: [
      ...new anchor.web3.PublicKey(
        assetWithProof.rpcAssetProof.leaf.toString()
      ).toBytes(),
    ],
    leafMetadata: Buffer.from(
      getMetadataArgsSerializer().serialize(assetWithProof.metadata)
    ),
  };

  // trade-state is created on the fly
  const ix = await program.methods
    .sell(tradeStateBump, normalizedPrice, saleType, leafData)
    .accounts({
      wallet: seller,
      assetId,
      authority: auctionHouseAuthority.publicKey,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      sellerTradeState: tradeState,
      treasuryMint: mintAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      merkleTree,
      leafDataOwner: seller,
    })
    .instruction();

  return ix;
};

export default createSellIx;
