import { DataV2 } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
export default function getTestMetadata(...creators: Array<{
    address: PublicKey;
    share: number;
    verified: boolean;
}>): DataV2;
//# sourceMappingURL=getTestMetadata.d.ts.map