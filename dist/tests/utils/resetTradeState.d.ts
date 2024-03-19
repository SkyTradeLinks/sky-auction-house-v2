import { Connection, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
export default function resetTradeState(sdk: AuctionHouseSdk, connection: Connection, { priceInSol, tokenAccount, tokenMint, wallet, }: {
    priceInSol: number;
    tokenAccount: PublicKey;
    tokenMint: PublicKey;
    wallet: PublicKey;
}): Promise<void>;
//# sourceMappingURL=resetTradeState.d.ts.map