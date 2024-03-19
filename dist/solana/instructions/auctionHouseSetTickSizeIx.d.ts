import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    owner: PublicKey;
    program: AuctionHouseProgram;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    treasuryMint: PublicKey;
};
type Args = {
    tickSizeConstantInLamports: number;
};
export default function auctionHouseSetTickSizeIx({ auctionHouse, auctionHouseProgramId, authority, owner, program, tokenAccount, tokenMint, treasuryMint, }: Accounts, { tickSizeConstantInLamports }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseSetTickSizeIx.d.ts.map