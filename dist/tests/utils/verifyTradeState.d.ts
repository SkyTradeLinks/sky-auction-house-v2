import { Connection, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import SaleType from "types/enum/SaleType";
export default function verifyTradeState(sdk: AuctionHouseSdk, connection: Connection, { wallet, tokenAccount, tokenMint, expectNull, priceInSol, saleType, size, }: {
    expectNull: boolean;
    priceInSol: number;
    saleType?: SaleType;
    size?: number;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    wallet: PublicKey;
}): Promise<void>;
//# sourceMappingURL=verifyTradeState.d.ts.map