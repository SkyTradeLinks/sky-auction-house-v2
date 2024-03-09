// import { logIfDebug } from "@formfunction-hq/formfunction-program-shared";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SendOptions,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import AuctionHouseSdk from "./sdk/auction-house-sdk";
// import sendTransactionWithWallet from "../../src/tests/utils/txs/sendTransactionWithWallet";
// import verifyDelegateAndFrozen from "../../src/tests/utils/verifyDelegateAndFrozen";
import SaleType from "./sdk/types/SaleType";
import PdaResult from "./sdk/types/PdaResult"
import { AUCTION_HOUSE } from "./sdk/utils/constants"
import { Maybe, MaybeUndef } from "./sdk/types/UtilityTypes"
import { Account, getAccount } from "@solana/spl-token";
import invariant from "tiny-invariant";
import { expect } from 'chai';
import { readFileSync } from "fs";

type AddressLookupTableFileData = {
  tableAddress: string;
};

const SIGNATURE_SIZE = 64;
const MAX_SUPPORTED_TRANSACTION_VERSION = 0;


function getSignatureLengthBytes(signatureLength: number) {
  if (signatureLength <= 2 ** 7 - 1) {
    return 1;
  }
  if (signatureLength <= 2 ** 14 - 1) {
    return 2;
  }
  return 3;
}

// Lifted from https://github.com/formfunction-hq/formfn-monorepo/blob/main/packages/server/src/utils/solana/txs/getTransactionSizeInBytes.ts
export async function estimateTransactionSizeInBytes(
  txid: string,
  connection: Connection
): Promise<Maybe<number>> {
  const response = await connection.getTransaction(txid, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: MAX_SUPPORTED_TRANSACTION_VERSION,
  });
  if (response == null) {
    return null;
  }
  const { message } = response.transaction;
  return (
    // Implementation based on Solana Explorer's https://github.com/solana-labs/solana/blob/master/explorer/src/pages/inspector/InspectorPage.tsx#L316
    // They show tx size on their Inspect page, e.g. https://explorer.solana.com/tx/42BHJY3YNyqe6YM7R2md53MV19KUMVLzFk9sqW1QUQ3VxE8dFQQmZEsECV5LFwuk5J6rJ3W32XqyZGTAJPQaTeUo/inspect
    message.serialize().length +
    message.header.numRequiredSignatures * SIGNATURE_SIZE +
    getSignatureLengthBytes(message.header.numRequiredSignatures)
  );
}


export  function stringToPublicKey(
  key: MaybeUndef<string>
): Maybe<PublicKey> {
  if (key == null) {
    return null;
  }

  try {
    return new PublicKey(key);
  } catch {
    return null;
  }
}


// export function readAddressLookupTableFromDisk(
//   filepath: string
// ): PublicKey {
//   const file = readFileSync(filepath, "utf-8");
//   const data: AddressLookupTableFileData = JSON.parse(file);
//   const address = stringToPublicKey(data.tableAddress);
//   if (address == null) {
//     throw new Error(
//       `Error reading and parsing local address lookup table file data at: ${filepath}`
//     );
//   }

//   return address;
// }

// const UNIT_TESTS = "true";

// // This file should have been created up front before the tests run, when the
// // ALT was created. Note that if running unit tests this file will not exist,
// // so this will default to the PublicKey default value.
// export const ADDRESS_LOOKUP_TABLE_ADDRESS: PublicKey = UNIT_TESTS
//   ? PublicKey.default
//   : readAddressLookupTableFromDisk(
//       process.env.AUCTION_HOUSE_AUTHORITY as string
//     );



async function sendVersionedTransaction({
  connection,
  options,
  signers = [],
  tx,
  wallet,
}: {
  connection: Connection;
  options?: SendOptions;
  signers?: Array<Keypair>;
  tx: Transaction;
  wallet: Keypair;
}): Promise<string> {
  const signersList = [wallet, ...signers];
  const blockhash = await connection.getLatestBlockhash();
  const transactionMessage = new TransactionMessage({
    instructions: tx.instructions,
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash.blockhash,
  }).compileToV0Message([]);

  const transaction = new VersionedTransaction(transactionMessage);
  transaction.sign(signersList);
  const txid = await connection.sendTransaction(transaction, options);

  return txid;
}


// [TODO][@]: Refactor to take an object of arguments.
export  async function sendTransactionWithWallet(
  connection: Connection,
  tx: Transaction,
  wallet: Keypair,
  signers?: Array<Keypair>,
  options?: SendOptions
) {
  try {
    const txid = await sendVersionedTransaction({
      connection,
      options,
      signers,
      tx,
      wallet,
    });

    const blockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature: txid,
      },
      "confirmed"
    );

    // if (LOG_TX_SIZE) {
      const size = await estimateTransactionSizeInBytes(txid, connection);
      console.log(`Estimated transaction size = ${size} bytes.`);
    // }

    return txid;
  } catch (e) {
    // if (DEBUG) {
      console.error(e);
    // }

    throw e;
  }
}

export async function getTokenAccountInfo(
  connection: Connection,
  tokenAccount: PublicKey
): Promise<Account> {
  return getAccount(connection, tokenAccount);
}

export function expectEqPubkeys(
  pubkey1: PublicKey,
  pubkey2: PublicKey
) {
  expect(pubkey1.toString()).toEqual(pubkey2.toString());
}

export function expectNeqPubkeys(
  pubkey1: Maybe<PublicKey>,
  pubkey2: Maybe<PublicKey>
) {
  expect(pubkey1?.toString()).not.toEqual(pubkey2?.toString());
}

export function findAuctionHouseProgramAsSigner(
  auctionHouseProgramId: PublicKey
): PdaResult {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(AUCTION_HOUSE), Buffer.from("signer")],
    auctionHouseProgramId
  );
}


export async function verifyDelegateAndFrozen(
  connection: Connection,
  tokenMint: PublicKey,
  tokenAccount: PublicKey,
  wallet: Keypair,
  auctionHouseProgramId: PublicKey,
  expectedIsFrozen: boolean,
  expectedDelegate?: PublicKey
) {
  const [programAsSigner, _programAsSignerBump] =
    findAuctionHouseProgramAsSigner(auctionHouseProgramId);
  // Check that token account delegate is no longer program as signer
  const tokenAccountInfoAfter = await getTokenAccountInfo(
    connection,
    tokenAccount
  );
  expectedDelegate
    ? expectEqPubkeys(tokenAccountInfoAfter.delegate!, expectedDelegate)
    : expectNeqPubkeys(tokenAccountInfoAfter.delegate, programAsSigner);
  expect(tokenAccountInfoAfter.isFrozen).toEqual(expectedIsFrozen);
}

export default async function sell(
  connection: Connection,
  sdk: AuctionHouseSdk,
  tokenMint: PublicKey,
  tokenAccount: PublicKey,
  seller: Keypair,
  priceInSol: number,
  saleType = SaleType.Auction
) {
  console.log("calling sell");
  const accounts = {
    priceInLamports: priceInSol * LAMPORTS_PER_SOL,
    tokenAccount,
    tokenMint,
    wallet: seller.publicKey,
  };
  const args = {};

  const tx = await (saleType === SaleType.Auction
    ? sdk.sellTx(accounts, args)
    : sdk.sellInstantSaleTx(accounts, args));
  await sendTransactionWithWallet(connection, tx, seller);
  console.log("finished calling sell");

  // Check that token account delegate is program as signer
  const [programAsSigner] = await sdk.findProgramAsSigner();
  await verifyDelegateAndFrozen(
    connection,
    tokenMint,
    tokenAccount,
    seller,
    sdk.program.programId,
    true,
    programAsSigner
  );

  // Check that seller trade state has been created, and that it contains the right bump
  const [tradeState, tradeBump] = await sdk.findTradeState(
    seller.publicKey,
    tokenAccount,
    tokenMint,
    priceInSol * LAMPORTS_PER_SOL
  );
  const sellerTradeState = await connection.getAccountInfo(tradeState);
  expect(sellerTradeState).toBeDefined();
  expect(Number(sellerTradeState!.data[0])).toEqual(tradeBump);
}