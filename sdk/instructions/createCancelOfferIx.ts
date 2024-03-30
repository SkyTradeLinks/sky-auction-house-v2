import { AuctionHouse } from "../../target/types/auction_house";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

import findTradeState from "../pdas/findTradeState";
import findEscrowAccount from "../pdas/findEscrowAccount";
import { auctionHouseAuthority } from "../utils/constants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const createCancelOfferIx = async (
  program: Program<AuctionHouse>,
  buyer: PublicKey,
  assetId: PublicKey,
  merkleTree: PublicKey,
  auctionHouse: PublicKey,
  mintAccount: PublicKey,
  buyerAta: PublicKey,
  leafIndex: number,
  auctionHouseProgramId: PublicKey
) => {
  const [tradeState, tradeStateBump] = findTradeState(
    auctionHouse,
    buyer,
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

  const ix = await program.methods
    .cancelOffer(tradeStateBump, escrowBump, new anchor.BN(leafIndex))
    .accounts({
      wallet: buyer,
      paymentAccount: buyerAta,
      transferAuthority: buyer,
      treasuryMint: mintAccount,
      assetId: assetId,
      escrowPaymentAccount,
      authority: auctionHouseAuthority.publicKey,
      auctionHouse: auctionHouse,
      buyerTradeState: tradeState,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    });

  return ix;
};

export default createCancelOfferIx;
