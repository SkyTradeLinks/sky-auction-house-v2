import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseProgramId: PublicKey;
    program: AuctionHouseProgram;
    tokenMint: PublicKey;
    wallet: PublicKey;
};
export default function auctionHouseCreateLastBidPriceIx({ program, wallet, tokenMint, auctionHouse, auctionHouseProgramId, }: Accounts): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCreateLastBidPriceIx.d.ts.map