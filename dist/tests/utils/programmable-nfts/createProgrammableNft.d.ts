import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
type MintProgrammableNftResult = {
    masterEdition: PublicKey;
    metadata: PublicKey;
    metadataAccount: Metadata;
    mint: PublicKey;
};
export default function createProgrammableNft({ connection, creator, metadataCreators, }: {
    connection: Connection;
    creator: Keypair;
    metadataCreators: Array<{
        address: PublicKey;
        share: number;
        verified: boolean;
    }>;
}): Promise<MintProgrammableNftResult>;
export {};
//# sourceMappingURL=createProgrammableNft.d.ts.map