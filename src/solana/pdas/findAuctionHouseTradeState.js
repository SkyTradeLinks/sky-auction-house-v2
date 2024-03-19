"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const SolanaConstants_1 = require("constants/SolanaConstants");
function findAuctionHouseTradeState(auctionHouse, wallet, tokenAccount, treasuryMint, tokenMint, tokenSize, buyPrice, auctionHouseProgramId) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(SolanaConstants_1.AUCTION_HOUSE),
        wallet.toBuffer(),
        auctionHouse.toBuffer(),
        tokenAccount.toBuffer(),
        treasuryMint.toBuffer(),
        tokenMint.toBuffer(),
        buyPrice.toArrayLike(Buffer, "le", 8),
        tokenSize.toArrayLike(Buffer, "le", 8),
    ], auctionHouseProgramId);
}
exports.default = findAuctionHouseTradeState;
