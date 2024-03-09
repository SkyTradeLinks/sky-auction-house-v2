import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { SYSVAR_RENT_PUBKEY, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";

import { auctionHouseAuthority, BUY_PRICE } from "../sdk/utils/constants";
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import SaleType from "../sdk/types/SaleType";


describe("Sell test Auction", async () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;

    const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;
    const seller = Keypair.generate();

    let auctionHouseSdk: AuctionHouseSdk;

    before(async () => {
        auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);
   
    });

    it("Should Sell", async () => {

        try {
            const tokenAddress = await getAssociatedTokenAddress(
            auctionHouseSdk.mintAccount,
            auctionHouseAuthority.publicKey,
            true,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID 
        );
        const tx = await auctionHouseSdk.sell(SaleType.Auction, true, {
            priceInLamports: BUY_PRICE * LAMPORTS_PER_SOL,
            tokenAccount: tokenAddress,
            tokenMint: auctionHouseSdk.mintAccount,
            wallet: seller.publicKey

        }, {
            tokenSize: 1
        })
            console.log(tx);
        
        } catch (error) {
        console.error(error)
        console.log("Sell Tx failed ", error);
        
        }

    })
});