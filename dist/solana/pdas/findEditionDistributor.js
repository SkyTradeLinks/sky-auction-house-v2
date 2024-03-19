"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const SolanaConstants_1 = require("constants/SolanaConstants");
function findEditionDistributor(mint, auctionHouseProgramId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SolanaConstants_1.EDITION_DISTRIBUTOR), mint.toBuffer()], auctionHouseProgramId);
}
exports.default = findEditionDistributor;
//# sourceMappingURL=findEditionDistributor.js.map