import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuctionHouse } from "../target/types/auction_house";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
    none,
    generateSigner,
    signerIdentity,
    AccountNotFoundError,
    createSignerFromKeypair,
    publicKey,
} from '@metaplex-foundation/umi'
import {
    mintV1,
    mplBubblegum,
    createTree,
    findLeafAssetIdPda,
    parseLeafFromMintV1Transaction,
    LeafSchema,
    getAssetWithProof,
    transfer,
    fetchMerkleTree,
    TokenProgramVersion,
    TokenStandard,
    getMetadataArgsSerializer
} from '@metaplex-foundation/mpl-bubblegum'

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
  createAccount,
    createMint,
  createMultisig,
    getAssociatedTokenAddress,
    getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";
import { SYSVAR_RENT_PUBKEY, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";

import { auctionHouseAuthority, BUY_PRICE } from "../sdk/utils/constants";
import { loadKeyPair} from "../sdk/utils/helper"
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import SaleType from "../sdk/types/SaleType";


describe("Sell test Auction", async () => {
    const endpoint = "https://devnet.helius-rpc.com/?api-key=887524e6-92b0-4f96-973c-b37a53a9cfe4";
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;
    // const connection = new anchor.web3.Connection(endpoint);
    // provider.connection = connection;
    // const umi = createUmi(provider.connection.rpcEndpoint).use(mplBubblegum());
    // const umi = createUmi(endpoint).use(mplBubblegum());


    const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;
    const seller = Keypair.generate();
    const landMerkleTree = new anchor.web3.PublicKey(
        "BQi6mDUZVwJvSV3PcWHTVFtP5jRgFDPNrqnTJYhv5c6B"
    );
    const landOwner = new anchor.web3.PublicKey(
        "73ajJBDet2TbccHesc1CgHcMbDG83fafiy5iP3iGCEYL"
    );
    
    

    let auctionHouseSdk: AuctionHouseSdk;

    let asset_id;
    
    
    before(async () => {
        auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);

        

       

        
    });

    it("should successfully mint rental token and sell", async () => {
        let land_nfts = [0];
        

        let leavesData = [];
        let accountsToPass = [];
        let owner;

        for (let nft_index of land_nfts) {
            const [assetId, bump] = findLeafAssetIdPda(auctionHouseSdk.umi, {
                merkleTree: publicKey(landMerkleTree),
                leafIndex: nft_index,
            });
            
            let assetWithProof;
            try {
                assetWithProof = await getAssetWithProof(auctionHouseSdk.umi, assetId);

            
            } catch (error) {
                if (error.message.includes("Asset not found")) { 
                    const tx = await mintV1(auctionHouseSdk.umi, {
                        leafOwner: publicKey(seller.publicKey),
                        merkleTree: publicKey(landMerkleTree),
                        metadata: {
                            name: "Land NFT",
                            symbol: "",
                            uri: "",
                            creators: [],
                            sellerFeeBasisPoints: 0,
                            primarySaleHappened: false,
                            isMutable: false,
                            editionNonce: null,
                            uses: null,
                            collection: null,
                            tokenProgramVersion: TokenProgramVersion.Original,
                            tokenStandard: TokenStandard.NonFungible,
                        },
                    }).sendAndConfirm(auctionHouseSdk.umi);
                    console.log("CNFT MINT TX", tx)
                    const [assetId] = findLeafAssetIdPda(auctionHouseSdk.umi, {
                        merkleTree: publicKey(landMerkleTree),
                        leafIndex: 0,
                    });
                    asset_id = assetId;

                    const rpcAsset = await auctionHouseSdk.umi.rpc.getAsset(assetId)

                    console.log("AssetId", assetId)
                    console.log("Rpc-Asset", rpcAsset)

                    assetWithProof = await getAssetWithProof(auctionHouseSdk.umi, assetId);
                }
            }
            owner = new anchor.web3.PublicKey(assetWithProof.leafOwner);
            console.log("Owner", owner)

            let leafData = {
                leafIndex: new anchor.BN(assetWithProof.index),
                leafNonce: new anchor.BN(assetWithProof.nonce),
                owner,
                delegate:
                assetWithProof.leafDelegate != null
                    ? new anchor.web3.PublicKey(assetWithProof.leafDelegate)
                    : owner,
                root: new anchor.web3.PublicKey(assetWithProof.root),
                leafHash: [
                    ...new anchor.web3.PublicKey(
                        assetWithProof.rpcAssetProof.leaf.toString()
                    ).toBytes(),
                ],
                leafMetadata: Buffer.from(
                    getMetadataArgsSerializer().serialize(assetWithProof.metadata)
                ),
            };
            leavesData.push(leafData);

            // Push Owner
            accountsToPass.push({
                pubkey: seller.publicKey,
                isSigner: false,
                isWritable: true,
            });
            // let owner_ata = getAssociatedTokenAddressSync(auctionHouseSdk.mintAccount, owner);

            // accountsToPass.push({
            //     pubkey: owner_ata,
            //     isSigner: false,
            //     isWritable: true,
            // });

            // accountsToPass.push({
            //     pubkey: landMerkleTree,
            //     isSigner: false,
            //     isWritable: true,
            // });

           
            
        }
        


        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            seller,
            auctionHouseSdk.mintAccount,
            owner.publicKey
        );
        
        const tx = await auctionHouseSdk.sell(SaleType.Auction, true, accountsToPass, {
            priceInLamports: BUY_PRICE * LAMPORTS_PER_SOL,
            merkleTree: landMerkleTree,
            paymentAccount: new anchor.web3.PublicKey(tokenAccount),
            assetId: new anchor.web3.PublicKey(asset_id),
            wallet: seller
    
        }, {
            tokenSize: 1,
                    
        })
        console.log(tx);



    })

    // it("should successfully mint rental token and sell", async () => {

    //     // console.log("UMI", umi)
    //     // const merkleTree = generateSigner(umi)
    //     // const customTreeCreator = generateSigner(umi)


    //     // const assetWithProof = await getAssetWithProof(umi, assetId)
    //     // await transfer(umi, {
    //     // ...assetWithProof,
    //     // leafOwner: currentLeafOwner,
    //     // newLeafOwner: seller.publicKey,
    //     // }).sendAndConfirm(umi)

        
    //     // const tokenAddress = await getAssociatedTokenAddress(
    //     //         auctionHouseSdk.mintAccount,
    //     //         auctionHouseAuthority.publicKey,
    //     //         true,
    //     //         TOKEN_PROGRAM_ID,
    //     //         ASSOCIATED_TOKEN_PROGRAM_ID 
    //     // );
        

    //     // await createAccount(connection,
    //     //     seller,
    //     //     auctionHouseSdk.mintAccount,
    //     //     seller.publicKey,
    //     // )
      
    // });

});