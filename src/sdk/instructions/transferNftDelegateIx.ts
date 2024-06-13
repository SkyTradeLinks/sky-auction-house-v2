import {
  Umi,
  publicKey,
  createNoopSigner,
  publicKeyBytes,
} from "@metaplex-foundation/umi";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import { delegate } from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey } from "@solana/web3.js";

const transferNftDelegateIx = async (
  umi: Umi,
  assetId: PublicKey,
  newDelegate: PublicKey
) => {
  const rpcAsset = await umi.rpc.getAsset(publicKey(assetId));
  const rpcAssetProof = await umi.rpc.getAssetProof(publicKey(assetId));

  const leafOwner = createNoopSigner(rpcAsset.ownership.owner);

  let umiTx = await delegate(umi, {
    leafOwner,
    previousLeafDelegate:
      rpcAsset.ownership.delegate ?? rpcAsset.ownership.owner,
    newLeafDelegate: publicKey(newDelegate),
    merkleTree: rpcAssetProof.tree_id,
    root: publicKeyBytes(rpcAssetProof.root),
    dataHash: publicKeyBytes(rpcAsset.compression.data_hash),
    creatorHash: publicKeyBytes(rpcAsset.compression.creator_hash),
    nonce: rpcAsset.compression.leaf_id,
    index: rpcAssetProof.node_index - 2 ** rpcAssetProof.proof.length,
    proof: rpcAssetProof.proof,
  }).setLatestBlockhash(umi);

  let ix = umiTx.getInstructions();

  let delegateIxs = ix.map((el) => toWeb3JsInstruction(el));

  return delegateIxs;
};

export default transferNftDelegateIx;
