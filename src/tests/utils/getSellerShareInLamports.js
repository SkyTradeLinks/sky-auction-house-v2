"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
// Get remaining amount after paying auction house fees + creator royalties for secondary sales
function getSellerShareInLamports(buyPriceInSol, creatorRoyaltiesBasisPoints) {
    const buyPriceInLamports = buyPriceInSol * web3_js_1.LAMPORTS_PER_SOL;
    const auctionHouseFeePercentage = AuctionHouse_1.BASIS_POINTS_SECONDARY * 1e-4; // 1%
    const feesPaid = buyPriceInLamports * auctionHouseFeePercentage;
    const royaltiesPaid = buyPriceInLamports * creatorRoyaltiesBasisPoints * 1e-4;
    return buyPriceInLamports - feesPaid - royaltiesPaid;
}
exports.default = getSellerShareInLamports;
