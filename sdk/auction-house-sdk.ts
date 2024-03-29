import * as anchor from "@coral-xyz/anchor";
// import { createMint } from "@solana/spl-token";
import {
  AUCTION_HOUSE,
  FEE_PAYER,
  TREASURY,
  auctionHouseAuthority,
} from "./utils/constants";
import { PublicKey } from "@solana/web3.js";
import { getUSDC, setupAirDrop } from "./utils/helper";
import { AuctionHouse } from "../target/types/auction_house";
import SaleType from "./types/enum/SaleType";
import findLastBidPrice from "./pdas/findLastBidPrice";
import auctionHouseCreateTradeStateIx from "./instructions/auctionHouseCreateTradeStateIx";
import auctionHouseCreateLastBidPriceIx from "./instructions/auctionHouseCreateLastBidPriceIx";
import auctionHouseSellIx from "./instructions/auctionHouseSellIx";
import auctionHouseCancelV2Ix from "./instructions/auctionHouseCancelV2Ix";
import { ixToTx, ixsToTx } from "./utils/instructions";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";

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

  async cancelTx(
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
    const ix = await auctionHouseCancelV2Ix(
      {
        auctionHouse: this.auctionHouse,
        auctionHouseProgramId: this.program.programId,
        authority: auctionHouseAuthority.publicKey,
        feeAccount: this.feeAccount,
        priceInLamports,
        program: this.program,
        paymentAccount,
        merkleTree,
        leafDataOwner,
        treasuryMint: this.mintAccount,
        sellerWallet: wallet,
        assetId,
      },
      { tokenSize }
    );
    return ixToTx(ix);
  }
}
