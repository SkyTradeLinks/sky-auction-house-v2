import { BN } from "@coral-xyz/anchor";
import getTradeState from "../auction_house/getTradeState";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";
import findAuctionHouseProgramAsSigner from "../pdas/findAuctionHouseProgramAsSigner";
import findEditionPda from "../program_shared/pdas/findEditionPda";
import findTokenMetadataPda from "../program_shared/pdas/findTokenMetadataPda";
import getSellerFreeTradeState from "../auction_house/getSellerFreeTradeState";
import { TOKEN_METADATA_PROGRAM_ID } from "../program_shared/constants/ProgramIds"
import AuctionHouseProgram from '../types/AuctionHouseProgram';






type Accounts = {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  authority: PublicKey;
  feeAccount: PublicKey;
  priceInLamports: number;
  program: AuctionHouseProgram;
  tokenAccount: PublicKey;
  tokenMint: PublicKey;
  treasuryMint: PublicKey;
  walletSeller: PublicKey;
  landMerkleTree: PublicKey;
  remainingAccounts: any
};

type Args = {
  tokenSize?: number;
  leavesData: any;
};


export default async function auctionHouseSellIx(
  {
    program,
    walletSeller,
    tokenAccount,
    feeAccount,
    tokenMint,
    priceInLamports,
    authority,
    auctionHouse,
    treasuryMint,
    auctionHouseProgramId,
    landMerkleTree,
    remainingAccounts
  }: Accounts,
  { tokenSize = 1, leavesData }: Args
): Promise<TransactionInstruction> {
  const [tradeState, tradeBump, buyPriceAdjusted] = await getTradeState({
    auctionHouse,
    auctionHouseProgramId,
    priceInLamports,
    tokenAccount,
    tokenMint,
    treasuryMint,
    wallet: walletSeller,
  });
  const [programAsSigner, programAsSignerBump] = findAuctionHouseProgramAsSigner(auctionHouseProgramId);
  const [masterEdition] = findEditionPda(tokenMint);
  const [metadata] = findTokenMetadataPda(tokenMint);
  const [freeTradeState, freeTradeBump] = await getSellerFreeTradeState({
    auctionHouse,
    auctionHouseProgramId,
    tokenAccount,
    tokenMint,
    treasuryMint,
    wallet: walletSeller,
  });

  return program.methods
    .sell(
      tradeBump,
      freeTradeBump,
      programAsSignerBump,
      buyPriceAdjusted,
      new BN(tokenSize),
      leavesData
    )
    .accounts({
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      authority,
      freeSellerTradeState: freeTradeState,
      masterEdition,
      metadata,
      metaplexTokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      programAsSigner,
      rent: SYSVAR_RENT_PUBKEY,
      sellerTradeState: tradeState,
      systemProgram: SystemProgram.programId,
      tokenAccount,
      tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      wallet: walletSeller,
      landMerkleTree: landMerkleTree
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
}