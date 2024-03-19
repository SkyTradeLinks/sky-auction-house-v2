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
const anchor_1 = require("@project-serum/anchor");
const findAuctionHouseTradeState_1 = __importDefault(require("solana/pdas/findAuctionHouseTradeState"));
function getTradeState({ wallet, tokenAccount, tokenMint, priceInLamports, auctionHouse, treasuryMint, auctionHouseProgramId, tokenSize = 1, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const priceAdjusted = new anchor_1.BN(priceInLamports);
        const [tradeState, tradeStateBump] = (0, findAuctionHouseTradeState_1.default)(auctionHouse, wallet, tokenAccount, treasuryMint, tokenMint, new anchor_1.BN(tokenSize), priceAdjusted, auctionHouseProgramId);
        return [tradeState, tradeStateBump, priceAdjusted];
    });
}
exports.default = getTradeState;
//# sourceMappingURL=getTradeState.js.map