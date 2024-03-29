import * as anchor from "@coral-xyz/anchor";

import {
  AUCTION_HOUSE,
  FEE_PAYER,
  TREASURY,
  auctionHouseAuthority,
  LAST_BID_PRICE,
} from "./utils/constants";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SendOptions,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  Signer,
} from "@solana/web3.js";
import { getUSDC, setupAirDrop } from "./utils/helper";
import { AuctionHouse } from "../target/types/auction_house";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import {
  Umi,
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import {
  Keypair,
  SendOptions,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import SaleType from "./types/enum/SaleType";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import  SaleType from "./types/SaleType";
import findLastBidPrice from "./pdas/findLastBidPrice";
import auctionHouseCreateTradeStateIx from "./instructions/auctionHouseCreateTradeStateIx";
import auctionHouseCreateLastBidPriceIx from "./instructions/auctionHouseCreateLastBidPriceIx";
import auctionHouseSellIx from "./instructions/auctionHouseSellIx";
import { ixToTx, ixsToTx } from "./utils/instructions";
import PdaResult from "./types/PdaResult";
import { BN } from "@coral-xyz/anchor";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mintV1,
  mplBubblegum,
  createTree,
  findLeafAssetIdPda,
  parseLeafFromMintV1Transaction,
  LeafSchema,
  getAssetWithProof,
  transfer,
  fetchMerkleTree,
} from "@metaplex-foundation/mpl-bubblegum";

const SIGNATURE_SIZE = 64;
const MAX_SUPPORTED_TRANSACTION_VERSION = 0;

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
  public umi;

  constructor(
    public readonly program: anchor.Program<AuctionHouse>,
    private readonly provider: anchor.AnchorProvider
  ) {
    const umi = createUmi(provider.connection.rpcEndpoint).use(mplBubblegum());
    this.umi = umi;
  }

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
    // console.log("Anchor House Program", program)

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

  private async createLastBidPriceTx(
    assetId: anchor.web3.PublicKey,
    lastBidPrice: anchor.web3.PublicKey
  ) {
    return await this.program.methods
      .createLastBidPrice()
      .accounts({
        systemProgram: anchor.web3.SystemProgram.programId,
        wallet: auctionHouseAuthority.publicKey,
        lastBidPrice,
        auctionHouse: this.auctionHouse,
        assetId,
      })
      .instruction();
  }

  private async sendTx(
    tx: Transaction,
    signers?: Array<Keypair>,
    options?: SendOptions
  ) {
    try {
      const txid = await this.sendVersionedTransaction(tx, signers, options);

      const blockhash = await this.provider.connection.getLatestBlockhash();
      await this.provider.connection.confirmTransaction(
        {
          blockhash: blockhash.blockhash,
          lastValidBlockHeight: blockhash.lastValidBlockHeight,
          signature: txid,
        },
        "confirmed"
      );

      return txid;
    } catch (err) {
      throw err;
    }
  }

  public sendVersionedTransaction = async (
    tx: Transaction,
    signers: Array<Keypair> = [],
    options?: SendOptions
  ) => {
    const signersList = [...signers];

    // if (this.addressLookupTable == undefined) {
    return sendAndConfirmTransaction(
      this.provider.connection,
      tx,
      signersList,
      options
    );
    // }

    const addressLookupTable =
      await this.provider.connection.getAddressLookupTable(
        this.addressLookupTable
      );

    const blockhash = await this.provider.connection.getLatestBlockhash();
    const transactionMessage = new TransactionMessage({
      instructions: tx.instructions,
      payerKey: auctionHouseAuthority.publicKey,
      recentBlockhash: blockhash.blockhash,
    }).compileToV0Message([addressLookupTable.value]);

    const transaction = new VersionedTransaction(transactionMessage);
    transaction.sign(signersList);

    const txid = await this.provider.connection.sendTransaction(
      transaction,
      options
    );

    return txid;
  };

  public async createBuyTx(
    price: number,
    buyer: anchor.web3.PublicKey,
    assetId: anchor.web3.PublicKey,
    merkleTree: anchor.web3.PublicKey,
    previousBidder: anchor.web3.PublicKey,
    lastBidPrice: anchor.web3.PublicKey,
    buyerAta: anchor.web3.PublicKey,
    leafIndex: number,
    saleType: SaleType
  ) {
    const tx = new anchor.web3.Transaction();

    let normalizedPrice = new anchor.BN(price * Math.pow(10, 6));

    const [tradeState, tradeStateBump] = findAuctionHouseTradeState(
      this.auctionHouse,
      buyer,
      assetId,
      this.mintAccount,
      merkleTree,
      normalizedPrice,
      this.program.programId
    );

    const [escrowPaymentAccount, escrowBump] =
      findAuctionHouseBidderEscrowAccount(
        this.auctionHouse,
        buyer,
        merkleTree,
        assetId,
        this.program.programId
      );

    const [
      previousBidderEscrowPaymentAccount,
      previousBidderEscrowPaymentBump,
    ] = findAuctionHouseBidderEscrowAccount(
      this.auctionHouse,
      previousBidder,
      merkleTree,
      assetId,
      this.program.programId
    );

    let previousBidderRefundAccount = getAssociatedTokenAddressSync(
      this.mintAccount,
      previousBidder
    );

    tx.add(
      // await this.program.methods
      //   .createTradeState(tradeStateBump, normalizedPrice, saleType, null)
      //   .accounts({
      //     auctionHouse: this.auctionHouse,
      //     auctionHouseFeeAccount: this.feeAccount,
      //     authority: auctionHouseAuthority.publicKey,
      //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      //     systemProgram: anchor.web3.SystemProgram.programId,
      //     assetId,
      //     merkleTree,
      //     tradeState,
      //     wallet: buyer,
      //   })
      //   .instruction(),
      await this.program.methods
        .buyV2(
          tradeStateBump,
          escrowBump,
          normalizedPrice,
          new anchor.BN(leafIndex),
          saleType,
          null,
          previousBidderEscrowPaymentBump
        )
        .accounts({
          wallet: buyer,
          paymentAccount: buyerAta,
          transferAuthority: buyer,
          treasuryMint: this.mintAccount,
          assetId: assetId,
          escrowPaymentAccount,
          authority: auctionHouseAuthority.publicKey,
          auctionHouse: this.auctionHouse,
          auctionHouseFeeAccount: this.feeAccount,
          buyerTradeState: tradeState,
          merkleTree,
          lastBidPrice,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          previousBidderWallet: previousBidder,
          previousBidderEscrowPaymentAccount,
          previousBidderRefundAccount,
          ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  public async buy(
    buyer: anchor.web3.Keypair,
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
      const createBidTx = new anchor.web3.Transaction().add(
        await this.createLastBidPriceTx(assetId, lastBidPrice)
      );

      await this.sendTx(createBidTx, [auctionHouseAuthority]);
    }

    let lastBidInfo = await this.program.account.lastBidPrice.fetch(
      lastBidPrice
    );

    let buyTx = await this.createBuyTx(
      price,
      buyer.publicKey,
      assetId,
      merkleTree,
      lastBidInfo.bidder,
      lastBidPrice,
      buyerAta,
      leafIndex,
      saleType
    );

    await this.sendTx(buyTx, [buyer]);
    let lastBidInfo1 = await this.program.account.lastBidPrice.fetch(
      lastBidPrice
    );
    console.log("final", lastBidInfo1);
  }

  public async cancel(
    buyer: anchor.web3.Keypair,
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

    console.log("lastBidPrice", lastBidPrice);
    console.log(
      "LBF",
      await this.provider.connection.getAccountInfo(lastBidPrice)
    );
    if ((await this.provider.connection.getAccountInfo(lastBidPrice)) == null) {
      const createBidTx = new anchor.web3.Transaction().add(
        await this.createLastBidPriceTx(assetId, lastBidPrice)
      );

      await this.sendTx(createBidTx, [auctionHouseAuthority]);
    }

    let lastBidInfo = await this.program.account.lastBidPrice.fetch(
      lastBidPrice
    );
    console.log("cencel lBI", lastBidInfo);

    let normalizedPrice = new anchor.BN(price * Math.pow(10, 6));

    const [tradeState, tradeStateBump] = findAuctionHouseTradeState(
      this.auctionHouse,
      buyer.publicKey,
      assetId,
      this.mintAccount,
      merkleTree,

      normalizedPrice,
      this.program.programId
    );
    console.log("ts", tradeState);

    const [escrowPaymentAccount, escrowBump] =
      findAuctionHouseBidderEscrowAccount(
        this.auctionHouse,
        buyer.publicKey,
        merkleTree,
        assetId,
        this.program.programId
      );

    console.log("escrow", escrowPaymentAccount);

    const [
      previousBidderEscrowPaymentAccount,
      previousBidderEscrowPaymentBump,
    ] = findAuctionHouseBidderEscrowAccount(
      this.auctionHouse,
      lastBidInfo.bidder,
      merkleTree,
      assetId,
      this.program.programId
    );

    console.log("prev bi", previousBidderEscrowPaymentAccount);
    /*
   let buyTx = await this.createBuyTx(
     price,
     buyer.publicKey,
     assetId,
     merkleTree,
     lastBidInfo.bidder,
     lastBidPrice,
     buyerAta,
     leafIndex,
     saleType
   );

   await this.sendTx(buyTx, [buyer]); */
  }


  private createTradeState(
    {
      merkleTree,
      paymentAccount,
      wallet,
      // assetIdOwner,
      assetId,
    }: {
      merkleTree: PublicKey;
      paymentAccount: PublicKey;
      wallet: PublicKey;
      // assetIdOwner: PublicKey;
      assetId: PublicKey;
    },
    {
      allocationSize,
      priceInLamports,
      saleType,
      tokenSize,
    }: {
      allocationSize?: number;
      priceInLamports: number;
      saleType: SaleType;
      tokenSize?: number;
    }
  ) {
    return auctionHouseCreateTradeStateIx(
      {
        auctionHouse: this.auctionHouse,
        auctionHouseFeeAccount: this.feeAccount,
        auctionHouseProgramId: this.program.programId,
        authority: auctionHouseAuthority.publicKey,
        program: this.program,
        merkleTree,
        paymentAccount,
        // assetIdOwner,
        treasuryMint: this.mintAccount,
        wallet,
        assetId,
      },
      {
        allocationSize,
        priceInLamports,
        saleType,
        tokenSize,
      }
    );
  }

  async createLastBidPriceTx({
    treasuryMint,
    wallet,
  }: {
    treasuryMint: PublicKey;
    wallet: PublicKey;
  }) {
    const auctionHouseAddressKey = this.auctionHouse;

    const ix = await auctionHouseCreateLastBidPriceIx({
      auctionHouse: auctionHouseAddressKey,
      auctionHouseProgramId: this.program.programId,
      program: this.program,
      treasuryMint,
      wallet,
    });
    return ixToTx(ix);
  }

  async findLastBidPrice(treasuryMint: PublicKey) {
    return findLastBidPrice(
      treasuryMint,
      this.program.programId,
      this.auctionHouse
    );
  }

  private async createLastBidPriceIfNotExistsTx({
    treasuryMint,
    wallet,
  }: {
    treasuryMint: PublicKey;
    wallet: PublicKey;
  }) {
    const [lastBidPrice] = await this.findLastBidPrice(treasuryMint);
    const lastBidPriceAccount =
      await this.program.provider.connection.getAccountInfo(lastBidPrice);
    if (lastBidPriceAccount != null) {
      return null;
    }

    return this.createLastBidPriceTx({ treasuryMint, wallet });
  }

  async sell(
    saleType: SaleType,
    shouldCreateLastBidPriceIfNotExists: boolean,

    assetId: PublicKey,
    {
      priceInLamports,
      leafDataOwner,
      merkleTree,
      wallet,
      paymentAccount,
    }: {
      priceInLamports: number;
      leafDataOwner: PublicKey;
      merkleTree: PublicKey;
      wallet: PublicKey;
      paymentAccount: PublicKey;
    },
    { tokenSize = 1 }: { tokenSize?: number }
  ) {
    // console.log("Transforming asset id", assetId, typeof assetId)
    const tradeStateIx = await this.createTradeState(
      {
        merkleTree,
        // assetIdOwner,
        wallet,
        paymentAccount,
        assetId,
      },
      {
        priceInLamports,
        saleType,
        tokenSize,
      }
    );

    const [createLastBidPriceTx, sellIx] = await Promise.all([
      shouldCreateLastBidPriceIfNotExists
        ? this.createLastBidPriceIfNotExistsTx({
            treasuryMint: this.mintAccount,
            wallet,
          })
        : null,
      auctionHouseSellIx(
        {
          auctionHouse: this.auctionHouse,
          auctionHouseProgramId: this.program.programId,
          authority: auctionHouseAuthority.publicKey,
          feeAccount: this.feeAccount,
          priceInLamports,
          program: this.program,
          merkleTree,
          leafDataOwner,
          treasuryMint: this.mintAccount,
          sellerWallet: wallet,
          paymentAccount,
          assetId,
        },
        { tokenSize }
      ),
    ]);

    return ixsToTx([
      // Executing a sale requires the last_bid_price account to be
      // created. Thus, we initialize the account during listing if
      // needed.
      ...(createLastBidPriceTx == null
        ? []
        : createLastBidPriceTx.instructions),
      tradeStateIx,
      sellIx,
    ]);
  }
}
