import * as anchor from "@coral-xyz/anchor";
import { createMint } from "@solana/spl-token";
import {
  AUCTION_HOUSE,
  FEE_PAYER,
  TREASURY,
  auctionHouseAuthority,
} from "./utils/constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import AnchorProgram from "../src/types/AnchorProgram";
import { getUSDC, setupAirDrop } from "./utils/helper";
import { AuctionHouse } from "../target/types/auction_house";

export class AuctionHouseSdk {
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
    private readonly program: anchor.Program<AuctionHouse>,
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
}
