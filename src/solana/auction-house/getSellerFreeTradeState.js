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
const getTradeState_1 = __importDefault(require("solana/auction-house/getTradeState"));
function getFreeTradeState({ wallet, tokenAccount, tokenMint, auctionHouse, treasuryMint, auctionHouseProgramId, tokenSize = 1, }) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, getTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            priceInLamports: 0,
            tokenAccount,
            tokenMint,
            tokenSize,
            treasuryMint,
            wallet,
        });
    });
}
exports.default = getFreeTradeState;
