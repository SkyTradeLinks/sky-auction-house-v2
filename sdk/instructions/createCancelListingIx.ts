import { AuctionHouse } from "../../target/types/auction_house";
import { Program } from "@coral-xyz/anchor";
import { getLeafData } from "../utils/helper";
import { auctionHouseAuthority } from "../utils/constants";
import findTradeState from "../pdas/findTradeState";
import { Umi } from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";

const createCancelListingIx = async (
  program: Program<AuctionHouse>,
  umi: Umi,
  seller: PublicKey,
  assetId: PublicKey,
  merkleTree: PublicKey,
  auctionHouse: PublicKey,
  mintAccount: PublicKey,
  feeAccount: PublicKey,
  auctionHouseProgramId: PublicKey
) => {
  const [tradeState, tradeStateBump] = findTradeState(
    auctionHouse,
    seller,
    assetId,
    mintAccount,
    merkleTree,
    auctionHouseProgramId
  );

  const leafData = await getLeafData(umi, assetId, seller);

  const ix = await program.methods
    .cancelV2(tradeStateBump, leafData)
    .accounts({
      wallet: seller,
      treasuryMint: mintAccount,
      assetId,
      authority: auctionHouseAuthority.publicKey,

      merkleTree,
      auctionHouse,
      auctionHouseFeeAccount: feeAccount,
      tradeState,

      leafDataOwner: leafData.owner,
    })
    .instruction();

  return ix;
};

export default createCancelListingIx;
