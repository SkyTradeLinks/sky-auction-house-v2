import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { SYSVAR_RENT_PUBKEY,} from "@solana/web3.js";

import { auctionHouseAuthority, BUY_PRICE } from "../sdk/utils/constants";
import AuctionHouseSdk from "../sdk/auction-house-sdk";




describe("create-auction-house", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;


  let auctionHouseSdk: AuctionHouseSdk;

  before(async () => {
    auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);
   
  });

  // 1% goes to authority
  const listingFeePercent = (1 / 100) * 100;
  const subsequentListingFeePercent = (1 / 100) * 100;
  
  const requiresSignOff = true;
  const canChangeSalePrice = false;
  const payAllFees = true;
  

  it("should not fetch auction house", async () => {
    // will pass if it exists as it's on devnet
    try {

      } catch (err: any) {
      if (err.message.includes("does not exist")) {
        // passes
        return;
      }

      throw err;
    }
  });

  it("should create auction house if it doesn't exist", async () => {
    try {
      await program.account.auctionHouse.fetch(auctionHouseSdk.auctionHouse);
    } catch (err: any) {
      if (err.message.includes("does not exist")) {
        const withdrawalDestinationAta = await getAssociatedTokenAddress(
          auctionHouseSdk.mintAccount,
          auctionHouseAuthority.publicKey,
        );


        await program.methods
          .createAuctionHouse(
            auctionHouseSdk.auctionHouseBump,
            auctionHouseSdk.feeBump,
            auctionHouseSdk.treasuryBump,
            listingFeePercent,
            requiresSignOff,
            canChangeSalePrice,
            subsequentListingFeePercent,
            payAllFees
          )
          .accounts({
            treasuryMint: auctionHouseSdk.mintAccount,
            payer: auctionHouseAuthority.publicKey,
            authority: auctionHouseAuthority.publicKey,

            feeWithdrawalDestination: auctionHouseAuthority.publicKey,
            treasuryWithdrawalDestination: withdrawalDestinationAta,
            treasuryWithdrawalDestinationOwner: auctionHouseAuthority.publicKey,

            auctionHouse: auctionHouseSdk.auctionHouse,
            auctionHouseFeeAccount: auctionHouseSdk.feeAccount,

            auctionHouseTreasury: auctionHouseSdk.treasuryAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([auctionHouseAuthority])
          .rpc();
        return;
      }

      throw err;
    }
  });
});
