import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../../target/types/auction_house";
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import { loadKeyPair, sleep } from "../sdk/utils/helper";
import {
  Account,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddressSync,
  getAccount,
} from "@solana/spl-token";

import { Umi, publicKey } from "@metaplex-foundation/umi";
import { join } from "path";

import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import assert from "assert";

/* Import test variables */
import { leafIndex, asset_id } from "./2-list_asset";

describe("bid-auction-house", async () => {
  console.log("Inside execute sale test file.....0;");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;

  let auctionHouseSdk: AuctionHouseSdk;

  let bidderAta: Account;
  let ownerAta: Account;
  let feeAta;

  let umi: Umi;

  let merkleTree;
  let landTree;

  // let leafIndex;

  // DiW5MWFjPR3AeVd28ChEhsGb96efhHwst9eYwy8YdWEf
  const auctionHouseAuthority = loadKeyPair(
    join(__dirname, "keys", "auctionHouseAuthority.json")
  );

  // GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh
  const bidder = loadKeyPair(join(__dirname, "keys", "bidder.json"));

  // DQikrsLze2cUEdgqTM9vngcJZwMdD12sfwYZeGor5cva
  const owner = loadKeyPair(join(__dirname, "keys", "owner.json"));

  before(async () => {
    console.log("Inside bid test file.....;", leafIndex);
    auctionHouseSdk = AuctionHouseSdk.getInstance(
      program,
      provider,
      auctionHouseAuthority,
      true
    );
    await auctionHouseSdk.setup();
    umi = auctionHouseSdk.getCustomUmi();

    // // await setupAirDrop(provider.connection, bidder.publicKey);
    // // await setupAirDrop(provider.connection, auctionHouseSdk.feeAccount);
    // // transfer sol to AH fee account
    // Set the transfer amount (in SOL)
    const amount = 0.01; // 1 SOL
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: auctionHouseAuthority.publicKey,
        toPubkey: auctionHouseSdk.feeAccount,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Send and confirm the transaction
    await sendAndConfirmTransaction(provider.connection, transaction, [
      auctionHouseAuthority,
    ]);
    // console.log("FEE_ACCOUNT", auctionHouseSdk.feeAccount);
    // console.log("Auction_HOUSE", auctionHouseSdk.auctionHouse);
    // console.log("Mint Account", auctionHouseSdk.mintAccount);

    feeAta = await getAssociatedTokenAddressSync(
      auctionHouseSdk.mintAccount,
      auctionHouseAuthority.publicKey,
      true
    );

    bidderAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      bidder,
      auctionHouseSdk.mintAccount,
      bidder.publicKey
    );
    // console.log("bidderAta", bidderAta.address);

    ownerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      owner,
      auctionHouseSdk.mintAccount,
      owner.publicKey
    );
    console.log("Owner ATA", ownerAta.address);

    // G1LHrC8r71RUUvY9ARft9RaLYXvfBevt7TK3fVyvbNJv // merkleTree on devnet
    merkleTree = new anchor.web3.PublicKey(
      "G1LHrC8r71RUUvY9ARft9RaLYXvfBevt7TK3fVyvbNJv"
    );

    // rg9wieyjpQTZa1nqijpGdVUFYWiV1Qs24p4xrsoqJe8  //land tree on devnet
    landTree = new anchor.web3.PublicKey(
      "rg9wieyjpQTZa1nqijpGdVUFYWiV1Qs24p4xrsoqJe8"
    );
  });

  it("Execute an Auction sale to the successful bidder", async () => {
    console.log("Asset_Id....1:", asset_id);
    console.log("Place a bid...");
    console.log("Leaf---Index", leafIndex);

    let feeAccountInfoB4 = await getAccount(provider.connection, feeAta);
    console.log("fee account usdc before sale:", feeAccountInfoB4.amount);

    let bidderAccountInfoB4 = await getAccount(
      provider.connection,
      bidderAta.address
    );

    // let initialAmtBidder = bidder_acc_balanceB4.value.uiAmount;
    console.log("Bidder usdc before sale:", bidderAccountInfoB4.amount);
    let ownerAccountInfoB4 = await getAccount(
      provider.connection,
      ownerAta.address
    );

    console.log("owner usdc before sale:", ownerAccountInfoB4.amount);

    let rpcAsset = await umi.rpc.getAsset(publicKey(asset_id));
    console.log("Asset Owner before sale", rpcAsset.ownership.owner);
    try {
      let ix;
      try {
        // create execute Sale Instruction
        ix = await auctionHouseSdk.createExecuteSaleIx(
          bidder.publicKey,
          new anchor.web3.PublicKey(asset_id),
          merkleTree,
          owner.publicKey,
          auctionHouseAuthority.publicKey
        );
        ix.sign([auctionHouseAuthority]);

        console.log(" Execute sale submitted successfully");
      } catch (error) {
        console.log("Execute sale error", error);
      }
      try {
        const tx = await auctionHouseSdk.sendExecuteSaleTx(
          ix,
          new anchor.web3.PublicKey(asset_id),
          bidder.publicKey
        );
        console.log("Execute sale successful...:", tx);
        await sleep(1000);
        rpcAsset = await umi.rpc.getAsset(publicKey(asset_id));
        console.log("Asset Owner after sale", rpcAsset.ownership.owner);
        // const rpcAssetList = await umi.rpc.getAssetsByOwner({
        //   owner: publicKey("GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh"),
        // });
        // console.log("Bidder RPC ASSET LIST:", rpcAssetList);

        let bidderAccountInfo = await getAccount(
          provider.connection,
          bidderAta.address
        );

        console.log("Bidder usdc after sale:", bidderAccountInfo.amount);

        let ownerAccountInfo = await getAccount(
          provider.connection,
          ownerAta.address
        );
        console.log("owner usdc after sale:", ownerAccountInfo.amount);
        let feeAccountInfo = await getAccount(provider.connection, feeAta);
        console.log("fee account usdc after sale:", feeAccountInfo.amount);
        const ownerAmount = parseFloat(ownerAccountInfo.amount.toString());
        const ownerAmountB4 = parseFloat(ownerAccountInfoB4.amount.toString());
        const bidderAmount = parseFloat(bidderAccountInfo.amount.toString());
        const bidderAmountB4 = parseFloat(
          bidderAccountInfoB4.amount.toString()
        );
        console.log(ownerAmount);
        console.log(ownerAmountB4);
        console.log(bidderAmount);
        console.log(bidderAmountB4);

        assert.ok(ownerAmount > ownerAmountB4);
        // assert.ok(bidderAmount > bidderAmountB4);
      } catch (error) {
        console.log("Failed to execute sale", error);
      }
    } catch (error) {
      console.log("Erroe ....123", error);
    }
  });
});
