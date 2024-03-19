import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import SaleType from "types/enum/SaleType";
export default function buy(connection: Connection, sdk: AuctionHouseSdk, priceInSol: number, tokenMint: PublicKey, tokenAccount: PublicKey, walletBuyer: Keypair, previousBidderWallet: PublicKey, saleType?: SaleType, checkEscrow?: boolean): Promise<void>;
//# sourceMappingURL=buy.d.ts.map