import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";
import AuctionHouseSdk from "./../sdk/auction-house-sdk";
import {
  findLeafIndexFromAnchorTx,
  loadKeyPair,
  setupAirDrop,
  validateTx,
} from "../sdk/utils/helper";
import {
  Account,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

import { findLeafAssetIdPda, mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import { Umi, generateSigner, publicKey } from "@metaplex-foundation/umi";
import SaleType from "../sdk/types/enum/SaleType";

import assert from "assert";
import { join } from "path";
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { none, sol } from "@metaplex-foundation/umi";
import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/bs58";

describe("bid-auction-house", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;

  let auctionHouseSdk: AuctionHouseSdk;

  let bidderAta: Account;

  let umi: Umi;

  let merkleTree;

  let leafIndex;

  const auctionHouseAuthority = loadKeyPair(
    join(__dirname, "keys", "auctionHouseAuthority.json")
  );

  const bidder = anchor.web3.Keypair.generate();

  const owner = anchor.web3.Keypair.generate();

  before(async () => {
    auctionHouseSdk = AuctionHouseSdk.getInstance(
      program,
      provider,
      auctionHouseAuthority,
      true
    );

    umi = auctionHouseSdk.getCustomUmi();

    await umi.rpc.airdrop(
      fromWeb3JsPublicKey(auctionHouseAuthority.publicKey),
      sol(1)
    );

    await setupAirDrop(provider.connection, bidder.publicKey);
    await setupAirDrop(provider.connection, auctionHouseSdk.feeAccount);

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

    merkleTree = generateSigner(umi);

    const builder = await createTree(umi, {
      merkleTree,
      maxDepth: 14,
      maxBufferSize: 64,
    });

    await builder.sendAndConfirm(umi);

    let sx = await mintV1(umi, {
      leafOwner: fromWeb3JsPublicKey(owner.publicKey),
      merkleTree,
      metadata: {
        name: "My Compressed NFT",
        uri: "https://example.com/my-cnft.json",
        sellerFeeBasisPoints: 500, // 5%
        collection: none(),
        creators: [
          { address: umi.identity.publicKey, verified: false, share: 100 },
        ],
      },
    }).sendAndConfirm(umi);

    let mintTxInfo = await validateTx(umi, sx.signature);

    [leafIndex] = findLeafIndexFromAnchorTx(mintTxInfo);
  });

  it("should make an offer on un-listed asset", async () => {
    const [assetId] = findLeafAssetIdPda(umi, {
      merkleTree: publicKey(merkleTree),
      leafIndex,
    });

    let acc_balance = await provider.connection.getTokenAccountBalance(
      bidderAta.address
    );

    let initialAmt = acc_balance.value.uiAmount;

    // USD
    let cost = 5;
    const tx = await auctionHouseSdk.buy(
      bidder.publicKey,
      toWeb3JsPublicKey(assetId),
      toWeb3JsPublicKey(merkleTree.publicKey),
      cost,
      leafIndex,
      SaleType.Offer
    );
    tx.sign([bidder]);

    let signature = await auctionHouseSdk.sendTx(tx);

    await validateTx(umi, decode(signature));

    assert.equal(
      initialAmt - 5,
      (await provider.connection.getTokenAccountBalance(bidderAta.address))
        .value.uiAmount
    );
  });

  it("should accept and transfer the nft", () => {
    
  })
});
