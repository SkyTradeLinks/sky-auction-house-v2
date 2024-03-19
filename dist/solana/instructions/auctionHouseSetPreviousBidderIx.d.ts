import { Maybe } from "@formfunction-hq/formfunction-program-shared";
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
    bidder: Maybe<PublicKey>;
};
export default function auctionHouseSetPreviousBidderIx({ program, authority, tokenMint, auctionHouse, auctionHouseProgramId, }: Accounts, { bidder }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseSetPreviousBidderIx.d.ts.map