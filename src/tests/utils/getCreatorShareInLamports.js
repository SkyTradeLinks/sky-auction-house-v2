"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const AuctionHouse_1 = require("tests/constants/AuctionHouse");
function getCreatorShareInLamports(buyPriceInSol, creatorShare, basisPoints, isPrimary) {
    const buyPriceInLamports = buyPriceInSol * web3_js_1.LAMPORTS_PER_SOL;
    const auctionHouseFeePercentage = isPrimary
        ? AuctionHouse_1.BASIS_POINTS * 1e-4 // 10%
        : AuctionHouse_1.BASIS_POINTS_SECONDARY * 1e-4; // 1%
    const priceWithoutFees = buyPriceInLamports - buyPriceInLamports * auctionHouseFeePercentage;
    const royalties = isPrimary
        ? priceWithoutFees // primary: creators split all
        : buyPriceInLamports * (basisPoints * 1e-4); // secondary: creators only split royalties based on bps
    return royalties * (creatorShare / 100);
}
exports.default = getCreatorShareInLamports;
