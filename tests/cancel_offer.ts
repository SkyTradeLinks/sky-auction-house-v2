import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";
import { AuctionHouseSdk } from "../sdk/auction-house-sdk";
const {  PublicKey } = require('@solana/web3.js');
import {
  findAuctionHouseBidderEscrowAccount,
  loadKeyPair,
  setupAirDrop,
} from "../sdk/utils/helper";
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { auctionHouseAuthority } from "../sdk/utils/constants";
import { findLeafAssetIdPda } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey } from "@metaplex-foundation/umi";
import SaleType from "../sdk/types/enum/SaleType";
import "dotenv/config";
import { assert, expect } from "chai";

describe("cancel Offer", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;

  let auctionHouseSdk: AuctionHouseSdk;

  const bidder = loadKeyPair(process.env.BIDDER_KEYPAIR);

  let bidderAta;


  // land merkle tree
  const landMerkleTree = new anchor.web3.PublicKey(
    "BQi6mDUZVwJvSV3PcWHTVFtP5jRgFDPNrqnTJYhv5c6B"
  );
  let leafIndex = 1;
  async function getTokenBalanceWeb3(connection, tokenAccount) {
    const info = await connection.getTokenAccountBalance(tokenAccount);
    if (info.value.uiAmount == null) throw new Error('No balance found');
    console.log('Balance : ', info.value.uiAmount);
    return info.value.uiAmount;
}

  before(async () => {
    auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);

    // setup airdrop
/*     try {
      await setupAirDrop(provider.connection, bidder.publicKey);
    } catch (err) {}

    try {
      await setupAirDrop(provider.connection, auctionHouseSdk.feeAccount);
    } catch (err) {} */

    bidderAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      bidder,
      auctionHouseSdk.mintAccount,
      bidder.publicKey
    );

    // mint usdc
/*     await mintTo(
      provider.connection,
      bidder,
      auctionHouseSdk.mintAccount,
      bidderAta.address,
      auctionHouseAuthority,
      10 * Math.pow(10, 6)
    ); */
    
    const [assetId] = findLeafAssetIdPda(auctionHouseSdk.umi, {
      merkleTree: publicKey(landMerkleTree),
      leafIndex,
    });
    console.log('li',assetId)
    
    // USD
    let cost = 2;
    await auctionHouseSdk.buy(
      bidder,
     new anchor.web3.PublicKey(assetId.toString()),
     landMerkleTree,
     bidderAta.address,
     cost,
     leafIndex,
     SaleType.Offer 
   ); 
  });

  // airdrop
  // fund mint account with dev-usdc

  it("should cancel offer and return token for the asset", async () => {
    try {
      let leafIndex = 0;
      // dummy nft created
      const [assetId] = findLeafAssetIdPda(auctionHouseSdk.umi, {
        merkleTree: publicKey(landMerkleTree),
        leafIndex,
      });

      let acc = await getAssociatedTokenAddress(
        auctionHouseSdk.mintAccount,
        bidder.publicKey
      );

      let acc_balance = await provider.connection.getTokenAccountBalance(acc);

      console.log(acc_balance);

      const [escrowPaymentAccount, escrowBump] =
        findAuctionHouseBidderEscrowAccount(
          auctionHouseSdk.auctionHouse,
          bidder.publicKey,
          landMerkleTree,
          new anchor.web3.PublicKey(assetId.toString()),
          program.programId
        );

      console.log("es", escrowPaymentAccount);

      // USD
      let cost = 10;
      let con1=provider.connection;
      let ans1=await getTokenBalanceWeb3(con1, escrowPaymentAccount)
      console.log('prev bal',ans1)

      await auctionHouseSdk.cancel(
        bidder,
       new anchor.web3.PublicKey(assetId.toString()),
       landMerkleTree,
       bidderAta.address,
       cost,
       leafIndex,
       SaleType.Offer 
      );

      console.log("es", escrowPaymentAccount);

      
       let ans=await provider.connection.getTokenAccountBalance(escrowPaymentAccount)
       console.log(ans.value.uiAmount)
       
       //assert(expect(ans.value.uiAmount).to.equal(0))
/*       let ans2=await getTokenBalanceWeb3(con1, escrowPaymentAccount)
      console.log('new bal',ans2) */
        /* const [lastBidPrice] = auctionHouseSdk.findLastBidPrice(assetId);
      let lastBidInfo = await auctionHouseSdk.program.account.lastBidPrice.fetch(
        lastBidPrice
      );
      

       console.log(lastBidInfo); */
    } catch (err: any) {
      console.log(err);
    }
  });
});
