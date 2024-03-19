import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { DataV2, Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import AuctionHouseProgram from "types/AuctionHouseProgram";
export default function getTestSetupV2({ auctionHouseConfig, connection, numBuyers, numSellers, programCreatorWallet, tokenMintAddress, useProgrammableNft, }: {
    auctionHouseConfig: {
        antiBotAuthority?: PublicKey;
        basisPoints: number;
        basisPointsSecondary: number;
        creator: AuctionHouseProgram;
        feeWithdrawalDestination?: PublicKey;
        treasuryMint: PublicKey;
        treasuryWithdrawalDestinationOwner?: PublicKey;
    };
    connection: Connection;
    numBuyers?: number;
    numSellers?: number;
    programCreatorWallet: Keypair;
    tokenMintAddress?: PublicKey;
    useProgrammableNft: boolean;
}): Promise<{
    auctionHouseSdk: AuctionHouseSdk;
    buyerTokenAccount: PublicKey;
    buyers: Array<Keypair>;
    metadataData: Maybe<DataV2>;
    programmableNftMetadata: Maybe<Metadata>;
    sellers: Array<Keypair>;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
}>;
//# sourceMappingURL=getTestSetupV2.d.ts.map