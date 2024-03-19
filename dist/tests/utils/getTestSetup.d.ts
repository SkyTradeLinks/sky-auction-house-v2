import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import AuctionHouseProgram from "types/AuctionHouseProgram";
export default function getTestSetup(connection: Connection, auctionHouseConfig: {
    antiBotAuthority?: PublicKey;
    basisPoints: number;
    basisPointsSecondary: number;
    creator: AuctionHouseProgram;
    feeWithdrawalDestination?: PublicKey;
    treasuryMint: PublicKey;
    treasuryWithdrawalDestinationOwner?: PublicKey;
}, programCreatorWallet: Keypair, numSellers?: number, numBuyers?: number, tokenMintAddress?: PublicKey): Promise<[
    AuctionHouseSdk,
    PublicKey,
    PublicKey,
    PublicKey,
    Array<Keypair>,
    Array<Keypair>,
    DataV2
]>;
//# sourceMappingURL=getTestSetup.d.ts.map