import * as anchor from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";

import {
  Umi,
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
  createNoopSigner,
  publicKeyBytes,
} from "@metaplex-foundation/umi";
import { VersionedTransaction } from "@solana/web3.js";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum, delegate } from "@metaplex-foundation/mpl-bubblegum";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

// constants
import {
  AUCTION_HOUSE,
  FEE_PAYER,
  TREASURY,
  auctionHouseAuthority,
} from "./utils/constants";

// utils
import { convertToTx, getUSDC, setupAirDrop } from "./utils/helper";
import SaleType from "./types/enum/SaleType";

// pdas
import findLastBidPrice from "./pdas/findLastBidPrice";
import findAuctionHouseProgramAsSigner from "./pdas/findAuctionHouseProgramAsSigner";

// instructions
import createLastBidPriceIx from "./instructions/createLastBidPriceIx";
import createBuyIx from "./instructions/createBuyIx";
import createSellIx from "./instructions/createSellIx";
import createCancelOfferIx from "./instructions/createCancelOfferIx";

export default class AuctionHouseSdk {
  private static instance: AuctionHouseSdk;

  // fields
  public umi: Umi;
  public mintAccount: anchor.web3.PublicKey;
  public auctionHouse: anchor.web3.PublicKey;
  public addressLookupTable: anchor.web3.PublicKey;
  public auctionHouseBump: number;

  public feeAccount: anchor.web3.PublicKey;
  public feeBump: number;

  public treasuryAccount: anchor.web3.PublicKey;
  public treasuryBump: number;

  constructor(
    public readonly program: anchor.Program<AuctionHouse>,
    private readonly provider: anchor.AnchorProvider
  ) {}

  getCustomUmi() {
    return this.umi;
  }

  static async getInstance(
    program: anchor.Program<AuctionHouse>,
    provider: anchor.AnchorProvider
  ) {
    if (!AuctionHouseSdk.instance) {
      AuctionHouseSdk.instance = new AuctionHouseSdk(program, provider);
      await AuctionHouseSdk.instance.setup();
    }

    return AuctionHouseSdk.instance;
  }

  private async setup() {
    const umi = createUmi(this.provider.connection.rpcEndpoint).use(
      mplBubblegum()
    );

    umi.use(
      signerIdentity(
        createSignerFromKeypair(umi, {
          secretKey: auctionHouseAuthority.secretKey,
          publicKey: publicKey(auctionHouseAuthority.publicKey),
        })
      )
    );

    this.umi = umi;

    await setupAirDrop(
      this.provider.connection,
      auctionHouseAuthority.publicKey
    );

    try {
      this.addressLookupTable = new anchor.web3.PublicKey(
        process.env.LOOKUP_TABLE_ADDRESS
      );
    } catch (err) {}

    this.mintAccount = await getUSDC(this.provider.connection, true);

    const [auctionHouse, auctionHouseBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(AUCTION_HOUSE),
          auctionHouseAuthority.publicKey.toBuffer(),
          this.mintAccount.toBuffer(),
        ],
        this.program.programId
      );

    this.auctionHouse = auctionHouse;
    this.auctionHouseBump = auctionHouseBump;

    const [feeAccount, feeBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from(AUCTION_HOUSE),
        this.auctionHouse.toBuffer(),
        Buffer.from(FEE_PAYER),
      ],
      this.program.programId
    );

    this.feeAccount = feeAccount;
    this.feeBump = feeBump;

    const [treasuryAccount, treasuryBump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(AUCTION_HOUSE),
          auctionHouse.toBuffer(),
          Buffer.from(TREASURY),
        ],
        this.program.programId
      );

    this.treasuryAccount = treasuryAccount;
    this.treasuryBump = treasuryBump;
  }

  public async sendTx(transaction: VersionedTransaction) {
    // implement address lookup table
    try {
      const txId = await this.provider.connection.sendTransaction(transaction);
      return txId;
    } catch (err) {
      throw err;
    }
  }

  public async buy(
    buyer: anchor.web3.PublicKey,
    assetId: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey,
    buyerAta: anchor.web3.PublicKey,
    price: number,
    leafIndex: number,
    saleType: SaleType
  ) {
    const [lastBidPrice] = findLastBidPrice(
      this.auctionHouse,
      assetId,
      this.program.programId
    );

    if ((await this.provider.connection.getAccountInfo(lastBidPrice)) == null) {
      const createBidIx = await createLastBidPriceIx(
        this.program,
        this.auctionHouse,
        assetId,
        lastBidPrice
      );

      const tx = await convertToTx(
        this.provider.connection,
        auctionHouseAuthority.publicKey,
        [createBidIx]
      );

      tx.sign([auctionHouseAuthority]);

      await this.sendTx(tx);
    }
    let lastBidInfo = await this.program.account.lastBidPrice.fetch(
      lastBidPrice
    );

    let buyIx = await createBuyIx(
      this.program,
      price,
      buyer,
      assetId,
      merkleTree,
      this.auctionHouse,
      this.mintAccount,
      lastBidInfo.bidder,
      lastBidPrice,
      buyerAta,
      this.feeAccount,
      leafIndex,
      saleType,
      this.program.programId
    );

    const tx = await convertToTx(this.provider.connection, buyer, [buyIx]);

    return tx;
  }

  // only called on offer types
  public async cancelOffer(
    buyer: anchor.web3.PublicKey,
    assetId: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey,
    buyerAta: anchor.web3.PublicKey,
    leafIndex: number
  ) {
    let cancelOfferIx = await createCancelOfferIx(
      this.program,
      buyer,
      assetId,
      merkleTree,
      this.auctionHouse,
      this.mintAccount,
      buyerAta,
      leafIndex,
      this.program.programId
    );

    const tx = await convertToTx(this.provider.connection, buyer, [
      cancelOfferIx,
    ]);

    return tx;
  }

  async sell(
    seller: anchor.web3.PublicKey,
    assetId: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey,
    price: number,
    saleType: SaleType
  ) {
    // check asset-id ownership?
    let saleIx = await createSellIx(
      this.program,
      this.umi,
      price,
      seller,
      assetId,
      merkleTree,
      this.auctionHouse,
      this.mintAccount,
      this.feeAccount,
      saleType,
      this.program.programId
    );

    const rpcAsset = await this.umi.rpc.getAsset(publicKey(assetId));
    const rpcAssetProof = await this.umi.rpc.getAssetProof(publicKey(assetId));

    const leafOwner = createNoopSigner(rpcAsset.ownership.owner);

    const [programSigner] = findAuctionHouseProgramAsSigner(
      this.program.programId
    );

    let umiTx = await delegate(this.umi, {
      leafOwner,
      previousLeafDelegate:
        rpcAsset.ownership.delegate ?? rpcAsset.ownership.owner,
      newLeafDelegate: publicKey(programSigner),
      merkleTree: rpcAssetProof.tree_id,
      root: publicKeyBytes(rpcAssetProof.root),
      dataHash: publicKeyBytes(rpcAsset.compression.data_hash),
      creatorHash: publicKeyBytes(rpcAsset.compression.creator_hash),
      nonce: rpcAsset.compression.leaf_id,
      index: rpcAssetProof.node_index - 2 ** rpcAssetProof.proof.length,
      proof: rpcAssetProof.proof,
    }).setLatestBlockhash(this.umi);

    let ix = umiTx.getInstructions();

    let delegateIxs = ix.map((el) => toWeb3JsInstruction(el));

    const tx = await convertToTx(this.provider.connection, seller, [
      saleIx,
      ...delegateIxs,
    ]);

    return tx;
  }
}
