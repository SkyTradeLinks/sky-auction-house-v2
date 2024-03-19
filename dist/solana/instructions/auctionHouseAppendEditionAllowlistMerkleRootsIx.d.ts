import { MerkleRoot } from "@formfunction-hq/formfunction-program-shared";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    mint: PublicKey;
    program: AuctionHouseProgram;
};
type Args = {
    merkleRoots: Array<MerkleRoot>;
};
export default function auctionHouseAppendEditionAllowlistMerkleRootsIx({ auctionHouse, authority, mint, program }: Accounts, { merkleRoots }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseAppendEditionAllowlistMerkleRootsIx.d.ts.map