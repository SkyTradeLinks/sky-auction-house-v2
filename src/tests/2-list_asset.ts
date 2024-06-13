import * as anchor from "@coral-xyz/anchor";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../../target/types/auction_house";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  Umi,
  generateSigner,
  signerIdentity,
  createSignerFromKeypair,
  publicKey,
  AccountNotFoundError,
  createNoopSigner,
  publicKeyBytes,
} from "@metaplex-foundation/umi";
import {
  mintV1,
  createTree,
  findLeafAssetIdPda,
  getAssetWithProof,
  TokenProgramVersion,
  TokenStandard,
  getMetadataArgsSerializer,
  delegate,
  fetchTreeConfigFromSeeds,
  transfer,
} from "@metaplex-foundation/mpl-bubblegum";

import { getOrCreateAssociatedTokenAccount, Account } from "@solana/spl-token";
import {
  SYSVAR_RENT_PUBKEY,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionMessage,
} from "@solana/web3.js";

import {
  loadKeyPair,
  sleep,
  findLeafIndexFromAnchorTx,
  convertToTx,
  validateTx,
} from "../sdk/utils/helper";
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import SaleType from "../sdk/types/enum/SaleType";

import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { join } from "path";

let leafIndex;
let asset_id;
describe("List Asset for aucion", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;

  const imposter = Keypair.generate();
  console.log("Imposter", imposter.publicKey);

  let landMerkleTree;
  let auctionHouseSdk: AuctionHouseSdk;

  let ownerAta: Account;
  let umi: Umi;

  let collectionMint = publicKey(
    "GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh"
  );

  /* Fund below wallets with sol. faucet: https://faucet.solana.com/ */

  // DiW5MWFjPR3AeVd28ChEhsGb96efhHwst9eYwy8YdWEf
  const auctionHouseAuthority = loadKeyPair(
    join(__dirname, "keys", "auctionHouseAuthority.json")
  );

  // GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh
  const bidder = loadKeyPair(join(__dirname, "keys", "bidder.json"));

  // DQikrsLze2cUEdgqTM9vngcJZwMdD12sfwYZeGor5cva
  const owner = loadKeyPair(join(__dirname, "keys", "owner.json"));

  // G1LHrC8r71RUUvY9ARft9RaLYXvfBevt7TK3fVyvbNJv // merkleTree on devnet
  let merkleTree = new anchor.web3.PublicKey(
    "G1LHrC8r71RUUvY9ARft9RaLYXvfBevt7TK3fVyvbNJv"
  );

  before(async () => {
    // Initialize Sdk
    auctionHouseSdk = await AuctionHouseSdk.getInstance(
      program,
      provider,
      auctionHouseAuthority
    );
    await sleep(1000);
    ownerAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      owner,
      auctionHouseSdk.mintAccount,
      owner.publicKey
    );

    umi = auctionHouseSdk.getCustomUmi();
  });

  it("list an nft for auction", async () => {
    const assetOwner = owner.publicKey;

    // Mint New Asset for owner to list for auction
    let sx = await mintV1(umi, {
      leafOwner: fromWeb3JsPublicKey(assetOwner),
      merkleTree: publicKey(merkleTree),
      metadata: {
        name: "My Compressed NFT",
        uri: "https://example.com/my-cnft.json",
        sellerFeeBasisPoints: 500, // 5%
        collection: { key: collectionMint, verified: false },
        creators: [
          { address: umi.identity.publicKey, verified: false, share: 100 },
        ],
      },
    }).sendAndConfirm(umi);
    // console.log("Rental Mint Successfull!!");

    let mintTxInfo = await validateTx(umi, sx.signature);
    [leafIndex] = await findLeafIndexFromAnchorTx(mintTxInfo);
    console.log("leaf_Index:", leafIndex);
    try {
      let [assetId] = await findLeafAssetIdPda(umi, {
        merkleTree: publicKey(merkleTree),
        leafIndex,
      });
      asset_id = assetId;
      console.log("Asset_ID:", asset_id);

      const rpcAsset = await umi.rpc.getAsset(assetId);
      console.log("Asset Here", rpcAsset.authorities);

      // USD
      let cost = 1;
      const [saleTx, delegateTx] = await auctionHouseSdk.sell(
        owner.publicKey,
        new anchor.web3.PublicKey(asset_id),
        merkleTree,
        cost,
        SaleType.Auction
      );
      await saleTx.sign([owner]);
      await delegateTx.sign([owner]);

      await auctionHouseSdk.sendTx(saleTx);
      await auctionHouseSdk.sendTx(delegateTx);

      // await validateTx(umi, decode(signature));
      let acc_balance_after = await provider.connection.getTokenAccountBalance(
        ownerAta.address
      );

      console.log(
        "Owner usdc balance after listing:",
        acc_balance_after.value.uiAmount
      );
    } catch (error) {
      console.log("Error 154...", error);
    }

    // assert.equal(
    //   initialAmt - 1,
    //   (await provider.connection.getTokenAccountBalance(bidderAta.address))
    //     .value.uiAmount
    // );
  });

  // it("prevent transfer when asset is listed", async () => {
  //   const rpcAsset = await umi.rpc.getAsset(publicKey(asset_id));
  //   const rpcAssetProof = await umi.rpc.getAssetProof(publicKey(asset_id));
  //   // console.log("RPC ASSET", rpcAssetProof);

  //   const leafDelegate = createNoopSigner(rpcAsset.ownership.delegate);
  //   console.log(leafDelegate);
  //   // console.log("ASSET_OWNER.....", rpcAsset.ownership.owner);
  //   // console.log("NEW_ASSET_OWNER.....", newOwner);

  //   let umiTx = await transfer(umi, {
  //     leafOwner: rpcAsset.ownership.owner,
  //     leafDelegate: publicKey("GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh"),
  //     newLeafOwner: publicKey("GfWx2S4L1DJdxyC5mqf7BLSabbUJDvFgScxHmjYu9awh"),
  //     merkleTree: rpcAssetProof.tree_id,
  //     root: publicKeyBytes(rpcAssetProof.root),
  //     dataHash: publicKeyBytes(rpcAsset.compression.data_hash),
  //     creatorHash: publicKeyBytes(rpcAsset.compression.creator_hash),
  //     nonce: rpcAsset.compression.leaf_id,
  //     index: rpcAssetProof.node_index - 2 ** rpcAssetProof.proof.length,
  //     // index: rpcAssetProof.node_index,
  //     proof: rpcAssetProof.proof,
  //   }).setLatestBlockhash(umi);

  //   let ix = umiTx.getInstructions();
  //   // console.log(ix);

  //   let transferIx = ix.map((el) => toWeb3JsInstruction(el));

  //   let tx = await await convertToTx(provider.connection, owner.publicKey, [
  //     transferIx,
  //   ]);
  //   tx.sign([owner]);

  //   await auctionHouseSdk.sendTx(tx);
  // });
});

export { leafIndex, asset_id };
