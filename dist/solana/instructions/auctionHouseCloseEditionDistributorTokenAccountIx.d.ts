import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    mint: PublicKey;
    owner: PublicKey;
    program: AuctionHouseProgram;
    rentReceiver: PublicKey;
    tokenReceiver: PublicKey;
};
export default function auctionHouseCloseEditionDistributorTokenAccountIx({ auctionHouse, authority, mint, owner, program, rentReceiver, tokenReceiver, }: Accounts): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCloseEditionDistributorTokenAccountIx.d.ts.map