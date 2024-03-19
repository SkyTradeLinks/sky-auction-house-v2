import { Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import PriceFunctionType from "types/enum/PriceFunctionType";
export default function getEditionDistributorSetup({ antiBotAuthority, antiBotProtectionEnabled, auctionHouseConfigArg, maxSupply, multipleCreators, priceFunctionType, priceParams, limitPerAddress, publicSaleStartTime, saleEndTime, allowlistSalePrice, allowlistSaleStartTime, startingPriceLamports, }: {
    allowlistSalePrice?: number;
    allowlistSaleStartTime?: number;
    antiBotAuthority?: PublicKey;
    antiBotProtectionEnabled?: boolean;
    auctionHouseConfigArg?: {
        basisPoints: number;
        basisPointsSecondary: number;
        treasuryWithdrawalDestinationOwner: PublicKey;
    };
    limitPerAddress?: number;
    maxSupply?: number;
    multipleCreators?: boolean;
    priceFunctionType: PriceFunctionType;
    priceParams: Array<number>;
    publicSaleStartTime?: number;
    saleEndTime?: number;
    startingPriceLamports: number;
}): Promise<{
    auctionHouseAccount: any;
    auctionHouseSdk: AuctionHouseSdk;
    editionDistributor: PdaResult;
    metadataData: import("@metaplex-foundation/mpl-token-metadata").DataV2;
    nftOwner: Keypair;
    nftOwnerTokenAccount: any;
    programCreator: Keypair;
    remainingAccounts: {
        isSigner: boolean;
        isWritable: boolean;
        pubkey: PublicKey;
    }[];
    tokenMint: any;
}>;
//# sourceMappingURL=getEditionDistributorSetup.d.ts.map