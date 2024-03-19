import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    bonkTokenAccount: PublicKey;
    mint: PublicKey;
    program: AuctionHouseProgram;
    tokenReceiver: PublicKey;
};
export default function auctionHouseWithdrawBonkIx({ auctionHouse, authority, mint, program, bonkTokenAccount, tokenReceiver, }: Accounts): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseWithdrawBonkIx.d.ts.map