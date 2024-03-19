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
const web3_js_1 = require("@solana/web3.js");
const getTradeState_1 = __importDefault(require("solana/auction-house/getTradeState"));
function auctionHouseCreateTradeStateIx({ auctionHouse, auctionHouseFeeAccount, auctionHouseProgramId, authority, program, tokenAccount, tokenMint, treasuryMint, wallet, }, { allocationSize, priceInLamports, saleType, tokenSize = 1 }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [tradeState, tradeStateBump, buyPriceAdjusted] = yield (0, getTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            priceInLamports,
            tokenAccount,
            tokenMint,
            treasuryMint,
            wallet,
        });
        return program.methods
            .createTradeState(tradeStateBump, buyPriceAdjusted, new anchor_1.BN(tokenSize), saleType, allocationSize !== null && allocationSize !== void 0 ? allocationSize : null)
            .accounts({
            auctionHouse,
            auctionHouseFeeAccount,
            authority,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenAccount,
            tokenMint,
            tradeState,
            wallet,
        })
            .instruction();
    });
}
exports.default = auctionHouseCreateTradeStateIx;
