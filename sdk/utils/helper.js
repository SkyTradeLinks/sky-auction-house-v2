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
exports.findAuctionHouseTradeState = exports.findAuctionHouseBidderEscrowAccount = exports.getUSDC = exports.setupAirDrop = exports.loadKeyPairV2 = exports.loadKeyPair = void 0;
const fs_1 = __importDefault(require("fs"));
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
const loadKeyPair = (filename) => {
    const decodedKey = new Uint8Array(JSON.parse(fs_1.default.readFileSync(filename).toString()));
    let keyPair = anchor.web3.Keypair.fromSecretKey(decodedKey);
    return keyPair;
};
exports.loadKeyPair = loadKeyPair;
const loadKeyPairV2 = (key) => {
    const decodedKey = new Uint8Array(JSON.parse(key));
    const keyPair = anchor.web3.Keypair.fromSecretKey(decodedKey);
    return keyPair;
};
exports.loadKeyPairV2 = loadKeyPairV2;
const setupAirDrop = (connection, account) => __awaiter(void 0, void 0, void 0, function* () {
    if (connection.rpcEndpoint.includes("mainnet"))
        return;
    const latestBlockHash = yield connection.getLatestBlockhash();
    let amount;
    if (connection.rpcEndpoint.includes("localhost")) {
        amount = 1000;
    }
    else {
        amount = 1;
    }
    yield connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: yield connection.requestAirdrop(account, web3_js_1.LAMPORTS_PER_SOL * amount),
    });
});
exports.setupAirDrop = setupAirDrop;
const getUSDC = (connection, test_flag = false) => __awaiter(void 0, void 0, void 0, function* () {
    if (test_flag) {
        return new web3_js_1.PublicKey("BnXBBCnX8nZFxxeK9teZGJSHeCbnQ5PfzdS2RanrVnv7");
    }
    else {
        if (connection.rpcEndpoint.includes("mainnet")) {
            return new anchor.web3.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
        }
        else {
            // devnet | testnet
            return new anchor.web3.PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
        }
    }
});
exports.getUSDC = getUSDC;
const findAuctionHouseBidderEscrowAccount = (auctionHouse, wallet, merkleTree, auctionHouseProgramId) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.AUCTION_HOUSE),
        auctionHouse.toBuffer(),
        wallet.toBuffer(),
        merkleTree.toBuffer(),
    ], auctionHouseProgramId);
};
exports.findAuctionHouseBidderEscrowAccount = findAuctionHouseBidderEscrowAccount;
const findAuctionHouseTradeState = (auctionHouse, wallet, assetId, treasuryMint, merkleTree, buyPrice, auctionHouseProgramId) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.AUCTION_HOUSE),
        wallet.toBuffer(),
        auctionHouse.toBuffer(),
        assetId.toBuffer(),
        treasuryMint.toBuffer(),
        merkleTree.toBuffer(),
        buyPrice.toArrayLike(Buffer, "le", 8),
    ], auctionHouseProgramId);
};
exports.findAuctionHouseTradeState = findAuctionHouseTradeState;
