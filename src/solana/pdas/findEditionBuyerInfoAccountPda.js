"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const SolanaConstants_1 = require("constants/SolanaConstants");
function findEditionBuyerInfoAccountPda(mint, buyer, auctionHouseProgramId) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(SolanaConstants_1.EDITION_BUYER_INFO_ACCOUNT),
        mint.toBuffer(),
        buyer.toBuffer(),
    ], auctionHouseProgramId);
}
exports.default = findEditionBuyerInfoAccountPda;
