import { Maybe, MaybeUndef } from "@formfunction-hq/formfunction-program-shared";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
import PriceFunctionType from "types/enum/PriceFunctionType";
type Accounts = {
    mint: PublicKey;
    owner: PublicKey;
    program: AuctionHouseProgram;
    treasuryMint: PublicKey;
};
type Args = {
    allowlistSalePrice: Maybe<number>;
    allowlistSaleStartTime: Maybe<number>;
    newOwner?: MaybeUndef<PublicKey>;
    priceFunctionType?: MaybeUndef<PriceFunctionType>;
    priceParams?: MaybeUndef<Array<number>>;
    publicSaleStartTime: Maybe<number>;
    saleEndTime: Maybe<number>;
    startingPriceLamports?: MaybeUndef<number>;
};
export default function auctionHouseUpdateEditionDistributorIx({ owner, mint, program, treasuryMint }: Accounts, { allowlistSalePrice, allowlistSaleStartTime, newOwner, priceFunctionType, priceParams, publicSaleStartTime, saleEndTime, startingPriceLamports, }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseUpdateEditionDistributorIx.d.ts.map