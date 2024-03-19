import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    program: AuctionHouseProgram;
    tokenMint: PublicKey;
};
type Args = {
    hasBeenSold: boolean;
};
export default function auctionHouseSetHasBeenSoldIx({ program, authority, tokenMint, auctionHouse, auctionHouseProgramId, }: Accounts, { hasBeenSold }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseSetHasBeenSoldIx.d.ts.map