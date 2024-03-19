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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@project-serum/anchor"));
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
const getIdl_1 = __importDefault(require("tests/utils/getIdl"));
function getProvider(walletKeyPair) {
    const url = process.env.ANCHOR_PROVIDER_URL;
    if (url === undefined) {
        throw new Error("ANCHOR_PROVIDER_URL is not defined");
    }
    const options = anchor_1.AnchorProvider.defaultOptions();
    const connection = new web3_js_1.Connection(url, options.commitment);
    const walletWrapper = new anchor.Wallet(walletKeyPair);
    return new anchor_1.AnchorProvider(connection, walletWrapper, options);
}
function getProgram(walletKeyPair) {
    const program = new anchor.Program((0, getIdl_1.default)(), AuctionHouse_1.AUCTION_HOUSE_PROGRAM_ID, getProvider(walletKeyPair));
    return program;
}
exports.default = getProgram;
