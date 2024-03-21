import * as anchor from "@coral-xyz/anchor";
import {
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import {
  createAssociatedTokenAccount,
  getOrCreateAssociatedTokenAccount,
  createMint,
  mintTo,
} from "@solana/spl-token";
import { AuctionHouse } from "../target/types/auction_house";
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import {
  auctionHouseAuthority,
  BUY_PRICE,
  getAuthorityKeypair,
} from "../sdk/utils/constants";

describe("Deposit Test:", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;

  const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;
  const wallet = Keypair.generate();

  let auctionHouseSdk: AuctionHouseSdk;

  let balanceBefore;
  let balanceAfter;
  let mintPubkey;

  before(async () => {
    // Setup airdrop
    const airdropSignature = await connection.requestAirdrop(
      wallet.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    const confirmation = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    // Initialize Sdk
    auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);

    //create test spl-token mint
    mintPubkey = await createMint(
      connection, // conneciton
      wallet, // fee payer
      auctionHouseAuthority.publicKey, // mint authority
      auctionHouseAuthority.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      9 // decimals
    );
    let tokenAcct = await getOrCreateAssociatedTokenAccount(
      connection,
      auctionHouseAuthority,
      mintPubkey,
      wallet.publicKey
    );

    await mintTo(
      connection,
      auctionHouseAuthority,
      mintPubkey,
      tokenAcct.address,
      auctionHouseAuthority,
      100000000000 // because decimals for the mint are set to 9
    );
  });

  it("should successfully deposit into the auction-house", async () => {
    try {
      let paymentAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mintPubkey,
        wallet.publicKey
      );
      balanceBefore = await connection.getTokenAccountBalance(
        paymentAccount.address
      );
      // let transferAuthority = SystemProgram.programId;
      let transferAuthority = wallet.publicKey;
      const tx = await auctionHouseSdk.depositTx(
        {
          paymentAccount: paymentAccount.address,
          transferAuthority,
          wallet: wallet.publicKey,
        },
        { amount: 5 * LAMPORTS_PER_SOL }
      );
      console.log(tx);
      balanceAfter = await connection.getTokenAccountBalance(
        paymentAccount.address
      );
      console.log("tA Balance Before:", balanceBefore);
      console.log("tA Balance After:", balanceAfter);
    } catch (error) {
      console.error();
    }
  });
});
