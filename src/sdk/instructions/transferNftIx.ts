import { transfer } from "@metaplex-foundation/mpl-bubblegum";
import {
  Umi,
  createNoopSigner,
  publicKey,
  publicKeyBytes,
} from "@metaplex-foundation/umi";
import {
  toWeb3JsInstruction,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { PublicKey } from "@solana/web3.js";

const transferNftIx = async (
  umi: Umi,
  assetId: PublicKey,
  newOwner: PublicKey
) => {
  const rpcAsset = await umi.rpc.getAsset(publicKey(assetId));
  const rpcAssetProof = await umi.rpc.getAssetProof(publicKey(assetId));
  // console.log("RPC ASSET", rpcAssetProof);

  const leafDelegate = createNoopSigner(rpcAsset.ownership.delegate);
  console.log("ASSET_OWNER.....", rpcAsset.ownership.owner);
  console.log("NEW_ASSET_OWNER.....", newOwner);

  let umiTx = await transfer(umi, {
    leafOwner: rpcAsset.ownership.owner,
    leafDelegate,
    newLeafOwner: publicKey(newOwner),
    merkleTree: rpcAssetProof.tree_id,
    root: publicKeyBytes(rpcAssetProof.root),
    dataHash: publicKeyBytes(rpcAsset.compression.data_hash),
    creatorHash: publicKeyBytes(rpcAsset.compression.creator_hash),
    nonce: rpcAsset.compression.leaf_id,
    index: rpcAssetProof.node_index - 2 ** rpcAssetProof.proof.length,
    // index: rpcAssetProof.node_index,
    proof: rpcAssetProof.proof,
  }).setLatestBlockhash(umi);

  let ix = umiTx.getInstructions();

  let transferIx = ix.map((el) => toWeb3JsInstruction(el));

  return transferIx;
};

export default transferNftIx;
