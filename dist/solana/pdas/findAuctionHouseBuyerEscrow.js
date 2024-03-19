"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const SolanaConstants_1 = require("constants/SolanaConstants");
function findAuctionHouseBuyerEscrow(auctionHouse, wallet, tokenMint, auctionHouseProgramId) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(SolanaConstants_1.AUCTION_HOUSE),
        auctionHouse.toBuffer(),
        wallet.toBuffer(),
        tokenMint.toBuffer(),
    ], auctionHouseProgramId);
}
exports.default = findAuctionHouseBuyerEscrow;
//# sourceMappingURL=findAuctionHouseBuyerEscrow.js.map