import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
import PriceFunctionType from "types/enum/PriceFunctionType";
type Accounts = {
    mint: PublicKey;
    owner: PublicKey;
    program: AuctionHouseProgram;
    tokenAccount: PublicKey;
    treasuryMint: PublicKey;
};
type Args = {
    allowlistSalePrice: Maybe<number>;
    allowlistSaleStartTime: Maybe<number>;
    priceFunctionType: PriceFunctionType;
    priceParams: Array<number>;
    publicSaleStartTime: Maybe<number>;
    saleEndTime: Maybe<number>;
    startingPriceLamports: number;
};
export default function auctionHouseCreateEditionDistributorIx({ mint, owner, program, tokenAccount, treasuryMint }: Accounts, { allowlistSalePrice, allowlistSaleStartTime, priceFunctionType, priceParams, publicSaleStartTime, saleEndTime, startingPriceLamports, }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCreateEditionDistributorIx.d.ts.map