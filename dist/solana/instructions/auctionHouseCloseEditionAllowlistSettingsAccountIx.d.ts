import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    mint: PublicKey;
    program: AuctionHouseProgram;
};
export default function auctionHouseCloseEditionAllowlistSettingsAccountIx({ auctionHouse, authority, mint, program, }: Accounts): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCloseEditionAllowlistSettingsAccountIx.d.ts.map