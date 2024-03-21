import { BN } from "@coral-xyz/anchor";
import getTradeState from "../auction_house/getTradeState";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Signer,
} from "@solana/web3.js";
import findAuctionHouseBuyerEscrow from "../pdas/findAuctionHouseBuyerEscrow";
import findEditionPda from "../program_shared/pdas/findEditionPda";
// import findTokenMetadataPda from "../program_shared/pdas/findTokenMetadataPda";
import getSellerFreeTradeState from "../auction_house/getSellerFreeTradeState";
import { TOKEN_METADATA_PROGRAM_ID } from "../program_shared/constants/ProgramIds";
import AuctionHouseProgram from "../types/AuctionHouseProgram";

type Accounts = {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  authority: PublicKey;
  feeAccount: PublicKey;
  paymentAccount: PublicKey;
  program: AuctionHouseProgram;
  auctionHouseTreasuryMint: PublicKey;
  transferAuthority: PublicKey;
  //   treasuryMint: PublicKey;
  wallet: PublicKey;
  //   assetId: PublicKey;
};

type Args = {
  amount: number;
};

export default async function auctionHouseDepositIx(
  {
    program,
    wallet,
    feeAccount,
    paymentAccount,
    // transferAuthority = SystemProgram.programId,
    transferAuthority,
    auctionHouseTreasuryMint,
    authority,
    auctionHouse,
    // treasuryMint,
    // assetId,
    auctionHouseProgramId,
  }: Accounts,
  { amount }: Args
): Promise<TransactionInstruction> {
  const [escrowPaymentAccount, escrowBump] = findAuctionHouseBuyerEscrow(
    auctionHouse,
    wallet,
    auctionHouseTreasuryMint,
    // assetId,
    auctionHouseProgramId
  );

  return program.methods
    .deposit(escrowBump, new BN(amount))
    .accounts({
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      authority,
      escrowPaymentAccount,
      paymentAccount,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      transferAuthority,
      treasuryMint: auctionHouseTreasuryMint,
      wallet,
    })
    .instruction();
}
