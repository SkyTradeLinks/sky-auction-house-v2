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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const findAuctionHouseBuyerEscrow_1 = __importDefault(require("solana/pdas/findAuctionHouseBuyerEscrow"));
function auctionHouseDepositIx({ program, wallet, feeAccount, paymentAccount, transferAuthority = web3_js_1.SystemProgram.programId, tokenMint, authority, auctionHouse, treasuryMint, auctionHouseProgramId, }, { amount }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [escrowPaymentAccount, escrowBump] = (0, findAuctionHouseBuyerEscrow_1.default)(auctionHouse, wallet, tokenMint, auctionHouseProgramId);
        return program.methods
            .deposit(escrowBump, new bn_js_1.BN(amount))
            .accounts({
            auctionHouse,
            auctionHouseFeeAccount: feeAccount,
            authority,
            escrowPaymentAccount,
            paymentAccount,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            transferAuthority,
            treasuryMint,
            wallet,
        })
            .instruction();
    });
}
exports.default = auctionHouseDepositIx;
//# sourceMappingURL=auctionHouseDepositIx.js.map