import { BN } from "@coral-xyz/anchor";
import { Maybe } from "../types/UtilityTypes";
import {
  LAMPORTS_PER_SOL, PublicKey, Signer, SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction } from "@solana/web3.js";
import getTradeState from "../auction_house/getTradeState";
import SaleType from "../types/SaleType";
import AuctionHouseProgram from "../types/AuctionHouseProgram";


type Accounts = {
  auctionHouse: PublicKey;
  auctionHouseFeeAccount: PublicKey;
  auctionHouseProgramId: PublicKey;
  authority: PublicKey;
  program: AuctionHouseProgram; // change this to the AuctionHouseProgram type
  // assetIdOwner: PublicKey;
  merkleTree: PublicKey;
  paymentAccount: PublicKey;
  treasuryMint: PublicKey;
  wallet: PublicKey;
  assetId: PublicKey;
};

type Args = {
  allocationSize?: Maybe<number>;
  priceInLamports: number;
  saleType: SaleType;
  tokenSize?: number;
};

export default async function auctionHouseCreateTradeStateIx(
  {
    auctionHouse,
    auctionHouseFeeAccount,
    auctionHouseProgramId,
    authority,
    program,
    // assetIdOwner,
    merkleTree,
    treasuryMint,
    paymentAccount,
    wallet,
    assetId
  }: Accounts,
  { allocationSize, priceInLamports, saleType, tokenSize = 1 }: Args
): Promise<TransactionInstruction> {
  const [tradeState, tradeStateBump, buyPriceAdjusted] = await getTradeState({
    auctionHouse,
    auctionHouseProgramId,
    priceInLamports,
    // assetIdOwner,
    merkleTree,
    assetId,
    wallet,
  });

  return program.methods
    .createTradeState(
      tradeStateBump,
      buyPriceAdjusted,
      new BN(tokenSize),
      saleType,
      allocationSize ?? null
    )
    .accounts({
      auctionHouse,
      auctionHouseFeeAccount,
      authority,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      // assetIdOwner,
      paymentAccount,
      treasuryMint, 
      merkleTree,
      tradeState,
      wallet: wallet,
      assetId
    })
    .instruction();
}