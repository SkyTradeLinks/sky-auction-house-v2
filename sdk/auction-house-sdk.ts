// import {
//   createAtaIx,
//   createTransferAtaIx,
//   filterNulls,
//   findAtaPda,
//   findTokenMetadataPda,
//   getMasterEditionSupply,
//   ixsToTx,
//   ixToTx,
//   Maybe,
//   MaybeUndef,
//   MerkleRoot,
// } from "../formfunction-program-shared/src";
import * as anchor from "@coral-xyz/anchor";
// import { createMint } from "@solana/spl-token";
import {
  AUCTION_HOUSE,
  FEE_PAYER,
  TREASURY,
  auctionHouseAuthority,
} from "./utils/constants";
import { LAMPORTS_PER_SOL, PublicKey ,  sendAndConfirmTransaction,
  SendOptions,
  Transaction,
  TransactionMessage,
  VersionedTransaction,} from "@solana/web3.js";
import { getUSDC, setupAirDrop } from "./utils/helper";
import { AuctionHouse } from "../target/types/auction_house";
import  SaleType from "./types/SaleType";
import findLastBidPrice from "./pdas/findLastBidPrice";
import auctionHouseCreateTradeStateIx from "./instructions/auctionHouseCreateTradeStateIx";
import auctionHouseCreateLastBidPriceIx from "./instructions/auctionHouseCreateLastBidPriceIx";
import auctionHouseSellIx from "./instructions/auctionHouseSellIx";
import { ixToTx } from "./program_shared/instructions";
import PdaResult from './types/PdaResult';
import { BN } from "@coral-xyz/anchor";


const SIGNATURE_SIZE = 64;
const MAX_SUPPORTED_TRANSACTION_VERSION = 0;


export default class AuctionHouseSdk {
  private static instance: AuctionHouseSdk;

  // fields
  public mintAccount: anchor.web3.PublicKey;
  public auctionHouse: anchor.web3.PublicKey;
  public auctionHouseBump: number;

  public feeAccount: anchor.web3.PublicKey;
  public feeBump: number;

  public treasuryAccount: anchor.web3.PublicKey;
  public treasuryBump: number;

  constructor(
    public readonly program: anchor.Program<AuctionHouse>,
    private readonly provider: anchor.AnchorProvider
  ) {}

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
    await setupAirDrop(
      this.provider.connection,
      auctionHouseAuthority.publicKey
    );

    this.mintAccount = await getUSDC(this.provider.connection);

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


  private createTradeState(
    {
      tokenAccount,
      tokenMint,
      wallet,
    }: {
      tokenAccount: PublicKey;
      tokenMint: PublicKey;
      wallet: PublicKey;
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
        tokenAccount,
        tokenMint,
        treasuryMint: this.mintAccount,
        wallet,
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
    tokenMint,
    wallet,
  }: {
    tokenMint: PublicKey;
    wallet: PublicKey;
  }) {
    const auctionHouseAddressKey = this.auctionHouse;

    const ix = await auctionHouseCreateLastBidPriceIx({
      auctionHouse: auctionHouseAddressKey,
      auctionHouseProgramId: this.program.programId,
      program: this.program,
      tokenMint,
      wallet,
    });
    return ixToTx(ix);
  }

  async findLastBidPrice(tokenMint: PublicKey) {
    return findLastBidPrice(tokenMint, this.program.programId, this.auctionHouse);
  }

  private async createLastBidPriceIfNotExistsTx({
    tokenMint,
    wallet,
  }: {
    tokenMint: PublicKey;
    wallet: PublicKey;
  }) {
    const [lastBidPrice] = await this.findLastBidPrice(tokenMint);
    const lastBidPriceAccount = await this.program.provider.connection.getAccountInfo(lastBidPrice);
    if (lastBidPriceAccount != null) {
      return null;
    }

    return this.createLastBidPriceTx({ tokenMint, wallet });
  }



  async sell(
    saleType: SaleType,
    shouldCreateLastBidPriceIfNotExists: boolean,
    {
      priceInLamports,
      tokenAccount,
      tokenMint,
      wallet,
    }: {
      priceInLamports: number;
      tokenAccount: PublicKey;
      tokenMint: PublicKey;
      wallet: PublicKey;
    },
    { tokenSize = 1 }: { tokenSize?: number }
  ) {
    const tradeStateIx = await this.createTradeState(
      {
        tokenAccount,
        tokenMint,
        wallet,
      },
      {
        priceInLamports,
        saleType,
        tokenSize,
      }
    )

    const [createLastBidPriceTx, sellIx] = await Promise.all([shouldCreateLastBidPriceIfNotExists
      ? this.createLastBidPriceIfNotExistsTx({ tokenMint, wallet }) : null,
      auctionHouseSellIx(
        {
          auctionHouse: this.auctionHouse,
          auctionHouseProgramId: this.program.programId,
          authority: auctionHouseAuthority.publicKey,
          feeAccount: this.feeAccount,
          priceInLamports,
          program: this.program,
          tokenAccount,
          tokenMint,
          treasuryMint: this.mintAccount,
          walletSeller: wallet,
        },
        { tokenSize }
      ),
    ]);
  }
}
