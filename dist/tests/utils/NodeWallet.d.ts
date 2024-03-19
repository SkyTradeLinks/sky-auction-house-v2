import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
interface Wallet {
    publicKey: PublicKey;
    signAllTransactions(txs: Array<Transaction>): Promise<Array<Transaction>>;
    signTransaction(tx: Transaction): Promise<Transaction>;
}
/**
 * Node only wallet.
 */
export default class NodeWallet implements Wallet {
    readonly payer: Keypair;
    constructor(payer: Keypair);
    static local(): NodeWallet;
    signTransaction(tx: Transaction): Promise<Transaction>;
    signAllTransactions(txs: Array<Transaction>): Promise<Array<Transaction>>;
    get publicKey(): PublicKey;
}
export {};
//# sourceMappingURL=NodeWallet.d.ts.map