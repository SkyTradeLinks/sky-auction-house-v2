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
console.log(program)