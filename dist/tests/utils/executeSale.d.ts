import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
export default function executeSale(connection: Connection, sdk: AuctionHouseSdk, tokenMint: PublicKey, buyer: {
    tokenAccount: PublicKey;
    wallet: Keypair;
}, sellers: Array<{
    basisPoints: number;
    isExecutingSale: boolean;
    share: number;
    tokenAccount?: PublicKey;
    wallet: Keypair;
}>, buyPrice: number, sellPrice: number, signer?: Keypair): Promise<void>;
//# sourceMappingURL=executeSale.d.ts.map