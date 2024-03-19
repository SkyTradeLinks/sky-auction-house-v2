import findEditionPda from "../program_shared/pdas/findEditionPda";
import { TOKEN_METADATA_PROGRAM_ID } from "../program_shared/constants/ProgramIds"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import getTradeState from "../auction_house/getTradeState";
import findAuctionHouseProgramAsSigner from "../pdas/findAuctionHouseProgramAsSigner";
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

export default async function auctionHouseCancelV2Ix(
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

  const [programAsSigner, programAsSignerBump] =
    findAuctionHouseProgramAsSigner(auctionHouseProgramId);
   const [masterEdition] = findEditionPda(treasuryMint);
  return program.methods
    .cancelV2(buyPriceAdjusted, new BN(tokenSize), programAsSignerBump)
    .accounts({
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      authority,
      masterEdition,
      metaplexTokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      programAsSigner,
      paymentAccount,
      treasuryMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      tradeState,
      merkleTree,
      wallet: sellerWallet,
      leafDataOwner,
      assetId,
    })
    .instruction();
}