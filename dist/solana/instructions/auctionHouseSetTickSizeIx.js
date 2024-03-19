"use strict";
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
const bn_js_1 = require("bn.js");
const findLastBidPrice_1 = __importDefault(require("solana/pdas/findLastBidPrice"));
function auctionHouseSetTickSizeIx({ auctionHouse, auctionHouseProgramId, authority, owner, program, tokenAccount, tokenMint, treasuryMint, }, { tickSizeConstantInLamports }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseProgramId);
        return program.methods
            .setTickSize(new bn_js_1.BN(tickSizeConstantInLamports), 0, new bn_js_1.BN(0), new bn_js_1.BN(0))
            .accounts({
            auctionHouse,
            authority,
            lastBidPrice,
            mint: tokenMint,
            owner,
            tokenAccount,
            treasuryMint,
        })
            .instruction();
    });
}
exports.default = auctionHouseSetTickSizeIx;
//# sourceMappingURL=auctionHouseSetTickSizeIx.js.map