import fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import {
  AUCTION_HOUSE,
  LAST_BID_PRICE,
  auctionHouseAuthority,
} from "./constants";

export const loadKeyPair = (filename) => {
  const decodedKey = new Uint8Array(
    JSON.parse(fs.readFileSync(filename).toString())
  );

  let keyPair = anchor.web3.Keypair.fromSecretKey(decodedKey);

  return keyPair;
};

export const loadKeyPairV2 = (key) => {
  const decodedKey = new Uint8Array(JSON.parse(key));

  const keyPair = anchor.web3.Keypair.fromSecretKey(decodedKey);

  return keyPair;
};

export const setupAirDrop = async (
  connection: anchor.web3.Connection,
  account: anchor.web3.PublicKey
) => {
  if (connection.rpcEndpoint.includes("mainnet")) return;

  const latestBlockHash = await connection.getLatestBlockhash();

  let amount;

  if (connection.rpcEndpoint.includes("localhost")) {
    amount = 1000;
  } else {
    amount = 1;
  }

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: await connection.requestAirdrop(
      account,
      LAMPORTS_PER_SOL * amount
    ),
  });
};

export const getUSDC = async (
  connection: anchor.web3.Connection,
  test_flag = false
) => {
  if (test_flag) {
    return new PublicKey("BnXBBCnX8nZFxxeK9teZGJSHeCbnQ5PfzdS2RanrVnv7");
  } else {
    if (connection.rpcEndpoint.includes("mainnet")) {
      return new anchor.web3.PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      );
    } else {
      // devnet | testnet
      return new anchor.web3.PublicKey(
        "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
      );
    }
  }
};

export const findAuctionHouseBidderEscrowAccount = (
  auctionHouse: PublicKey,
  wallet: PublicKey,
  merkleTree: PublicKey,
  assetId: PublicKey,
  auctionHouseProgramId: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(AUCTION_HOUSE),
      auctionHouse.toBuffer(),
      wallet.toBuffer(),

      assetId.toBuffer(),
    ],
    auctionHouseProgramId
  );
};

export const findAuctionHouseTradeState = (
  auctionHouse: PublicKey,
  wallet: PublicKey,
  assetId: PublicKey,
  treasuryMint: PublicKey,
  merkleTree: PublicKey,
  buyPrice: anchor.BN,
  auctionHouseProgramId: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(AUCTION_HOUSE),
      wallet.toBuffer(),
      auctionHouse.toBuffer(),
      assetId.toBuffer(),
      treasuryMint.toBuffer(),
      merkleTree.toBuffer(),
      // buyPrice.toArrayLike(Buffer, "le", 8),
    ],
    auctionHouseProgramId
  );
};

export const findLastBidPrice = (
  auctionHouse: PublicKey,
  assetId: anchor.web3.PublicKey,
  auctionHouseProgramId: PublicKey
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(LAST_BID_PRICE), auctionHouse.toBuffer(), assetId.toBuffer()],
    auctionHouseProgramId
  );
};
