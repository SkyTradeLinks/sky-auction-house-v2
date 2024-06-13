import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../../../target/types/auction_house";

const createLastBidPriceIx = async (
  program: Program<AuctionHouse>,
  auctionHouse: PublicKey,
  assetId: PublicKey,
  auctionHouseAuthority: PublicKey,
  lastBidPrice: PublicKey
) => {
  const ix = await program.methods
    .createLastBidPrice()
    .accounts({
      systemProgram: SystemProgram.programId,
      wallet: auctionHouseAuthority,
      lastBidPrice,
      auctionHouse: auctionHouse,
      assetId,
    })
    .instruction();

  return ix;
};

export default createLastBidPriceIx;
