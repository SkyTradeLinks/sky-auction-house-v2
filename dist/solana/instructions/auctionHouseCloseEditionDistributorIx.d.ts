import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    mint: PublicKey;
    owner: PublicKey;
    program: AuctionHouseProgram;
    rentReceiver: PublicKey;
};
export default function auctionHouseCloseEditionDistributorIx({ auctionHouse, authority, mint, owner, program, rentReceiver, }: Accounts): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCloseEditionDistributorIx.d.ts.map