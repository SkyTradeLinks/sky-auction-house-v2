import { PublicKey } from "@solana/web3.js";
import MerkleAllowlistBuyerInfo from "types/merkle-tree/MerkleAllowlistBuyerInfo";
import MerkleAllowlistBuyersList from "types/merkle-tree/MerkleAllowlistBuyersList";
export default function constructMerkleEditionAllowlist(masterEditionMint: PublicKey, buyers: Array<MerkleAllowlistBuyerInfo>, merkleTreeLeafSizeLimit?: number): Array<MerkleAllowlistBuyersList>;
//# sourceMappingURL=constructMerkleEditionAllowlist.d.ts.map