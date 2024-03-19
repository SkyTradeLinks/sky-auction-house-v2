import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
export default function createAuctionHouse(connection: Connection, sdk: AuctionHouseSdk, programCreator: Keypair, auctionHouseConfig: {
    basisPoints: number;
    basisPointsSecondary: number;
    feeWithdrawalDestination?: PublicKey;
    treasuryWithdrawalDestination?: PublicKey;
    treasuryWithdrawalDestinationOwner?: PublicKey;
}): Promise<PublicKey>;
//# sourceMappingURL=createAuctionHouse.d.ts.map