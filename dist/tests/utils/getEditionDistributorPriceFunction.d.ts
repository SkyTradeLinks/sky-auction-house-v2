import { PublicKey } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
import PriceFunctionType from "types/enum/PriceFunctionType";
export default function getEditionDistributorPriceFunction(program: AuctionHouseProgram, editionDistributor: PublicKey): Promise<{
    params: Array<number>;
    priceFunctionType: PriceFunctionType;
    startingPriceLamports: number;
}>;
//# sourceMappingURL=getEditionDistributorPriceFunction.d.ts.map