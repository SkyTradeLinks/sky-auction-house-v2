import fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import { auctionHouseAuthority } from "./constants";

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

export const getUSDC = async (connection: anchor.web3.Connection) => {
  if (connection.rpcEndpoint.includes("localhost")) {
    return await createMint(
      connection,
      auctionHouseAuthority,
      auctionHouseAuthority.publicKey,
      auctionHouseAuthority.publicKey,
      6
    );
  } else if (connection.rpcEndpoint.includes("mainnet")) {
    return new anchor.web3.PublicKey(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    );
  } else {
    // devnet | testnet
    return new anchor.web3.PublicKey(
      "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
    );
  }
};
