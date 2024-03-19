import { AssetData } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
export default function getProgrammableNftAssetData({ creators, }: {
    creators: Array<{
        address: PublicKey;
        share: number;
        verified: boolean;
    }>;
}): AssetData;
//# sourceMappingURL=getProgrammableNftAssetData.d.ts.map