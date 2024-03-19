import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
type Accounts = {
    auctionHouse: PublicKey;
    authority: PublicKey;
    mint: PublicKey;
    owner?: PublicKey;
    program: AuctionHouseProgram;
};
type Args = {
    limitPerAddress: number;
};
export default function auctionHouseSetEditionDistributorLimitPerAddressIx({ auctionHouse, authority, mint, owner, program }: Accounts, { limitPerAddress }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseSetEditionDistributorLimitPerAddressIx.d.ts.map