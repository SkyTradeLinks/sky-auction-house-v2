import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../../target/types/auction_house";
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import {
  findLeafIndexFromAnchorTx,
  loadKeyPair,
  setupAirDrop,
  sleep,
  validateTx,
} from "../sdk/utils/helper";
import {
  Account,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  mintTo,
  transfer,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import { findLeafAssetIdPda, mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { Umi, generateSigner, publicKey } from "@metaplex-foundation/umi";
import SaleType from "../sdk/types/enum/SaleType";
``;

import assert from "assert";
import { join } from "path";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  createTree,
  getAssetWithProof,
} from "@metaplex-foundation/mpl-bubblegum";
import { none, sol, createSignerFromKeypair } from "@metaplex-foundation/umi";
import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/bs58";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

/* Import test variables */
import { leafIndex } from "./2-list_asset";

describe("bid-auction-house", async () => {
  console.log("Inside bid test file.....0;");
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;

  let auctionHouseSdk: AuctionHouseSdk;

  let bidderAta: Account;
  let ownerAta: Account;

  let umi: Umi;

  let merkleTree;
  let landTree;

  // let leafIndex;

  let asset_id;

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

    // G1LHrC8r71RUUvY9ARft9RaLYXvfBevt7TK3fVyvbNJv // merkleTree on devnet
    merkleTree = new anchor.web3.PublicKey(
      "G1LHrC8r71RUUvY9ARft9RaLYXvfBevt7TK3fVyvbNJv"
    );

    // rg9wieyjpQTZa1nqijpGdVUFYWiV1Qs24p4xrsoqJe8  //land tree on devnet
    landTree = new anchor.web3.PublicKey(
      "rg9wieyjpQTZa1nqijpGdVUFYWiV1Qs24p4xrsoqJe8"
    );
  });

  it("Place a bid on an asset", async () => {
    console.log("Place a bid...");
    console.log("Leaf---Index", leafIndex);
    let [assetId] = await findLeafAssetIdPda(umi, {
      merkleTree: publicKey(merkleTree),
      leafIndex,
    });
    // let bidder_acc_balanceB4 = await provider.connection.getTokenAccountBalance(
    //   bidderAta.address
    // );
    let bidderAccountInfo = await getAccount(
      provider.connection,
      bidderAta.address
    );

    // let initialAmtBidder = bidder_acc_balanceB4.value.uiAmount;
    console.log("Bidder usdc before sale:", bidderAccountInfo.amount);
    let ownerAccountInfo = await getAccount(
      provider.connection,
      ownerAta.address
    );
    // let owner_acc_balanceB4 = await provider.connection.getTokenAccountBalance(
    //   ownerAta.address
    // );

    // let initialAmtOwner = owner_acc_balanceB4.value.uiAmount;
    console.log("owner usdc before sale:", ownerAccountInfo.amount);

    let rpcAsset = await umi.rpc.getAsset(publicKey(assetId));
    console.log("Asset Owner before sale", rpcAsset.ownership.owner);

    try {
      const Bidtx = await auctionHouseSdk.buy(
        bidder.publicKey,
        new anchor.web3.PublicKey(assetId),
        new anchor.web3.PublicKey(merkleTree),
        1,
        leafIndex,
        SaleType.Auction
      );
      Bidtx.sign([bidder]);
      let BidtxSig = await auctionHouseSdk.sendTx(Bidtx);
      console.log("Bid TRANSACTION", BidtxSig);
    } catch (error) {
      console.error(error);
    }
  });
});
