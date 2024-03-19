/// <reference types="@metaplex-foundation/mpl-token-metadata/node_modules/@solana/web3.js" />
import { Connection, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
export default function getBuyerEscrowLamports(connection: Connection, sdk: AuctionHouseSdk, walletBuyer: import("@solana/web3.js").Keypair, tokenMint: PublicKey): Promise<number>;
//# sourceMappingURL=getBuyerEscrowLamports.d.ts.map