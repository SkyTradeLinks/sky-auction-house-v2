import { Maybe } from "@formfunction-hq/formfunction-program-shared";
import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { AccountMeta, Connection, Keypair, PublicKey, SendOptions } from "@solana/web3.js";
import AuctionHouseSdk from "solana/auction-house/AuctionHouseSdk";
import AuctionHouseProgram from "types/AuctionHouseProgram";
import MerkleAllowlistBuyerWithProof from "types/merkle-tree/MerkleAllowlistBuyerWithProof";
export default function buyEditionForTest({ auctionHouseAccount, auctionHouseSdk, buyerKeypair, buyerWithAllowlistProofData, connection, metadataData, nftOwner, price, proofTreeIndex, remainingAccounts, sendOptions, signers, tokenMint, }: {
    auctionHouseAccount: Awaited<ReturnType<AuctionHouseProgram["account"]["auctionHouse"]["fetch"]>>;
    auctionHouseSdk: AuctionHouseSdk;
    buyerKeypair: Keypair;
    buyerWithAllowlistProofData?: Maybe<MerkleAllowlistBuyerWithProof>;
    connection: Connection;
    metadataData: DataV2;
    nftOwner: Keypair;
    price: number;
    proofTreeIndex?: Maybe<number>;
    remainingAccounts: Array<AccountMeta>;
    sendOptions?: SendOptions;
    signers?: Array<Keypair>;
    tokenMint: PublicKey;
}): Promise<{
    newMintKeypair: Keypair;
    txid: string;
}>;
//# sourceMappingURL=buyEditionForTest.d.ts.map