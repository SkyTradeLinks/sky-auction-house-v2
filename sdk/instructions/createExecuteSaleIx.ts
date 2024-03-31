import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../../target/types/auction_house";
import { PublicKey } from "@solana/web3.js";
import findTradeState from "../pdas/findTradeState";
import { getLeafData } from "../utils/helper";
import { Umi } from "@metaplex-foundation/umi";
import findEscrowAccount from "../pdas/findEscrowAccount";

import * as anchor from "@coral-xyz/anchor";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const createExecuteSaleIx = async (
  program: Program<AuctionHouse>,
  umi: Umi,
  buyer: PublicKey,
  assetId: PublicKey,
  merkleTree: PublicKey,
  seller: PublicKey,
  auctionHouse: PublicKey,
  mintAccount: PublicKey,
  feeAccount: PublicKey,
  treasuryAccount: PublicKey,
  auctionHouseAuthority: PublicKey,
  auctionHouseProgramId: PublicKey
) => {
  const [buyerTradeState] = findTradeState(
    auctionHouse,
    buyer,
    assetId,
    mintAccount,
    merkleTree,
    auctionHouseProgramId
  );

  const [sellerTradeState] = findTradeState(
    auctionHouse,
    seller,
    assetId,
    mintAccount,
    merkleTree,
    auctionHouseProgramId
  );

  const [escrowPaymentAccount, escrowBump] = findEscrowAccount(
    auctionHouse,
    buyer,
    assetId,
    auctionHouseProgramId
  );

  const leafData = await getLeafData(umi, assetId, seller);

  let sellerAta = await getAssociatedTokenAddressSync(mintAccount, seller);

  const ix = await program.methods
    .executeSaleV2(escrowBump, leafData)
    .accounts({
      buyer,
      seller,
      treasuryMint: mintAccount,
      assetId,
      escrowPaymentAccount,
      sellerPaymentReceiptAccount: sellerAta,
      merkleTree,
      authority: auctionHouseAuthority,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      auctionHouseTreasury: treasuryAccount,
      buyerTradeState,
      sellerTradeState,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      nftDelegate: leafData.delegate,
    })
    .instruction();

  return ix;
};

export default createExecuteSaleIx;
