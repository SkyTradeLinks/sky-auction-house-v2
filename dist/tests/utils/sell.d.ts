import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import SaleType from "types/enum/SaleType";
export default function sell(connection: Connection, sdk: AuctionHouseSdk, tokenMint: PublicKey, tokenAccount: PublicKey, seller: Keypair, priceInSol: number, saleType?: SaleType): Promise<void>;
//# sourceMappingURL=sell.d.ts.map