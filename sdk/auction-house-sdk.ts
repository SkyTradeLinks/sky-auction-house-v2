import * as anchor from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";

import {
  Umi,
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import {
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplBubblegum,
  fetchTreeConfigFromSeeds,
} from "@metaplex-foundation/mpl-bubblegum";

// constants
import {
  AUCTION_HOUSE,
  FEE_PAYER,
  TREASURY,
  // auctionHouseAuthority,
} from "./utils/constants";

// utils
import { convertToTx, getUSDC, setupAirDrop } from "./utils/helper";
import SaleType from "./types/enum/SaleType";

// pdas
import findLastBidPrice from "./pdas/findLastBidPrice";

// instructions
import createLastBidPriceIx from "./instructions/createLastBidPriceIx";
import createBuyIx from "./instructions/createBuyIx";
import createSellIx from "./instructions/createSellIx";
import createCancelOfferIx from "./instructions/createCancelOfferIx";
import createCancelListingIx from "./instructions/createCancelListingIx";
import transferNftDelegateIx from "./instructions/transferNftDelegateIx";
import createExecuteSaleIx from "./instructions/createExecuteSaleIx";
import transferNftIx from "./instructions/transferNftIx";

export default class AuctionHouseSdk {
  private static instance: AuctionHouseSdk;

  private auctionHouseAuthority: Keypair;

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
    provider: anchor.AnchorProvider,
    auctionHouseAuthority: Keypair,
    testMode: boolean = false
  ) {
    if (!AuctionHouseSdk.instance) {
      AuctionHouseSdk.instance = new AuctionHouseSdk(program, provider);
      await AuctionHouseSdk.instance.setup(auctionHouseAuthority, testMode);
    }

    return AuctionHouseSdk.instance;
  }

  private async setup(
    auctionHouseAuthority: Keypair,
    testMode: boolean = false
  ) {
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

    this.mintAccount = await getUSDC(this.provider.connection, testMode);

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

    this.auctionHouseAuthority = auctionHouseAuthority;
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
        this.auctionHouseAuthority.publicKey,
        lastBidPrice
      );

      const tx = await convertToTx(
        this.provider.connection,
        this.auctionHouseAuthority.publicKey,
        [createBidIx]
      );

      tx.sign([this.auctionHouseAuthority]);

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
      this.feeAccount,
      this.auctionHouseAuthority.publicKey,
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
      this.auctionHouseAuthority.publicKey,
      leafIndex,
      this.program.programId
    );

    const tx = await convertToTx(this.provider.connection, buyer, [
      cancelOfferIx,
    ]);

    return tx;
  }

  public async sell(
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
      this.auctionHouseAuthority.publicKey,
      saleType,
      this.program.programId
    );

    let delegateIxs = await transferNftDelegateIx(
      this.umi,
      assetId,
      this.auctionHouseAuthority.publicKey
    );

    const saleTx = await convertToTx(this.provider.connection, seller, [
      saleIx,
    ]);

    const delegateTx = await convertToTx(
      this.provider.connection,
      seller,
      delegateIxs
    );

    return [saleTx, delegateTx];
  }

  async cancelListing(
    seller: anchor.web3.PublicKey,
    assetId: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey
  ) {
    let cancelIx = await createCancelListingIx(
      this.program,
      this.umi,
      seller,
      assetId,
      merkleTree,
      this.auctionHouse,
      this.mintAccount,
      this.feeAccount,
      this.auctionHouseAuthority.publicKey,
      this.program.programId
    );

    const treeConfig = await fetchTreeConfigFromSeeds(this.umi, {
      merkleTree: publicKey(merkleTree),
    });

    // set delegate back to tree delegate
    let delegateIxs = await transferNftDelegateIx(
      this.umi,
      assetId,
      new PublicKey(treeConfig.treeDelegate)
    );

    const cancelTx = await convertToTx(this.provider.connection, seller, [
      cancelIx,
    ]);

    const delegateTx = await convertToTx(
      this.provider.connection,
      seller,
      delegateIxs
    );

    return [cancelTx, delegateTx];
  }

  public async createExecuteSaleIx(
    buyer: anchor.web3.PublicKey,
    assetId: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey,
    seller: anchor.web3.PublicKey,
    signer: anchor.web3.PublicKey
  ) {
    let executeSaleIx = await createExecuteSaleIx(
      this.program,
      this.umi,
      buyer,
      assetId,
      merkleTree,
      seller,
      this.auctionHouse,
      this.mintAccount,
      this.feeAccount,
      this.treasuryAccount,
      this.auctionHouseAuthority.publicKey,
      this.program.programId
    );

    // change to include either auction house / seller
    const tx = await convertToTx(this.provider.connection, signer, [
      executeSaleIx,
    ]);

    return tx;
  }

  public async sendExecuteSaleTx(
    transaction: VersionedTransaction,
    assetId: PublicKey,
    buyer: PublicKey
  ) {
    // transaction must be signed
    await this.sendTx(transaction);

    // get transfer nft
    let transferIx = await transferNftIx(this.umi, assetId, buyer);

    const transferTx = await convertToTx(
      this.provider.connection,
      this.feeAccount,
      [...transferIx]
    );

    transferTx.sign([this.auctionHouseAuthority]);

    return await this.sendTx(transferTx);
  }
}
