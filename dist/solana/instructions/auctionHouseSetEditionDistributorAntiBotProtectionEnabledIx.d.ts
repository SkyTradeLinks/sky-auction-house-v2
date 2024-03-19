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
    antiBotProtectionEnabled: boolean;
};
export default function auctionHouseSetEditionDistributorAntiBotProtectionEnabledIx({ auctionHouse, authority, mint, owner, program }: Accounts, { antiBotProtectionEnabled }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseSetEditionDistributorAntiBotProtectionEnabledIx.d.ts.map