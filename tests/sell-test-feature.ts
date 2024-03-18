import * as anchor from "@coral-xyz/anchor";
// import expect from "chai";
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
    getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount
} from "@solana/spl-token";
import { SYSVAR_RENT_PUBKEY, Keypair, LAMPORTS_PER_SOL, } from "@solana/web3.js";

import { auctionHouseAuthority, BUY_PRICE, getAuthorityKeypair } from "../sdk/utils/constants";
import { loadKeyPair} from "../sdk/utils/helper"
import AuctionHouseSdk from "../sdk/auction-house-sdk";
import SaleType from "../sdk/types/SaleType";


describe("Sell test Auction", async () => {
    const endpoint = "https://devnet.helius-rpc.com/?api-key=887524e6-92b0-4f96-973c-b37a53a9cfe4";
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const connection = provider.connection;



    const program = anchor.workspace.AuctionHouse as Program<AuctionHouse>;
    const seller1 = Keypair.generate();
    
    // const landMerkleTree = new anchor.web3.PublicKey(
    //     "BQi6mDUZVwJvSV3PcWHTVFtP5jRgFDPNrqnTJYhv5c6B"
    // );
    const seller = new anchor.web3.PublicKey(
        "73ajJBDet2TbccHesc1CgHcMbDG83fafiy5iP3iGCEYL"
    );
    const imposter = Keypair.generate();

    
    
    
    let landMerkleTree;
    let auctionHouseSdk: AuctionHouseSdk;

    let asset_id;
    let umi;
    let leavesData = [];
    let accountsToPass = [];
    let owner;
    let assetWithProof;
    let tokenAccount;
    
    
    before(async () => {
        // Setup airdrop 
        const airdropSignature = await connection.requestAirdrop(seller1.publicKey, 1 * LAMPORTS_PER_SOL)
        const latestBlockHash = await connection.getLatestBlockhash();
        const confirmation = await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature,
        });
        const airdropSignature1 = await connection.requestAirdrop(imposter.publicKey, 1 * LAMPORTS_PER_SOL)
        const latestBlockHash1 = await connection.getLatestBlockhash();
        const confirmation1 = await connection.confirmTransaction({
            blockhash: latestBlockHash1.blockhash,
            lastValidBlockHeight: latestBlockHash1.lastValidBlockHeight,
            signature: airdropSignature1,
        });

        // Initialize Sdk
        auctionHouseSdk = await AuctionHouseSdk.getInstance(program, provider);
        umi = auctionHouseSdk.getCustomUmi();
        const authorityKeypair = getAuthorityKeypair();
        const signer = createSignerFromKeypair(umi, {
            secretKey: authorityKeypair.secretKey,
            publicKey: publicKey(authorityKeypair.publicKey)
        });
        umi.use(signerIdentity(signer));        
    });

    it("should successfully mint rental token and sell", async () => {
        // create merkleTree
        const merkleTree = generateSigner(umi);
        landMerkleTree = new anchor.web3.PublicKey(merkleTree.publicKey);

        const builder = await createTree(umi, {
            merkleTree,
            maxDepth: 14,
            maxBufferSize: 64,
        })
        await builder.sendAndConfirm(umi);
        // Wait for 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));
        let land_nfts = [0];
                                
        try {       
            const sig = await mintV1(umi, {
                leafOwner: publicKey(seller1.publicKey),
                merkleTree: publicKey(merkleTree),
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
            }).sendAndConfirm(umi);
            console.log("CNFT MINT SIG", sig)

            // Wait for 10 seconds
            await new Promise(resolve => setTimeout(resolve, 10000));

            const [assetId] = await findLeafAssetIdPda(umi, {
                merkleTree: publicKey(merkleTree),
                leafIndex: 0,
            });
            asset_id = assetId;

            const rpcAsset = await umi.rpc.getAsset(assetId)

            console.log("AssetId", asset_id)
            // console.log("Rpc-Asset", rpcAsset)

            assetWithProof = await getAssetWithProof(umi, assetId);

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
                pubkey: owner,
                isSigner: false,
                isWritable: true,
            });

            
        } catch (error) {
            console.log(error)
                
        }
        tokenAccount = await createAssociatedTokenAccount(
            connection,
            seller1,
            auctionHouseSdk.mintAccount,
            owner
        );

        console.log("TokenAccount", tokenAccount)
        
        const tx = await auctionHouseSdk.sell(SaleType.Auction, true, accountsToPass, new anchor.web3.PublicKey(asset_id), {
            priceInLamports: BUY_PRICE * LAMPORTS_PER_SOL,
            merkleTree: landMerkleTree,
            paymentAccount: tokenAccount,
            wallet: owner
        }, {tokenSize: 1})
        console.log(tx);



    })

    // it("should fail if an imposter tries to sell", async () => {
    //     // const accounts_to_pass = [];
    //     // accounts_to_pass.push({
    //     //     pubkey: imposter.publicKey,
    //     //     isSigner: true,
    //     //     isWritable: true,
    //     // });

    //     try {
    //         await auctionHouseSdk.sell(SaleType.Auction, true, accountsToPass, new anchor.web3.PublicKey(asset_id), {
    //             priceInLamports: BUY_PRICE * LAMPORTS_PER_SOL,
    //             merkleTree: landMerkleTree,
    //             paymentAccount: tokenAccount,
    //             wallet: imposter.publicKey
    //         }, {
    //             tokenSize: 1,
    //         });
    //         // If the above line didn't throw an error, fail the test
    //         // expect(true).toBe(false); // Ensure the test fails if the line above didn't throw an error
    //     } catch (error) {
    //         console.error()
    //         // Expect an error to be thrown
    //         // expect(error).toBeDefined();
    //         // Add additional assertions on the error if needed
    //     }
    // });

});