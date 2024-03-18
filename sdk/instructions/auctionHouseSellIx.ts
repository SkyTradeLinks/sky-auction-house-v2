import { BN } from "@coral-xyz/anchor";
import getTradeState from "../auction_house/getTradeState";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction, SYSVAR_RENT_PUBKEY, SystemProgram, Signer } from "@solana/web3.js";
import findAuctionHouseProgramAsSigner from "../pdas/findAuctionHouseProgramAsSigner";
import findEditionPda from "../program_shared/pdas/findEditionPda";
// import findTokenMetadataPda from "../program_shared/pdas/findTokenMetadataPda";
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
  leafDataOwner: PublicKey;
  paymentAccount: PublicKey;
  merkleTree: PublicKey;
  treasuryMint: PublicKey;
  sellerWallet: PublicKey;
  assetId: PublicKey
};

type Args = {
  tokenSize?: number;
};


export default async function auctionHouseSellIx(
  {
    program,
    sellerWallet,
    paymentAccount,
    feeAccount,
    merkleTree,
    priceInLamports,
    authority,
    auctionHouse,
    treasuryMint,
    auctionHouseProgramId,
    assetId,
    leafDataOwner
 
  }: Accounts,
  { tokenSize = 1 }: Args
): Promise<TransactionInstruction> {
  const [tradeState, tradeBump, buyPriceAdjusted] = await getTradeState({
    auctionHouse,
    auctionHouseProgramId,
    priceInLamports,
    merkleTree,
    assetId,
    wallet: sellerWallet,
  });
  const [programAsSigner, programAsSignerBump] = findAuctionHouseProgramAsSigner(auctionHouseProgramId);
  const [masterEdition] = findEditionPda(treasuryMint);
  // const [metadata] = findTokenMetadataPda(treasuryMint);
  const [freeTradeState, freeTradeBump] = await getSellerFreeTradeState({
    auctionHouse,
    auctionHouseProgramId,
    merkleTree,
    assetId,
    wallet: sellerWallet,
  });

  return program.methods
    .sell(
      tradeBump,
      freeTradeBump,
      programAsSignerBump,
      buyPriceAdjusted,
      new BN(tokenSize),
    )
    .accounts({
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      authority,
      freeSellerTradeState: freeTradeState,
      masterEdition,
      assetId,
      metaplexTokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      programAsSigner,
      rent: SYSVAR_RENT_PUBKEY,
      sellerTradeState: tradeState,
      systemProgram: SystemProgram.programId,
      paymentAccount,
      treasuryMint,
      merkleTree,
      tokenProgram: TOKEN_PROGRAM_ID,
      wallet: sellerWallet,
      leafDataOwner
    })
    .instruction();
}