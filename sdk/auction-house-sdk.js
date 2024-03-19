"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionHouseSdk = void 0;
const anchor = __importStar(require("@coral-xyz/anchor"));
const constants_1 = require("./utils/constants");
const helper_1 = require("./utils/helper");
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const mpl_bubblegum_1 = require("@metaplex-foundation/mpl-bubblegum");
const umi_1 = require("@metaplex-foundation/umi");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
class AuctionHouseSdk {
    constructor(program, provider) {
        this.program = program;
        this.provider = provider;
        this.sendVersionedTransaction = (tx, signers = [], options) => __awaiter(this, void 0, void 0, function* () {
            const signersList = [...signers];
            // if (this.addressLookupTable == undefined) {
            return (0, web3_js_1.sendAndConfirmTransaction)(this.provider.connection, tx, signersList, options);
            // }
            const addressLookupTable = yield this.provider.connection.getAddressLookupTable(this.addressLookupTable);
            const blockhash = yield this.provider.connection.getLatestBlockhash();
            const transactionMessage = new web3_js_1.TransactionMessage({
                instructions: tx.instructions,
                payerKey: constants_1.auctionHouseAuthority.publicKey,
                recentBlockhash: blockhash.blockhash,
            }).compileToV0Message([addressLookupTable.value]);
            const transaction = new web3_js_1.VersionedTransaction(transactionMessage);
            transaction.sign(signersList);
            const txid = yield this.provider.connection.sendTransaction(transaction, options);
            return txid;
        });
    }
    static getInstance(program, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!AuctionHouseSdk.instance) {
                AuctionHouseSdk.instance = new AuctionHouseSdk(program, provider);
                yield AuctionHouseSdk.instance.setup();
            }
            return AuctionHouseSdk.instance;
        });
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            const umi = (0, umi_bundle_defaults_1.createUmi)(this.provider.connection.rpcEndpoint).use((0, mpl_bubblegum_1.mplBubblegum)());
            umi.use((0, umi_1.signerIdentity)((0, umi_1.createSignerFromKeypair)(umi, {
                secretKey: constants_1.auctionHouseAuthority.secretKey,
                publicKey: (0, umi_1.publicKey)(constants_1.auctionHouseAuthority.publicKey),
            })));
            this.umi = umi;
            yield (0, helper_1.setupAirDrop)(this.provider.connection, constants_1.auctionHouseAuthority.publicKey);
            try {
                this.addressLookupTable = new anchor.web3.PublicKey(process.env.LOOKUP_TABLE_ADDRESS);
            }
            catch (err) { }
            this.mintAccount = yield (0, helper_1.getUSDC)(this.provider.connection, true);
            const [auctionHouse, auctionHouseBump] = anchor.web3.PublicKey.findProgramAddressSync([
                Buffer.from(constants_1.AUCTION_HOUSE),
                constants_1.auctionHouseAuthority.publicKey.toBuffer(),
                this.mintAccount.toBuffer(),
            ], this.program.programId);
            this.auctionHouse = auctionHouse;
            this.auctionHouseBump = auctionHouseBump;
            const [feeAccount, feeBump] = anchor.web3.PublicKey.findProgramAddressSync([
                Buffer.from(constants_1.AUCTION_HOUSE),
                this.auctionHouse.toBuffer(),
                Buffer.from(constants_1.FEE_PAYER),
            ], this.program.programId);
            this.feeAccount = feeAccount;
            this.feeBump = feeBump;
            const [treasuryAccount, treasuryBump] = anchor.web3.PublicKey.findProgramAddressSync([
                Buffer.from(constants_1.AUCTION_HOUSE),
                auctionHouse.toBuffer(),
                Buffer.from(constants_1.TREASURY),
            ], this.program.programId);
            this.treasuryAccount = treasuryAccount;
            this.treasuryBump = treasuryBump;
        });
    }
    findLastBidPrice(assetId) {
        return anchor.web3.PublicKey.findProgramAddressSync([
            Buffer.from(constants_1.LAST_BID_PRICE),
            this.auctionHouse.toBuffer(),
            assetId.toBuffer(),
        ], this.program.programId);
    }
    createLastBidPriceTx(assetId, lastBidPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.program.methods
                .createLastBidPrice()
                .accounts({
                systemProgram: anchor.web3.SystemProgram.programId,
                wallet: constants_1.auctionHouseAuthority.publicKey,
                lastBidPrice,
                auctionHouse: this.auctionHouse,
                assetId,
            })
                .instruction();
        });
    }
    sendTx(tx, signers, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const txid = yield this.sendVersionedTransaction(tx, signers, options);
                const blockhash = yield this.provider.connection.getLatestBlockhash();
                yield this.provider.connection.confirmTransaction({
                    blockhash: blockhash.blockhash,
                    lastValidBlockHeight: blockhash.lastValidBlockHeight,
                    signature: txid,
                }, "confirmed");
                return txid;
            }
            catch (err) {
                throw err;
            }
        });
    }
    createBuyTx(price, buyer, assetId, merkleTree, previousBidder, lastBidPrice, buyerAta, leafIndex, saleType) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = new anchor.web3.Transaction();
            let normalizedPrice = new anchor.BN(price * Math.pow(10, 6));
            const [tradeState, tradeStateBump] = (0, helper_1.findAuctionHouseTradeState)(this.auctionHouse, buyer, assetId, this.mintAccount, merkleTree, normalizedPrice, this.program.programId);
            const [escrowPaymentAccount, escrowBump] = (0, helper_1.findAuctionHouseBidderEscrowAccount)(this.auctionHouse, buyer, merkleTree, this.program.programId);
            const [previousBidderEscrowPaymentAccount, previousBidderEscrowPaymentBump,] = (0, helper_1.findAuctionHouseBidderEscrowAccount)(this.auctionHouse, previousBidder, merkleTree, this.program.programId);
            let previousBidderRefundAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(this.mintAccount, previousBidder);
            tx.add(yield this.program.methods
                .createTradeState(tradeStateBump, normalizedPrice, saleType, null)
                .accounts({
                auctionHouse: this.auctionHouse,
                auctionHouseFeeAccount: this.feeAccount,
                authority: constants_1.auctionHouseAuthority.publicKey,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                systemProgram: anchor.web3.SystemProgram.programId,
                assetId,
                merkleTree,
                tradeState,
                wallet: buyer,
            })
                .instruction(), yield this.program.methods
                .buyV2(tradeStateBump, escrowBump, normalizedPrice, new anchor.BN(leafIndex), null, previousBidderEscrowPaymentBump)
                .accounts({
                wallet: buyer,
                paymentAccount: buyerAta,
                transferAuthority: buyer,
                treasuryMint: this.mintAccount,
                assetId: assetId,
                escrowPaymentAccount,
                authority: constants_1.auctionHouseAuthority.publicKey,
                auctionHouse: this.auctionHouse,
                auctionHouseFeeAccount: this.feeAccount,
                buyerTradeState: tradeState,
                merkleTree,
                lastBidPrice,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                previousBidderWallet: previousBidder,
                previousBidderEscrowPaymentAccount,
                previousBidderRefundAccount,
                ataProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            })
                .instruction());
            return tx;
        });
    }
    buy(buyer, assetId, merkleTree, buyerAta, price, leafIndex, saleType) {
        return __awaiter(this, void 0, void 0, function* () {
            const [lastBidPrice] = this.findLastBidPrice(assetId);
            if ((yield this.provider.connection.getAccountInfo(lastBidPrice)) == null) {
                const createBidTx = new anchor.web3.Transaction().add(yield this.createLastBidPriceTx(assetId, lastBidPrice));
                yield this.sendTx(createBidTx, [constants_1.auctionHouseAuthority]);
            }
            let lastBidInfo = yield this.program.account.lastBidPrice.fetch(lastBidPrice);
            let buyTx = yield this.createBuyTx(price, buyer.publicKey, assetId, merkleTree, lastBidInfo.bidder, lastBidPrice, buyerAta, leafIndex, saleType);
            yield this.sendTx(buyTx, [buyer]);
        });
    }
}
exports.AuctionHouseSdk = AuctionHouseSdk;
