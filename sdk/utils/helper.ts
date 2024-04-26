import fs from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TransactionWithMeta } from "@metaplex-foundation/umi";
import {
  SPL_NOOP_PROGRAM_ID,
  getAssetWithProof,
  getMetadataArgsSerializer,
} from "@metaplex-foundation/mpl-bubblegum";
import { deserializeChangeLogEventV1 } from "@solana/spl-account-compression";
import { createMint } from "@solana/spl-token";

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
  // needs better logic
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

export const getLeafData = async (umi, assetId, owner: PublicKey) => {
  let assetWithProof = await getAssetWithProof(umi, assetId);

  let leafData = {
    leafIndex: assetWithProof.index,
    leafNonce: new anchor.BN(assetWithProof.nonce),
    owner,
    delegate:
      assetWithProof.leafDelegate != null
        ? new anchor.web3.PublicKey(assetWithProof.leafDelegate)
        : owner,
    root: new anchor.web3.PublicKey(assetWithProof.root),
    leafHash: [
      ...new anchor.web3.PublicKey(
        assetWithProof.rpcAssetProof.leaf.toString()
      ).toBytes(),
    ],
    leafMetadata: Buffer.from(
      getMetadataArgsSerializer().serialize(assetWithProof.metadata)
    ),
  };

  return leafData;
};

export const validateTx = async (umi, signature) => {
  let mintTxInfo;
  for (let i = 0; i < 6; i++) {
    mintTxInfo = await umi.rpc.getTransaction(signature);

    if (mintTxInfo != null) {
      return mintTxInfo;
    }

    await sleep(1000 * i);
  }
};
