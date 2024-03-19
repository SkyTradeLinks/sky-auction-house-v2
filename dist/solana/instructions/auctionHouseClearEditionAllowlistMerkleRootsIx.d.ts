import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    mint: PublicKey;
    program: AuctionHouseProgram;
};
export default function auctionHouseClearEditionAllowlistMerkleRootsIx({ auctionHouse, authority, mint, program, }: Accounts): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseClearEditionAllowlistMerkleRootsIx.d.ts.map