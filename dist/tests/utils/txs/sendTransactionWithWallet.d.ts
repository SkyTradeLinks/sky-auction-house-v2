import { Connection, Keypair, SendOptions, Transaction } from "@solana/web3.js";
export default function sendTransactionWithWallet(connection: Connection, tx: Transaction, wallet: Keypair, signers?: Array<Keypair>, options?: SendOptions): Promise<string>;
//# sourceMappingURL=sendTransactionWithWallet.d.ts.map