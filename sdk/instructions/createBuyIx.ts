import { PublicKey } from "@solana/web3.js";
import SaleType from "../types/enum/SaleType";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import findTradeState from "../pdas/findTradeState";
import findEscrowAccount from "../pdas/findEscrowAccount";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { AuctionHouse } from "../../target/types/auction_house";


const createBuyIx = async (
  program: Program<AuctionHouse>,
  price: number,
  buyer: PublicKey,
  assetId: PublicKey,
  merkleTree: PublicKey,
  auctionHouse: PublicKey,
  mintAccount: PublicKey,
  previousBidder: PublicKey,
  lastBidPrice: PublicKey,
  feeAccount: PublicKey,
  auctionHouseAuthority: PublicKey,
  leafIndex: number,
  saleType: SaleType,
  auctionHouseProgramId: PublicKey
) => {
  let normalizedPrice = new anchor.BN(price * Math.pow(10, 6));

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

  const [previousBidderEscrowPaymentAccount, previousBidderEscrowPaymentBump] =
    findEscrowAccount(
      auctionHouse,
      previousBidder,
      assetId,
      auctionHouseProgramId
    );

  let previousBidderRefundAccount = getAssociatedTokenAddressSync(
    mintAccount,
    previousBidder
  );

  let buyerAta = getAssociatedTokenAddressSync(mintAccount, buyer);

  // trade-state is created on the fly
  const ix = await program.methods
    .buyV2(
      tradeStateBump,
      escrowBump,
      normalizedPrice,
      new anchor.BN(leafIndex),
      saleType,
      null,
      previousBidderEscrowPaymentBump
    )
    .accounts({
      wallet: buyer,
      paymentAccount: buyerAta,
      transferAuthority: buyer,
      treasuryMint: mintAccount,
      assetId: assetId,
      escrowPaymentAccount,
      authority: auctionHouseAuthority,
      auctionHouse: auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      buyerTradeState: tradeState,
      merkleTree,
      lastBidPrice,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      previousBidderWallet: previousBidder,
      previousBidderEscrowPaymentAccount,
      previousBidderRefundAccount,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();

  return ix;
};

export default createBuyIx;
