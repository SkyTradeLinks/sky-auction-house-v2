import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import MerkleAllowlistBuyersList from "types/merkle-tree/MerkleAllowlistBuyersList";
export default function createEditionAllowlist({ auctionHouseSdk, buyers, connection, mint, auctionHouseAuthorityKeypair, }: {
    auctionHouseAuthorityKeypair: Keypair;
    auctionHouseSdk: AuctionHouseSdk;
    buyers: Array<Keypair>;
    connection: Connection;
    mint: PublicKey;
}): Promise<Array<MerkleAllowlistBuyersList>>;
//# sourceMappingURL=createEditionAllowlist.d.ts.map