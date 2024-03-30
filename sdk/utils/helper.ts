import fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TransactionWithMeta } from "@metaplex-foundation/umi";
import { SPL_NOOP_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import { deserializeChangeLogEventV1 } from "@solana/spl-account-compression";

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

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const convertToTx = async (
  connection: Connection,
  payer: PublicKey,
  instructions
) => {
  const blockhash = await connection.getLatestBlockhash();

  // add nonce maybe?
  const messageV0 = new anchor.web3.TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash.blockhash,
    instructions: instructions,
  }).compileToV0Message();

  const transaction = new anchor.web3.VersionedTransaction(messageV0);

  return transaction;
};

export const findLeafIndexFromAnchorTx = (txInfo: TransactionWithMeta) => {
  let leafIndex: number | undefined = undefined;
  let treeAddress;

  let innerInstructions = txInfo.meta.innerInstructions;

  for (let i = innerInstructions.length - 1; i >= 0; i--) {
    for (let j = innerInstructions[i].instructions.length - 1; j >= 0; j--) {
      const instruction = innerInstructions[i].instructions[j];

      const programId = txInfo.message.accounts[instruction.programIndex];

      if (programId.toString() == SPL_NOOP_PROGRAM_ID.toString()) {
        try {
          const changeLogEvent = deserializeChangeLogEventV1(
            Buffer.from(instruction.data)
          );

          leafIndex = changeLogEvent?.index;
          treeAddress = changeLogEvent?.treeId;
        } catch (__) {
          // do nothing, invalid data is handled just after the for loop
        }
      }
    }
  }

  //
  return [leafIndex, treeAddress];
};
