import { AccountMeta, PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    buyerPriceInLamports: number;
    buyerReceiptTokenAccount?: PublicKey;
    lastBidPrice: PublicKey;
    program: AuctionHouseProgram;
    sellerPriceInLamports: number;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    treasuryMint: PublicKey;
    walletBuyer: PublicKey;
    walletCreator: PublicKey;
    walletSeller: PublicKey;
};
type Args = {
    tokenSize?: number;
};
export default function auctionHouseExecuteSaleIx({ auctionHouse, auctionHouseProgramId, authority, buyerPriceInLamports, buyerReceiptTokenAccount, lastBidPrice, program, sellerPriceInLamports, tokenAccount, tokenMint, treasuryMint, walletBuyer, walletCreator, walletSeller, }: Accounts, { tokenSize }: Args, remainingAccounts?: Array<AccountMeta>): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseExecuteSaleV2Ix.d.ts.map