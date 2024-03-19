import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import AuctionHouseProgram from "types/AuctionHouseProgram";
import SaleType from "types/enum/SaleType";
type Accounts = {
    auctionHouse: PublicKey;
    auctionHouseFeeAccount: PublicKey;
    auctionHouseProgramId: PublicKey;
    authority: PublicKey;
    program: AuctionHouseProgram;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    treasuryMint: PublicKey;
    wallet: PublicKey;
};
type Args = {
    allocationSize?: Maybe<number>;
    priceInLamports: number;
    saleType: SaleType;
    tokenSize?: number;
};
export default function auctionHouseCreateTradeStateIx({ auctionHouse, auctionHouseFeeAccount, auctionHouseProgramId, authority, program, tokenAccount, tokenMint, treasuryMint, wallet, }: Accounts, { allocationSize, priceInLamports, saleType, tokenSize }: Args): Promise<TransactionInstruction>;
export {};
//# sourceMappingURL=auctionHouseCreateTradeStateIx.d.ts.map