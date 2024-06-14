import * as anchor from "@coral-xyz/anchor";
import { AuctionHouse } from "../../target/types/auction_house";

import {
  Umi,
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { Keypair, PublicKey, VersionedTransaction } from "@solana/web3.js";

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
import { convertToTx, validateTx } from "./utils/helper";
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
import { createMint } from "@solana/spl-token";
import { decode } from "@coral-xyz/anchor/dist/cjs/utils/bytes/bs58";
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
export default class AuctionHouseSdk {
  private static instance: AuctionHouseSdk;

  // fields
  private umi: Umi;
  public mintAccount: anchor.web3.PublicKey;
  public auctionHouse: anchor.web3.PublicKey;
  public auctionHouseBump: number;

  public feeAccount: anchor.web3.PublicKey;
  public feeBump: number;

  public treasuryAccount: anchor.web3.PublicKey;
  public treasuryBump: number;

  private isInitialized: boolean = false;

  constructor(
    public readonly program: anchor.Program<AuctionHouse>,
    private readonly provider: anchor.AnchorProvider,
    private readonly auctionHouseAuthority: Keypair,
    private readonly testMode: boolean = false
  ) {}

  getCustomUmi() {
    return this.umi;
  }

  private async getUSDC(test_flag = false) {
    if (test_flag) {
      const mint = await createMint(
        this.provider.connection,
        this.auctionHouseAuthority,
        this.auctionHouseAuthority.publicKey,
        this.auctionHouseAuthority.publicKey,
        6
      );

      return mint;
    } else {
      if (this.provider.connection.rpcEndpoint.includes("mainnet")) {
        return new anchor.web3.PublicKey(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        );
      } else {
        // devnet | testnet
        return new anchor.web3.PublicKey(
          // "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
          "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        );
      }
    }
  }

  static getInstance(
    program: anchor.Program<AuctionHouse>,
    provider: anchor.AnchorProvider,
    auctionHouseAuthority: Keypair,
    testMode: boolean = false
  ) {
    if (!AuctionHouseSdk.instance) {
      AuctionHouseSdk.instance = new AuctionHouseSdk(
        program,
        provider,
        auctionHouseAuthority,
        testMode
      );
    }

    return AuctionHouseSdk.instance;
  }

  public async setup() {
    if (!this.isInitialized) {
      const umi = createUmi(this.provider.connection.rpcEndpoint).use(
        mplBubblegum()
      );

      umi.use(
        signerIdentity(
          createSignerFromKeypair(umi, {
            secretKey: this.auctionHouseAuthority.secretKey,
            publicKey: publicKey(this.auctionHouseAuthority.publicKey),
          })
        )
      );

      this.umi = umi;

      // this.mintAccount = await this.getUSDC(this.testMode);
      this.mintAccount = new anchor.web3.PublicKey(
        "6Gx9MoFfEGSYWnjXFKtMcL8MiDgkCLAFW5KARVRJwaQh"
      );

      const [auctionHouse, auctionHouseBump] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from(AUCTION_HOUSE),
            this.auctionHouseAuthority.publicKey.toBuffer(),
            this.mintAccount.toBuffer(),
          ],
          this.program.programId
        );

      this.auctionHouse = auctionHouse;
      this.auctionHouseBump = auctionHouseBump;

      const [feeAccount, feeBump] =
        anchor.web3.PublicKey.findProgramAddressSync(
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

      this.isInitialized = true;
    }
  }

  public async sendTx(transaction: VersionedTransaction) {
    await this.setup();
    // implement address lookup table
    // console.log("Sending Transaction....");
    try {
      const txId = await this.provider.connection.sendTransaction(transaction);
      // const txId = await sendAndConfirmTransaction(transaction);

      // console.log("txId:", txId);
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
    await this.setup();

    const [lastBidPrice] = findLastBidPrice(
      this.auctionHouse,
      assetId,
      this.program.programId
    );
    // console.log("Last bid acct info", lastBidPrice);

    let lastBidAccInfo;

    try {
      lastBidAccInfo = await this.provider.connection.getAccountInfo(
        lastBidPrice
      );
      // console.log("Last bid acct info 1", lastBidAccInfo);
    } catch (err) {
      console.log("eRROR HERE..........", err);
      if (err.message.includes("does not exist")) {
        lastBidAccInfo = null;
      } else {
        throw err;
      }
    }

    if (lastBidAccInfo == null) {
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

      let txId = await this.sendTx(tx);
      // console.log("last bid tx", txId);

      await validateTx(this.umi, decode(txId));
    }

    let lastBidInfo = await this.program.account.lastBidPrice.fetch(
      lastBidPrice
    );
    // console.log("Last bid acct info 2", lastBidInfo);

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
    // const tx = buyIx;
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
    await this.setup();

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
    await this.setup();

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
    await this.setup();

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
    await this.setup();

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
    // console.log("Executesale instruction", executeSaleIx);

    // change to include either auction house / seller
    const tx = await convertToTx(this.provider.connection, signer, [
      executeSaleIx,
    ]);
    // const tx = new Transaction().add(executeSaleIx);

    return tx;
  }

  public async sendExecuteSaleTx(
    transaction: VersionedTransaction,
    assetId: PublicKey,
    buyer: PublicKey
  ) {
    await this.setup();

    // transaction must be signed
    await this.sendTx(transaction);
    console.log("Trransaction sent...");

    // get transfer nft
    let transferIx = await transferNftIx(this.umi, assetId, buyer);

    // const transferTx = await convertToTx(
    //   this.provider.connection,
    //   this.feeAccount,
    //   [...transferIx]
    // );

    const transferTx = await convertToTx(
      this.provider.connection,
      this.auctionHouseAuthority.publicKey,
      [...transferIx]
    );

    transferTx.sign([this.auctionHouseAuthority]);

    return await this.sendTx(transferTx);
  }
}
