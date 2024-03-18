import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Signer
} from "@solana/web3.js";
import findLastBidPrice from "../pdas/findLastBidPrice";
import AuctionHouseProgram from "../types/AuctionHouseProgram";

type Accounts = {
  auctionHouse: PublicKey;
  auctionHouseProgramId: PublicKey;
  program: AuctionHouseProgram;
  treasuryMint: PublicKey;
  wallet: PublicKey;
};

export default async function auctionHouseCreateLastBidPriceIx({
  program,
  wallet,
  treasuryMint,
  auctionHouse,
  auctionHouseProgramId,
}: Accounts): Promise<TransactionInstruction> {
  const [lastBidPrice] = findLastBidPrice(treasuryMint, auctionHouseProgramId, auctionHouse);

  return program.methods
    .createLastBidPrice()
    .accounts({
      auctionHouse,
      lastBidPrice,
      systemProgram: SystemProgram.programId,
      treasuryMint,
      wallet: wallet,
    })
    .instruction();
}