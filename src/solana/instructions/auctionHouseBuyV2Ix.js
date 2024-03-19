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
const formfunction_program_shared_1 = require("@formfunction-hq/formfunction-program-shared");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = require("bn.js");
const getTradeState_1 = __importDefault(require("solana/auction-house/getTradeState"));
const findAuctionHouseBuyerEscrow_1 = __importDefault(require("solana/pdas/findAuctionHouseBuyerEscrow"));
const findLastBidPrice_1 = __importDefault(require("solana/pdas/findLastBidPrice"));
const getWalletIfNativeElseAta_1 = __importDefault(require("solana/utils/getWalletIfNativeElseAta"));
function auctionHouseBuyV2Ix({ program, walletBuyer, tokenAccount, tokenMint, priceInLamports, treasuryMint, authority, auctionHouse, auctionHouseProgramId, feeAccount, previousBidderRefundAccount, previousBidderWallet, }, { auctionEndTime, tokenSize = 1 }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [tradeState, tradeBump, buyPriceAdjusted] = yield (0, getTradeState_1.default)({
            auctionHouse,
            auctionHouseProgramId,
            priceInLamports,
            tokenAccount,
            tokenMint,
            treasuryMint,
            wallet: walletBuyer,
        });
        const [escrowPaymentAccount, escrowBump] = (0, findAuctionHouseBuyerEscrow_1.default)(auctionHouse, walletBuyer, tokenMint, auctionHouseProgramId);
        const [previousBidderEscrowPaymentAccount, previousBidderEscrowBump] = (0, findAuctionHouseBuyerEscrow_1.default)(auctionHouse, previousBidderWallet, tokenMint, auctionHouseProgramId);
        const [metadata] = (0, formfunction_program_shared_1.findTokenMetadataPda)(tokenMint);
        const [lastBidPrice] = (0, findLastBidPrice_1.default)(tokenMint, auctionHouseProgramId);
        const paymentAccount = yield (0, getWalletIfNativeElseAta_1.default)(walletBuyer, treasuryMint);
        return program.methods
            .buyV2(tradeBump, escrowBump, buyPriceAdjusted, new bn_js_1.BN(tokenSize), auctionEndTime == null ? null : new bn_js_1.BN(auctionEndTime.unix()), previousBidderEscrowBump)
            .accounts({
            ataProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            auctionHouse,
            auctionHouseFeeAccount: feeAccount,
            authority,
            buyerTradeState: tradeState,
            clock: anchor_1.web3.SYSVAR_CLOCK_PUBKEY,
            escrowPaymentAccount,
            lastBidPrice,
            metadata,
            paymentAccount,
            previousBidderEscrowPaymentAccount,
            previousBidderRefundAccount,
            // New from v1
            previousBidderWallet,
            rent: anchor_1.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: anchor_1.web3.SystemProgram.programId,
            tokenAccount,
            tokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            transferAuthority: walletBuyer,
            treasuryMint,
            wallet: walletBuyer,
        })
            .instruction();
    });
}
exports.default = auctionHouseBuyV2Ix;
