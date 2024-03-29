import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";
import { AuctionHouseSdk } from "../sdk/auction-house-sdk";
import {
  findAuctionHouseBidderEscrowAccount,
  loadKeyPair,
  setupAirDrop,
} from "../sdk/utils/helper";
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { auctionHouseAuthority } from "../sdk/utils/constants";
import { findLeafAssetIdPda } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey } from "@metaplex-foundation/umi";
import SaleType from "../sdk/types/enum/SaleType";
import "dotenv/config";



const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;
const bidder = loadKeyPair(process.env.BIDDER_KEYPAIR);
console.log(bidder.publicKey)
let bidderAta;
let auctionHouseSdk: AuctionHouseSdk;

// land merkle tree
const landMerkleTree = new anchor.web3.PublicKey(
  "BQi6mDUZVwJvSV3PcWHTVFtP5jRgFDPNrqnTJYhv5c6B"
);
async function main(){
  auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);


//setup

/*   try {
  await setupAirDrop(provider.connection, bidder.publicKey);
} catch (err) {
  console.log(err)
}

try {
  await setupAirDrop(provider.connection, auctionHouseSdk.feeAccount);
} catch (err) {} */


//adding usdc-dev to bidderAta

bidderAta = await getOrCreateAssociatedTokenAccount(
  provider.connection,
  bidder,
  auctionHouseSdk.mintAccount,
  bidder.publicKey
);
console.log('bidder ata',bidderAta)
 // mint usdc
 /* 
 await mintTo(
  provider.connection,
  bidder,
  auctionHouseSdk.mintAccount,
  bidderAta.address,
  auctionHouseAuthority,
  10 * Math.pow(10, 6)
); */
let leafIndex = 1;
const [assetId] = findLeafAssetIdPda(auctionHouseSdk.umi, {
  merkleTree: publicKey(landMerkleTree),
  leafIndex,
});
console.log('li',assetId)

// USD
let cost = 1;

/*      await auctionHouseSdk.buy(
   bidder,
  new anchor.web3.PublicKey(assetId.toString()),
  landMerkleTree,
  bidderAta.address,
  cost,
  leafIndex,
  SaleType.Offer 
);  */    
   await auctionHouseSdk.cancel(
  bidder,
 new anchor.web3.PublicKey(assetId.toString()),
 landMerkleTree,
 bidderAta.address,
 cost,
 leafIndex,
 SaleType.Offer 
);   
}

main().then(()=>{process.exit(0)}).catch((e)=>console.log('error art main',e))