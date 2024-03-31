import * as anchor from "@coral-xyz/anchor";
// import expect from "chai";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";
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
} from "@metaplex-foundation/mpl-bubblegum";

import { createAssociatedTokenAccount } from "@solana/spl-token";
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
} from "../sdk/utils/helper";
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import SaleType from "../sdk/types/enum/SaleType";
import {
  // createTree,
  fetchMerkleTree,
  mplBubblegum,
} from "@metaplex-foundation/mpl-bubblegum";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

describe("Sell test Auction", async () => {
  const endpoint =
    "https://devnet.helius-rpc.com/?api-key=887524e6-92b0-4f96-973c-b37a53a9cfe4";
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;
  const seller1 = Keypair.generate();

  // const landMerkleTree = new anchor.web3.PublicKey(
  //     "BQi6mDUZVwJvSV3PcWHTVFtP5jRgFDPNrqnTJYhv5c6B"
  // );
  const seller = new anchor.web3.PublicKey(
    "73ajJBDet2TbccHesc1CgHcMbDG83fafiy5iP3iGCEYL"
  );
  const imposter = Keypair.generate();
  console.log("Imposter", imposter.publicKey);

  let landMerkleTree;
  let auctionHouseSdk: AuctionHouseSdk;

  let asset_id;
  let umi: Umi;
  let leavesData = [];
  let accountsToPass = [];
  let owner;
  let assetWithProof;
  let tokenAccount;

  const customMerkleTree = loadKeyPair(process.env.MERKLE_TREE_KEYPAIR);

  const auctionHouseAuthority = loadKeyPair(
    process.env.AUCTION_HOUSE_AUTHORITY
  );

  before(async () => {
    // Setup airdrop
    const airdropSignature = await connection.requestAirdrop(
      seller1.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });
    const airdropSignature1 = await connection.requestAirdrop(
      imposter.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    const latestBlockHash1 = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash1.blockhash,
      lastValidBlockHeight: latestBlockHash1.lastValidBlockHeight,
      signature: airdropSignature1,
    });

    // Initialize Sdk
    auctionHouseSdk = await AuctionHouseSdk.getInstance(
      program,
      provider,
      auctionHouseAuthority
    );
    
    umi = auctionHouseSdk.getCustomUmi();

    try {
      await fetchMerkleTree(umi, publicKey(customMerkleTree.publicKey));
    } catch (err) {
      if (err.name == AccountNotFoundError.name) {
        await (
          await createTree(umi, {
            merkleTree: createSignerFromKeypair(umi, {
              secretKey: customMerkleTree.secretKey,
              publicKey: publicKey(customMerkleTree.publicKey),
            }),
            maxDepth: 14,
            maxBufferSize: 64,
            canopyDepth: 0,
          })
        ).sendAndConfirm(umi);
      } else {
        throw err;
      }
    }
  });

  it("should successfully mint rental token and sell", async () => {
    // const sig = await mintV1(umi, {
    //   leafOwner: publicKey(seller1.publicKey),
    //   merkleTree: publicKey(customMerkleTree.publicKey),
    //   metadata: {
    //     name: "Land NFT",
    //     symbol: "",
    //     uri: "",
    //     creators: [],
    //     sellerFeeBasisPoints: 0,
    //     primarySaleHappened: false,
    //     isMutable: false,
    //     editionNonce: null,
    //     uses: null,
    //     collection: null,
    //     tokenProgramVersion: TokenProgramVersion.Original,
    //     tokenStandard: TokenStandard.NonFungible,
    //   },
    // }).sendAndConfirm(umi);

    // let mintTxInfo;

    // let i = 0;

    // while (i < 6) {
    //   const tx0 = await umi.rpc.getTransaction(sig.signature, {
    //     commitment: "confirmed",
    //   });

    //   if (tx0 !== null) {
    //     mintTxInfo = tx0;
    //     break;
    //   }

    //   await sleep(1000 * i);

    //   i++;
    // }

    // let [leafIndex] = findLeafIndexFromAnchorTx(mintTxInfo);

    // let [assetId] = findLeafAssetIdPda(umi, {
    //   merkleTree: publicKey(customMerkleTree.publicKey),
    //   leafIndex: leafIndex,
    // });

    // const rpcAsset = await umi.rpc.getAsset(assetId);
    // const rpcAssetProof = await umi.rpc.getAssetProof(assetId);

    // console.log(rpcAsset);

    const treeConfig = await fetchTreeConfigFromSeeds(umi, {
      merkleTree: publicKey(customMerkleTree.publicKey),
    });

    console.log(treeConfig.treeCreator);

    console.log("Hey");

    // const leafOwner = createNoopSigner(rpcAsset.ownership.owner);

    // let umiTx = await delegate(umi, {
    //   leafOwner,
    //   previousLeafDelegate:
    //     rpcAsset.ownership.delegate ?? rpcAsset.ownership.owner,
    //   newLeafDelegate: publicKey(imposter.publicKey),
    //   merkleTree: rpcAssetProof.tree_id,
    //   root: publicKeyBytes(rpcAssetProof.root),
    //   dataHash: publicKeyBytes(rpcAsset.compression.data_hash),
    //   creatorHash: publicKeyBytes(rpcAsset.compression.creator_hash),
    //   nonce: rpcAsset.compression.leaf_id,
    //   index: rpcAssetProof.node_index - 2 ** rpcAssetProof.proof.length,
    //   proof: rpcAssetProof.proof,
    // }).setLatestBlockhash(umi);

    // let ix = umiTx.getInstructions();

    // let properIx = ix.map((el) => toWeb3JsInstruction(el));

    // const tx = await convertToTx(
    //   provider.connection,
    //   seller1.publicKey,
    //   properIx
    // );

    // tx.sign([seller1]);

    // await auctionHouseSdk.sendTx(tx);
  });

  // it("should fail if an imposter tries to sell", async () => {
  //   const seller2 = Keypair.generate();

  //   try {
  //     await auctionHouseSdk.sell(
  //       SaleType.Auction,
  //       true,
  //       new anchor.web3.PublicKey(asset_id),
  //       {
  //         priceInLamports: BUY_PRICE * LAMPORTS_PER_SOL,
  //         merkleTree: landMerkleTree,
  //         paymentAccount: tokenAccount,
  //         wallet: seller2.publicKey,
  //         leafDataOwner: leavesData[0].owner,
  //       },
  //       {
  //         tokenSize: 1,
  //       }
  //     );
  //     // If the above line didn't throw an error, fail the test
  //     // expect(true).toBe(false); // Ensure the test fails if the line above didn't throw an error
  //   } catch (error) {
  //     console.error();
  //     // Expect an error to be thrown
  //     // expect(error).toBeDefined();
  //     // Add additional assertions on the error if needed
  //   }
  // });
});
