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
};
type Args = {
    price?: number;
};
export default function auctionHouseSetLastBidPriceIx({ program, authority, owner, tokenAccount, tokenMint, auctionHouse, auctionHouseProgramId, }: Accounts, { price }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseSetLastBidPriceIx.d.ts.map