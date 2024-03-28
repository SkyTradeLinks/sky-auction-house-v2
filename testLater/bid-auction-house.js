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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@coral-xyz/anchor"));
const auction_house_sdk_1 = require("../sdk/auction-house-sdk");
const helper_1 = require("../sdk/utils/helper");
const spl_token_1 = require("@solana/spl-token");
const constants_1 = require("../sdk/utils/constants");
const mpl_bubblegum_1 = require("@metaplex-foundation/mpl-bubblegum");
const umi_1 = require("@metaplex-foundation/umi");
const SaleType_1 = __importDefault(require("../sdk/types/enum/SaleType"));
require("dotenv/config");
describe("bid-auction-house", () => __awaiter(void 0, void 0, void 0, function* () {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.AuctionHouse;
    let auctionHouseSdk;
    const bidder = (0, helper_1.loadKeyPair)(process.env.BIDDER_KEYPAIR);
    let bidderAta;
    // land merkle tree
    const landMerkleTree = new anchor.web3.PublicKey("BQi6mDUZVwJvSV3PcWHTVFtP5jRgFDPNrqnTJYhv5c6B");
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        auctionHouseSdk = yield auction_house_sdk_1.AuctionHouseSdk.getInstance(program, provider);
        // setup airdrop
        try {
            yield (0, helper_1.setupAirDrop)(provider.connection, bidder.publicKey);
        }
        catch (err) { }
        try {
            yield (0, helper_1.setupAirDrop)(provider.connection, auctionHouseSdk.feeAccount);
        }
        catch (err) { }
        bidderAta = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(provider.connection, bidder, auctionHouseSdk.mintAccount, bidder.publicKey);
        // mint usdc
        yield (0, spl_token_1.mintTo)(provider.connection, bidder, auctionHouseSdk.mintAccount, bidderAta.address, constants_1.auctionHouseAuthority, 10 * Math.pow(10, 6));
    }));
    // airdrop
    // fund mint account with dev-usdc
    it("should make an offer on un-listed asset", () => __awaiter(void 0, void 0, void 0, function* () {
        let leafIndex = 0;
        // dummy nft created
        const [assetId] = (0, mpl_bubblegum_1.findLeafAssetIdPda)(auctionHouseSdk.umi, {
            merkleTree: (0, umi_1.publicKey)(landMerkleTree),
            leafIndex,
        });
        // USD
        let cost = 22;
        yield auctionHouseSdk.buy(bidder, new anchor.web3.PublicKey(assetId.toString()), landMerkleTree, bidderAta.address, cost, leafIndex, SaleType_1.default.Offer);
        const [escrowPaymentAccount, escrowBump] = (0, helper_1.findAuctionHouseBidderEscrowAccount)(auctionHouseSdk.auctionHouse, bidder.publicKey, landMerkleTree, program.programId);
        let acc = yield (0, spl_token_1.getAssociatedTokenAddress)(auctionHouseSdk.mintAccount, bidder.publicKey);
        let acc_balance = yield provider.connection.getTokenAccountBalance(acc);
        console.log(acc_balance);
        // // console.log(
        // //   await this.provider.connection.getBalance(escrowPaymentAccount)
        // // );
        // console.log(lastBidInfo);
        try {
        }
        catch (err) { }
    }));
}));
