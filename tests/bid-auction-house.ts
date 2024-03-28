import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";
import { AuctionHouseSdk } from "../sdk/auction-house-sdk";
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

describe("bid-auction-house", async () => {
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

  before(async () => {
    auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);

    // setup airdrop
    try {
      await setupAirDrop(provider.connection, bidder.publicKey);
    } catch (err) {}

    try {
      await setupAirDrop(provider.connection, auctionHouseSdk.feeAccount);
    } catch (err) {}

    bidderAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      bidder,
      auctionHouseSdk.mintAccount,
      bidder.publicKey
    );

    // mint usdc
    await mintTo(
      provider.connection,
      bidder,
      auctionHouseSdk.mintAccount,
      bidderAta.address,
      auctionHouseAuthority,
      10 * Math.pow(10, 6)
    );
  });

  // airdrop
  // fund mint account with dev-usdc

  it("should make an offer on un-listed asset", async () => {
    try {
      let leafIndex = 5;
      // dummy nft created
      const [assetId] = findLeafAssetIdPda(auctionHouseSdk.umi, {
        merkleTree: publicKey(landMerkleTree),
        leafIndex,
      });

      // USD
      let cost = 7;

      await auctionHouseSdk.buy(
        bidder,
        new anchor.web3.PublicKey(assetId.toString()),
        landMerkleTree,
        bidderAta.address,
        cost,
        leafIndex,
        SaleType.Offer
      );

      const [escrowPaymentAccount, escrowBump] =
        findAuctionHouseBidderEscrowAccount(
          auctionHouseSdk.auctionHouse,
          bidder.publicKey,
          landMerkleTree,
          new anchor.web3.PublicKey(assetId.toString()),
          program.programId
        );

      let acc = await getAssociatedTokenAddress(
        auctionHouseSdk.mintAccount,
        bidder.publicKey
      );

      let acc_balance = await provider.connection.getTokenAccountBalance(acc);

      console.log(acc_balance);
      console.log('es',escrowPaymentAccount)

      // // console.log(
      // //   await this.provider.connection.getBalance(escrowPaymentAccount)
      // // );
      
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
