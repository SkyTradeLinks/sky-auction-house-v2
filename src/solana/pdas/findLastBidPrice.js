"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const SolanaConstants_1 = require("constants/SolanaConstants");
const getSolAuctionHouseAccountByProgramId_1 = __importDefault(require("solana/auction-house/getSolAuctionHouseAccountByProgramId"));
function findLastBidPrice(mint, auctionHouseProgramId) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(SolanaConstants_1.LAST_BID_PRICE),
        (0, getSolAuctionHouseAccountByProgramId_1.default)(auctionHouseProgramId).toBuffer(),
        mint.toBuffer(),
    ], auctionHouseProgramId);
}
exports.default = findLastBidPrice;
