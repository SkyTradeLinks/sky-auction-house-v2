import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
export default function createAuctionHouseHelper(connection: Connection, programCreator: AuctionHouseProgram, creatorWallet: Keypair, isNativeOverride?: boolean): Promise<{
    auctionHouse: PublicKey;
    treasuryMint: PublicKey;
}>;
//# sourceMappingURL=createAuctionHouseHelper.d.ts.map