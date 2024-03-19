import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    program: AuctionHouseProgram;
    receiptAccount: PublicKey;
    tokenMint: PublicKey;
    treasuryMint: PublicKey;
    wallet: PublicKey;
};
type Args = {
    amount: number;
};
export default function auctionHouseWithdrawIx({ program, wallet, receiptAccount, tokenMint, treasuryMint, authority, auctionHouse, auctionHouseProgramId, }: Accounts, { amount }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseWithdrawIx.d.ts.map