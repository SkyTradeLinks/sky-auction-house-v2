import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    program: AuctionHouseProgram;
    treasuryAccount: PublicKey;
    treasuryMint: PublicKey;
    treasuryWithdrawalDestination: PublicKey;
};
type Args = {
    amount: number;
};
export default function auctionHouseWithdrawFromTreasuryIx({ program, treasuryWithdrawalDestination, treasuryAccount, treasuryMint, authority, auctionHouse, }: Accounts, { amount }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseWithdrawFromTreasuryIx.d.ts.map